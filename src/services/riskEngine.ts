import { daysSince, daysUntil, monthlyRevenue, percentChange } from "@/lib/format";
import {
  DEFAULT_THRESHOLDS,
  SIGNAL_LABEL,
  type PriorityLevel,
  type Recommendation,
  type RiskLevel,
  type RiskPrediction,
  type RiskRule,
  type RiskSignal,
  type RiskThresholds,
  type SignalKey,
  type Subscriber,
} from "@/types/domain";

/**
 * Motor heurístico explicable de Risk Score (0-100).
 * Los pesos son valores de demostración: deben calibrarse con datos históricos.
 * Toda la lógica de scoring vive aquí; los componentes solo consumen el resultado.
 */

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Interpola linealmente el aporte de una señal entre un umbral y su máximo. */
function ramp(value: number, from: number, to: number): number {
  if (to === from) return value >= to ? 1 : 0;
  return clamp((value - from) / (to - from), 0, 1);
}

function num(config: Record<string, number>, key: string, fallback: number): number {
  const value = config[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

type SignalEvaluator = (
  subscriber: Subscriber,
  rule: RiskRule,
) => Omit<RiskSignal, "key" | "label" | "maxPoints"> | null;

const evaluators: Record<SignalKey, SignalEvaluator> = {
  activity_drop: (s, rule) => {
    const change = percentChange(s.sessions_30d, s.sessions_previous_30d);
    if (change == null) {
      if (s.sessions_30d === 0 && s.sessions_previous_30d === 0) {
        return {
          detail: "Sin sesiones registradas en ambos períodos",
          points: rule.weight * 0.6,
        };
      }
      return { detail: "Sin período de comparación disponible", points: 0 };
    }
    const threshold = num(rule.configuration, "threshold_pct", -15);
    const maxDrop = num(rule.configuration, "max_drop_pct", -60);
    if (change >= threshold) {
      return {
        detail: `${change >= 0 ? "+" : ""}${change.toFixed(0)}% de sesiones vs. período anterior`,
        points: 0,
      };
    }
    const intensity = ramp(change, threshold, maxDrop);
    return {
      detail: `${change.toFixed(0)}% de sesiones respecto del período anterior (${s.sessions_30d} vs. ${s.sessions_previous_30d})`,
      points: rule.weight * intensity,
    };
  },

  inactivity: (s, rule) => {
    const days = daysSince(s.last_access_at);
    if (days == null) return { detail: "Sin registro de último acceso", points: rule.weight * 0.5 };
    const threshold = num(rule.configuration, "threshold_days", 7);
    const max = num(rule.configuration, "max_days", 30);
    if (days <= threshold) return { detail: `Último acceso hace ${days} día(s)`, points: 0 };
    return {
      detail: `${days} días sin actividad`,
      points: rule.weight * ramp(days, threshold, max),
    };
  },

  payment_failures: (s, rule) => {
    const failures = s.payment_failures_90d ?? 0;
    if (failures <= 0) return { detail: "Sin pagos rechazados en 90 días", points: 0 };
    const max = num(rule.configuration, "max_failures", 2);
    return {
      detail: `${failures} intento(s) de cobro rechazado(s) en 90 días`,
      points: rule.weight * clamp(failures / max, 0, 1),
    };
  },

  renewal_proximity: (s, rule) => {
    const days = daysUntil(s.renewal_date);
    if (days == null) return { detail: "Sin fecha de renovación", points: 0 };
    const threshold = num(rule.configuration, "threshold_days", 30);
    const critical = num(rule.configuration, "critical_days", 7);
    if (days > threshold) return { detail: `Renueva en ${days} días`, points: 0 };
    if (days < 0)
      return { detail: `Renovación vencida hace ${Math.abs(days)} días`, points: rule.weight };
    return {
      detail: `Renueva en ${days} día(s)`,
      points: rule.weight * ramp(days, threshold, critical),
    };
  },

  low_satisfaction: (s, rule) => {
    const score = s.satisfaction_score;
    if (score == null) return { detail: "Sin encuesta de satisfacción", points: 0 };
    const threshold = num(rule.configuration, "threshold_score", 7);
    const min = num(rule.configuration, "min_score", 3);
    if (score >= threshold) return { detail: `Satisfacción ${score}/10`, points: 0 };
    return {
      detail: `Satisfacción ${score}/10 (bajo el umbral de ${threshold})`,
      points: rule.weight * ramp(score, threshold, min),
    };
  },

  complaints: (s, rule) => {
    const complaints = s.complaints_90d ?? 0;
    if (complaints <= 0) return { detail: "Sin reclamos en 90 días", points: 0 };
    const max = num(rule.configuration, "max_complaints", 2);
    return {
      detail: `${complaints} reclamo(s) en los últimos 90 días`,
      points: rule.weight * clamp(complaints / max, 0, 1),
    };
  },
};

const PRINCIPAL_REASONS: Record<SignalKey, string> = {
  activity_drop: "Reducción significativa de actividad",
  inactivity: "Inactividad prolongada en la plataforma",
  payment_failures: "Problemas en el cobro de la suscripción",
  renewal_proximity: "Renovación próxima con riesgo elevado",
  low_satisfaction: "Baja satisfacción declarada",
  complaints: "Reclamos recientes sin resolución",
};

export function classifyRisk(
  score: number,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): RiskLevel {
  if (score >= thresholds.critical) return "critical";
  if (score >= thresholds.high) return "high";
  if (score >= thresholds.medium) return "medium";
  return "low";
}

/**
 * Calcula el Risk Score a partir de los datos del suscriptor y las reglas activas.
 * La suma de los aportes de las señales siempre coincide con el score entregado.
 */
export function calculateRiskScore(
  subscriber: Subscriber,
  rules: RiskRule[],
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): RiskPrediction {
  const signals: RiskSignal[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const evaluator = evaluators[rule.ruleKey];
    if (!evaluator) continue;
    const result = evaluator(subscriber, rule);
    if (!result) continue;
    signals.push({
      key: rule.ruleKey,
      label: SIGNAL_LABEL[rule.ruleKey] ?? rule.name,
      detail: result.detail,
      points: Math.round(clamp(result.points, 0, rule.weight)),
      maxPoints: Math.round(rule.weight),
    });
  }

  const rawScore = signals.reduce((sum, signal) => sum + signal.points, 0);
  const score = clamp(Math.round(rawScore), 0, 100);

  const contributing = [...signals].filter((s) => s.points > 0).sort((a, b) => b.points - a.points);
  const principal = contributing[0] ?? null;
  const level = classifyRisk(score, thresholds);

  const base: RiskPrediction = {
    score,
    level,
    signals: signals.sort((a, b) => b.points - a.points),
    principalSignalKey: principal?.key ?? null,
    principalReason: principal
      ? PRINCIPAL_REASONS[principal.key]
      : "Sin señales de riesgo relevantes",
    recommendedAction: "",
  };

  return { ...base, recommendedAction: buildRecommendation(subscriber, base).action };
}

/** Devuelve la regla vigente (habilitada) para una señal, si existe. */
export function activeRule(rules: RiskRule[] | undefined, key: SignalKey): RiskRule | null {
  const rule = rules?.find((r) => r.ruleKey === key);
  return rule && rule.enabled ? rule : null;
}

/** Ventana de renovación tomada de la regla vigente (con valores por defecto). */
function renewalWindow(rules?: RiskRule[]): {
  enabled: boolean;
  threshold: number;
  critical: number;
} {
  const rule = activeRule(rules, "renewal_proximity");
  return {
    enabled: Boolean(rule),
    threshold: rule ? num(rule.configuration, "threshold_days", 30) : 30,
    critical: rule ? num(rule.configuration, "critical_days", 7) : 7,
  };
}

/**
 * Prioridad operacional (distinta del Risk Score): combina riesgo,
 * cercanía de renovación, valor económico y señales críticas.
 * Fórmula transparente, normalizada de 0 a 100. Cuando se entregan las reglas
 * vigentes, la urgencia de renovación usa exactamente su ventana configurada.
 */
export function calculatePriorityScore(
  subscriber: Subscriber,
  prediction: RiskPrediction,
  hasRecentIntervention: boolean,
  rules?: RiskRule[],
): number {
  const riskFactor = prediction.score * 0.55;

  const days = daysUntil(subscriber.renewal_date);
  const window = renewalWindow(rules);
  // La urgencia empieza al doble de la ventana configurada y llega al máximo
  // en el umbral crítico de la misma regla.
  const start = window.threshold * 2;
  const renewalUrgency =
    days == null ? 0 : ramp(days, start, window.critical) * (days < 0 ? 20 : 20);

  const customerValueFactor = clamp(monthlyRevenue(subscriber) / 15000, 0, 1) * 15;

  const paymentRuleActive = !rules || Boolean(activeRule(rules, "payment_failures"));
  const paymentIssue = paymentRuleActive && (subscriber.payment_failures_90d ?? 0) > 0 ? 8 : 0;
  const criticalLevel = prediction.level === "critical" ? 4 : 0;
  const untouched = hasRecentIntervention ? 0 : 3;
  const criticalSignalBonus = paymentIssue + criticalLevel + untouched;

  return Math.round(
    clamp(riskFactor + renewalUrgency + customerValueFactor + criticalSignalBonus, 0, 100),
  );
}

export function classifyPriority(priorityScore: number): PriorityLevel {
  if (priorityScore >= 80) return "very_high";
  if (priorityScore >= 60) return "high";
  if (priorityScore >= 40) return "medium";
  return "low";
}

/** Señal dominante: la que más puntos aporta al Risk Score. */
export function dominantSignal(prediction: RiskPrediction): SignalKey | null {
  const contributing = prediction.signals
    .filter((signal) => signal.points > 0)
    .sort((a, b) => b.points - a.points);
  return contributing[0]?.key ?? null;
}

/** Frase por señal, construida con el detalle real evaluado por la regla. */
const SIGNAL_PHRASE: Record<SignalKey, (detail: string) => string> = {
  activity_drop: (d) => `una caída relevante de su actividad (${d.toLowerCase()})`,
  inactivity: (d) => `inactividad en la plataforma (${d.toLowerCase()})`,
  payment_failures: (d) => `problemas en el cobro de su suscripción (${d.toLowerCase()})`,
  low_satisfaction: (d) => `baja satisfacción declarada (${d.toLowerCase()})`,
  complaints: (d) => `reclamos recientes en soporte (${d.toLowerCase()})`,
  renewal_proximity: (d) => `una renovación próxima (${d.toLowerCase()})`,
};

/**
 * Explicación en lenguaje sencillo construida solo desde las señales
 * efectivamente activas según las reglas vigentes, indicando su aporte en
 * puntos y la fecha exacta de renovación del suscriptor.
 */
export function buildExplanation(subscriber: Subscriber, prediction: RiskPrediction): string {
  const active = prediction.signals
    .filter((s) => s.points > 0)
    .sort((a, b) => b.points - a.points);

  const days = daysUntil(subscriber.renewal_date);
  const renewalDate = formatDate(subscriber.renewal_date);
  const renewalPhrase =
    days == null
      ? ""
      : days < 0
        ? ` Su renovación venció el ${renewalDate} (hace ${Math.abs(days)} día(s)), por lo que la gestión es inmediata.`
        : days === 0
          ? ` Su renovación es hoy (${renewalDate}).`
          : ` Su renovación es el ${renewalDate}, en ${days} día(s).`;

  if (active.length === 0) {
    return `Con las reglas activas hoy, este cliente no acumula puntos de riesgo: su actividad, pagos y satisfacción están dentro de los rangos configurados.${renewalPhrase}`;
  }

  const parts = active
    .filter((s) => s.key !== "renewal_proximity")
    .map((s) => `${SIGNAL_PHRASE[s.key](s.detail)}: +${s.points} pts`);

  const renewalSignal = active.find((s) => s.key === "renewal_proximity");
  const list =
    parts.length === 0
      ? `proximidad de renovación: +${renewalSignal?.points ?? 0} pts`
      : parts.length === 1
        ? parts[0]
        : `${parts.slice(0, -1).join("; ")}; y ${parts[parts.length - 1]}`;

  const renewalPoints =
    renewalSignal && parts.length > 0 ? ` Suma además +${renewalSignal.points} pts por renovación próxima.` : "";

  return `Este cliente presenta ${list}. En total acumula ${prediction.score} de 100 puntos de riesgo (nivel ${prediction.level === "critical" ? "crítico" : prediction.level === "high" ? "alto" : prediction.level === "medium" ? "medio" : "bajo"}).${renewalPoints}${renewalPhrase}`;
}

/**
 * Motor de recomendaciones por reglas: la acción depende de la combinación
 * real de señales activas y de la ventana de renovación configurada.
 */
export function buildRecommendation(
  subscriber: Subscriber,
  prediction: RiskPrediction,
  rules?: RiskRule[],
): Recommendation {
  const active = new Set(prediction.signals.filter((s) => s.points > 0).map((s) => s.key));
  const days = daysUntil(subscriber.renewal_date);
  const window = renewalWindow(rules);
  const renewalSoon = days != null && days <= Math.max(window.critical, 15);
  const renewalDate = formatDate(subscriber.renewal_date);
  const criticalCount = [
    active.has("payment_failures"),
    active.has("low_satisfaction"),
    active.has("complaints"),
    active.has("activity_drop"),
  ].filter(Boolean).length;

  if (criticalCount >= 3) {
    return {
      action: "Priorizar llamada personalizada del equipo de Retención.",
      reason: `Concentra ${criticalCount} señales críticas activas al mismo tiempo.`,
      urgency: "Inmediata",
      actionType: "Llamada",
    };
  }

  if (active.has("payment_failures")) {
    return {
      action: "Contactar al cliente para actualizar el medio de pago antes de la renovación.",
      reason: `Registra ${subscriber.payment_failures_90d} intento(s) de cobro rechazado(s) en los últimos 90 días y renueva el ${renewalDate}.`,
      urgency: renewalSoon ? "Inmediata" : "Esta semana",
      actionType: "Soporte de pago",
    };
  }

  if (active.has("complaints")) {
    return {
      action: "Realizar seguimiento después de la resolución del reclamo.",
      reason: `Tiene ${subscriber.complaints_90d} reclamo(s) registrado(s) en los últimos 90 días.`,
      urgency: renewalSoon ? "Inmediata" : "Esta semana",
      actionType: "Seguimiento",
    };
  }

  if (active.has("low_satisfaction")) {
    return {
      action: "Realizar una llamada personalizada para comprender la causa de insatisfacción.",
      reason: `Su satisfacción declarada es ${subscriber.satisfaction_score}/10.`,
      urgency: renewalSoon ? "Inmediata" : "Esta semana",
      actionType: "Llamada",
    };
  }

  if (renewalSoon && (active.has("activity_drop") || active.has("inactivity"))) {
    return {
      action: "Contactar antes de la renovación y evaluar un incentivo de retención.",
      reason: `Baja actividad con la renovación del ${renewalDate}${days != null ? ` (en ${days} día(s))` : ""}.`,
      urgency: "Inmediata",
      actionType: "Oferta",
    };
  }

  if (active.has("activity_drop") || active.has("inactivity")) {
    return {
      action: "Reactivar engagement con contenido personalizado o comunicación dirigida.",
      reason: "Su consumo de contenidos cayó respecto del período anterior.",
      urgency: "Programada",
      actionType: "Contenido personalizado",
    };
  }

  if (active.has("renewal_proximity")) {
    return {
      action: "Enviar recordatorio de beneficios antes de la fecha de renovación.",
      reason:
        days == null
          ? "Renovación próxima."
          : `Renueva el ${renewalDate}, en ${days} día(s) (ventana configurada: ${window.threshold} días).`,
      urgency: renewalSoon ? "Esta semana" : "Programada",
      actionType: "Email",
    };
  }

  return {
    action: "Mantener seguimiento estándar. No requiere intervención.",
    reason: "Ninguna regla vigente registra puntos de riesgo para este cliente.",
    urgency: "Sin urgencia",
    actionType: "Email",
  };
}


export function mapRuleRow(row: {
  id: string;
  rule_key: string;
  name: string;
  description: string;
  enabled: boolean;
  weight: number;
  configuration: unknown;
}): RiskRule {
  return {
    id: row.id,
    ruleKey: row.rule_key as SignalKey,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    weight: Number(row.weight),
    configuration: (row.configuration ?? {}) as Record<string, number>,
  };
}
