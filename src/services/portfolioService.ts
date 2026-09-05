import { supabase } from "@/integrations/supabase/client";
import { predictChurnBatch } from "@/services/churnPrediction";
import { calculatePriorityScore } from "@/services/riskEngine";
import { fetchRulesConfig } from "@/services/rulesService";
import type {
  RetentionAction,
  RiskPrediction,
  RiskRule,
  RiskSignal,
  RiskThresholds,
  SignalKey,
  Subscriber,
  SubscriberWithRisk,
} from "@/types/domain";

export interface Portfolio {
  items: SubscriberWithRisk[];
  actions: RetentionAction[];
  byId: Map<string, SubscriberWithRisk>;
  /** Reglas y umbrales vigentes usados para puntuar esta carga. */
  rules: RiskRule[];
  thresholds: RiskThresholds;
}

const OPEN_STATUSES = new Set(["Pendiente", "Programada", "En curso"]);

async function fetchSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabase.from("subscribers").select("*").order("customer_code");
  if (error) throw new Error(`No fue posible cargar los suscriptores: ${error.message}`);
  return data ?? [];
}

export async function fetchActions(): Promise<RetentionAction[]> {
  const { data, error } = await supabase
    .from("retention_actions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No fue posible cargar las intervenciones: ${error.message}`);
  return data ?? [];
}

function predictionFromRow(row: {
  risk_score: number;
  risk_level: string;
  principal_reason: string;
  principal_signal_key: string | null;
  contributing_signals: unknown;
  recommended_action: string;
}): RiskPrediction {
  return {
    score: row.risk_score,
    level: row.risk_level as RiskPrediction["level"],
    signals: (row.contributing_signals ?? []) as RiskSignal[],
    principalReason: row.principal_reason,
    principalSignalKey: (row.principal_signal_key ?? null) as SignalKey | null,
    recommendedAction: row.recommended_action,
  };
}

/**
 * Carga el portafolio completo: suscriptores + evaluación de riesgo persistida
 * + estado de intervención. Si faltan evaluaciones, se calculan y persisten.
 */
export async function fetchPortfolio(): Promise<Portfolio> {
  const [subscribers, actions, config] = await Promise.all([
    fetchSubscribers(),
    fetchActions(),
    fetchRulesConfig(),
  ]);

  // Las señales se recalculan siempre con las reglas vigentes y la fecha de hoy,
  // para que la explicación mostrada nunca quede desfasada del snapshot guardado.
  const predictions = await predictChurnBatch(subscribers, config.rules, config.thresholds);

  const actionsBySubscriber = new Map<string, RetentionAction[]>();
  for (const action of actions) {
    const list = actionsBySubscriber.get(action.subscriber_id) ?? [];
    list.push(action);
    actionsBySubscriber.set(action.subscriber_id, list);
  }

  const items: SubscriberWithRisk[] = subscribers.map((subscriber, index) => {
    const prediction: RiskPrediction = predictions[index]!;

    const subscriberActions = actionsBySubscriber.get(subscriber.id) ?? [];
    const hasOpen = subscriberActions.some((a) => OPEN_STATUSES.has(a.status));
    const interventionStatus: SubscriberWithRisk["interventionStatus"] =
      subscriberActions.length === 0 ? "none" : hasOpen ? "open" : "completed";

    return {
      subscriber,
      prediction,
      priorityScore: calculatePriorityScore(
        subscriber,
        prediction,
        subscriberActions.length > 0,
        config.rules,
      ),
      interventionStatus,
      lastActionAt: subscriberActions[0]?.created_at ?? null,
    };
  });

  return {
    items,
    actions,
    byId: new Map(items.map((item) => [item.subscriber.id, item])),
    rules: config.rules,
    thresholds: config.thresholds,
  };
}

/** Recalcula y persiste el Risk Score de todos los suscriptores. */
export async function recalculateScores(): Promise<number> {
  const [subscribers, config, actions] = await Promise.all([
    fetchSubscribers(),
    fetchRulesConfig(),
    fetchActions(),
  ]);

  const withAction = new Set(actions.map((a) => a.subscriber_id));
  const predictions = await predictChurnBatch(subscribers, config.rules, config.thresholds);

  const rows = subscribers.map((subscriber, index) => {
    const prediction = predictions[index]!;
    return {
      subscriber_id: subscriber.id,
      risk_score: prediction.score,
      risk_level: prediction.level,
      principal_reason: prediction.principalReason,
      principal_signal_key: prediction.principalSignalKey,
      contributing_signals: prediction.signals as unknown as never,
      recommended_action: prediction.recommendedAction,
      priority_score: calculatePriorityScore(
        subscriber,
        prediction,
        withAction.has(subscriber.id),
        config.rules,
      ),
      calculated_at: new Date().toISOString(),
    };
  });

  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase
      .from("risk_assessments")
      .upsert(rows.slice(i, i + 200), { onConflict: "subscriber_id" });
    if (error) throw new Error(`No fue posible guardar los puntajes: ${error.message}`);
  }

  return rows.length;
}
