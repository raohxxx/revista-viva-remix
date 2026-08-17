import { daysUntil } from "@/lib/format";
import {
  SIGNAL_LABEL,
  type RetentionAction,
  type RiskLevel,
  type SignalKey,
  type SubscriberWithRisk,
} from "@/types/domain";

export interface OverviewMetrics {
  totalActive: number;
  highRisk: number;
  highRiskPct: number;
  critical: number;
  revenueAtRisk: number;
  renewals30d: number;
  churnObserved: number;
  distribution: { level: RiskLevel; label: string; count: number }[];
}

const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

export function computeOverview(
  items: SubscriberWithRisk[],
  actions: RetentionAction[],
): OverviewMetrics {
  const totalActive = items.length;
  const highRisk = items.filter(
    (i) => i.prediction.level === "high" || i.prediction.level === "critical",
  );
  const critical = items.filter((i) => i.prediction.level === "critical");
  const revenueAtRisk = highRisk.reduce((sum, i) => sum + i.subscriber.monthly_value, 0);
  const renewals30d = items.filter((i) => {
    const days = daysUntil(i.subscriber.renewal_date);
    return days != null && days >= 0 && days <= 30;
  }).length;

  const levels: RiskLevel[] = ["low", "medium", "high", "critical"];

  return {
    totalActive,
    highRisk: highRisk.length,
    highRiskPct: totalActive === 0 ? 0 : (highRisk.length / totalActive) * 100,
    critical: critical.length,
    revenueAtRisk,
    renewals30d,
    churnObserved: actions.filter((a) => a.outcome === "Canceló").length,
    distribution: levels.map((level) => ({
      level,
      label: LEVEL_LABEL[level],
      count: items.filter((i) => i.prediction.level === level).length,
    })),
  };
}

export interface SignalRanking {
  key: SignalKey;
  label: string;
  affected: number;
}

export function computeSignalRanking(items: SubscriberWithRisk[]): SignalRanking[] {
  const counts = new Map<SignalKey, number>();
  for (const item of items) {
    for (const signal of item.prediction.signals) {
      if (signal.points <= 0) continue;
      counts.set(signal.key, (counts.get(signal.key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([key, affected]) => ({ key, label: SIGNAL_LABEL[key] ?? key, affected }))
    .sort((a, b) => b.affected - a.affected);
}

export interface EffectivenessRow {
  actionType: string;
  interventions: number;
  retained: number;
  effectiveness: number | null;
}

export function computeEffectivenessByAction(actions: RetentionAction[]): EffectivenessRow[] {
  const map = new Map<string, { interventions: number; known: number; retained: number }>();
  for (const action of actions) {
    const entry = map.get(action.action_type) ?? { interventions: 0, known: 0, retained: 0 };
    entry.interventions += 1;
    if (action.outcome === "Retenido" || action.outcome === "Canceló" || action.outcome === "Sin respuesta") {
      entry.known += 1;
      if (action.outcome === "Retenido") entry.retained += 1;
    }
    map.set(action.action_type, entry);
  }
  return [...map.entries()]
    .map(([actionType, e]) => ({
      actionType,
      interventions: e.interventions,
      retained: e.retained,
      effectiveness: e.known === 0 ? null : (e.retained / e.known) * 100,
    }))
    .sort((a, b) => b.interventions - a.interventions);
}

export interface FunnelMetrics {
  total: number;
  atRisk: number;
  intervened: number;
  retained: number;
  effectiveness: number | null;
  interventionRate: number;
  criticalContacted: number;
  criticalTotal: number;
  revenueRetained: number;
  revenueAtRisk: number;
}

export function computeFunnel(
  items: SubscriberWithRisk[],
  actions: RetentionAction[],
): FunnelMetrics {
  const atRisk = items.filter(
    (i) => i.prediction.level === "high" || i.prediction.level === "critical",
  );
  const atRiskIds = new Set(atRisk.map((i) => i.subscriber.id));
  const intervenedIds = new Set(actions.filter((a) => atRiskIds.has(a.subscriber_id)).map((a) => a.subscriber_id));

  const knownOutcome = actions.filter(
    (a) => a.outcome === "Retenido" || a.outcome === "Canceló" || a.outcome === "Sin respuesta",
  );
  const retainedIds = new Set(
    actions.filter((a) => a.outcome === "Retenido").map((a) => a.subscriber_id),
  );

  const criticalItems = items.filter((i) => i.prediction.level === "critical");
  const contactedIds = new Set(actions.map((a) => a.subscriber_id));

  const revenueRetained = items
    .filter((i) => retainedIds.has(i.subscriber.id))
    .reduce((sum, i) => sum + i.subscriber.monthly_value, 0);

  return {
    total: items.length,
    atRisk: atRisk.length,
    intervened: intervenedIds.size,
    retained: [...retainedIds].filter((id) => atRiskIds.has(id)).length,
    effectiveness:
      knownOutcome.length === 0
        ? null
        : (knownOutcome.filter((a) => a.outcome === "Retenido").length / knownOutcome.length) * 100,
    interventionRate: atRisk.length === 0 ? 0 : (intervenedIds.size / atRisk.length) * 100,
    criticalContacted: criticalItems.filter((i) => contactedIds.has(i.subscriber.id)).length,
    criticalTotal: criticalItems.length,
    revenueRetained,
    revenueAtRisk: atRisk.reduce((sum, i) => sum + i.subscriber.monthly_value, 0),
  };
}

/** Top prioridades del día: riesgo + renovación + ausencia de intervención. */
export function computeTodayPriorities(items: SubscriberWithRisk[], limit = 5): SubscriberWithRisk[] {
  return [...items]
    .filter((i) => i.prediction.level === "high" || i.prediction.level === "critical")
    .sort((a, b) => b.priorityScore - a.priorityScore || b.prediction.score - a.prediction.score)
    .slice(0, limit);
}
