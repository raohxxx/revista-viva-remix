import { daysSince, daysUntil, percentChange } from "@/lib/format";
import {
  DEFAULT_THRESHOLDS,
  SIGNAL_LABEL,
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

type SignalEvaluator = (subscriber: Subscriber, rule: RiskRule) => Omit<RiskSignal, "key" | "label" | "maxPoints"> | null;

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
    if (days < 0) return { detail: `Renovación vencida hace ${Math.abs(days)} días`, points: rule.weight };
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

const RECOMMENDATIONS: Record<SignalKey, string> = {
  activity_drop: "Enviar selección personalizada de contenidos relevantes.",
  inactivity: "Reactivar con un resumen de lo más leído y recordatorio de beneficios.",
  payment_failures: "Contactar para actualizar el medio de pago.",
  renewal_proximity: "Intervención prioritaria antes de la renovación.",
  low_satisfaction: "Contactar para comprender la causa de insatisfacción.",
  complaints: "Contacto personalizado desde Retención.",
};

const PRINCIPAL_REASONS: Record<SignalKey, string> = {
  activity_drop: "Reducción significativa de actividad",
  inactivity: "Inactividad prolongada en la plataforma",
  payment_failures: "Problemas en el cobro de la suscripción",
  renewal_proximity: "Renovación próxima con riesgo elevado",
  low_satisfaction: "Baja satisfacción declarada",
  complaints: "Reclamos recientes sin resolución",
};

export function classifyRisk(score: number, thresholds: RiskThresholds = DEFAULT_THRESHOLDS): RiskLevel {
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

  const renewalSoon = (daysUntil(subscriber.renewal_date) ?? 999) <= 15;
  const escalate = renewalSoon && (level === "high" || level === "critical");

  return {
    score,
    level,
    signals: signals.sort((a, b) => b.points - a.points),
    principalSignalKey: principal?.key ?? null,
    principalReason: principal
      ? PRINCIPAL_REASONS[principal.key]
      : "Sin señales de riesgo relevantes",
    recommendedAction: escalate
      ? "Intervención prioritaria antes de la renovación."
      : principal
        ? RECOMMENDATIONS[principal.key]
        : "Mantener seguimiento estándar. No requiere intervención.",
  };
}

/**
 * Prioridad operacional (distinta del Risk Score): combina riesgo,
 * cercanía de renovación, valor económico y señales críticas.
 * Fórmula transparente, normalizada de 0 a 100.
 */
export function calculatePriorityScore(
  subscriber: Subscriber,
  prediction: RiskPrediction,
  hasRecentIntervention: boolean,
): number {
  const riskFactor = prediction.score * 0.55;

  const days = daysUntil(subscriber.renewal_date);
  const renewalUrgency = days == null ? 0 : clamp((60 - days) / 60, 0, 1) * 20;

  const customerValueFactor = clamp(monthlyRevenue(subscriber) / 15000, 0, 1) * 15;

  const paymentIssue = (subscriber.payment_failures_90d ?? 0) > 0 ? 8 : 0;
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

/** Explicación en lenguaje sencillo construida desde las señales activas. */
export function buildExplanation(subscriber: Subscriber, prediction: RiskPrediction): string {
  const active = prediction.signals.filter((s) => s.points > 0).map((s) => s.key);
  if (active.length === 0) {
    return "Este cliente no presenta señales relevantes de riesgo: su actividad, pagos y satisfacción se mantienen dentro de los rangos esperados.";
  }

  const phrases: string[] = [];
  if (active.includes("activity_drop")) phrases.push("una caída relevante de su actividad");
  if (active.includes("inactivity")) phrases.push("varios días sin ingresar a la plataforma");
  if (active.includes("payment_failures")) phrases.push("problemas en el cobro de su suscripción");
  if (active.includes("low_satisfaction")) phrases.push("una satisfacción declarada baja");
  if (active.includes("complaints")) phrases.push("reclamos recientes en soporte");

  const days = daysUntil(subscriber.renewal_date);
  const renewalPhrase =
    active.includes("renewal_proximity") && days != null
      ? days < 0
        ? " Su renovación ya venció, por lo que la gestión es inmediata."
        : ` Su renovación ocurre en ${days} día(s), por lo que conviene intervenir antes de esa fecha.`
      : "";

  const list =
    phrases.length === 0
      ? "una renovación muy próxima"
      : phrases.length === 1
        ? phrases[0]
        : `${phrases.slice(0, -1).join(", ")} y ${phrases[phrases.length - 1]}`;

  return `Este cliente presenta ${list}.${renewalPhrase}`;
}

/**
 * Motor de recomendaciones por reglas: la acción depende de la combinación
 * real de señales activas, no de textos genéricos.
 */
export function buildRecommendation(
  subscriber: Subscriber,
  prediction: RiskPrediction,
): Recommendation {
  const active = new Set(prediction.signals.filter((s) => s.points > 0).map((s) => s.key));
  const days = daysUntil(subscriber.renewal_date);
  const renewalSoon = days != null && days <= 15;
  const criticalCount = [
    active.has("payment_failures"),
    active.has("low_satisfaction"),
    active.has("complaints"),
    active.has("activity_drop"),
  ].filter(Boolean).length;

  if (criticalCount >= 3) {
    return {
      action: "Priorizar llamada personalizada del equipo de Retención.",
      reason: "Concentra varias señales críticas al mismo tiempo.",
      urgency: "Inmediata",
      actionType: "Llamada",
    };
  }

  if (active.has("payment_failures")) {
    return {
      action: "Contactar al cliente para actualizar el medio de pago antes de la renovación.",
      reason: `Registra ${subscriber.payment_failures_90d} intento(s) de cobro rechazado(s) en los últimos 90 días.`,
      urgency: renewalSoon ? "Inmediata" : "Esta semana",
      actionType: "Soporte de pago",
    };
  }

  if (active.has("complaints")) {
    return {
      action: "Realizar seguimiento después de la resolución del reclamo.",
      reason: `Tiene ${subscriber.complaints_90d} reclamo(s) registrado(s) en los últimos 90 días.`,
      urgency: "Esta semana",
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
      reason: "Baja actividad con la renovación muy próxima.",
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
      reason: days == null ? "Renovación próxima." : `Renueva en ${days} día(s).`,
      urgency: "Programada",
      actionType: "Email",
    };
  }

  return {
    action: "Mantener seguimiento estándar. No requiere intervención.",
    reason: "No hay señales de riesgo relevantes.",
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
