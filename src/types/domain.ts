import type { Database } from "@/integrations/supabase/types";

export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
export type SubscriberInsert = Database["public"]["Tables"]["subscribers"]["Insert"];
export type RiskAssessmentRow = Database["public"]["Tables"]["risk_assessments"]["Row"];
export type RetentionAction = Database["public"]["Tables"]["retention_actions"]["Row"];
export type RiskRuleRow = Database["public"]["Tables"]["risk_rules"]["Row"];
export type RiskHistoryRow = Database["public"]["Tables"]["risk_history"]["Row"];

export type RiskLevel = "low" | "medium" | "high" | "critical";

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

export type SignalKey =
  | "activity_drop"
  | "inactivity"
  | "payment_failures"
  | "renewal_proximity"
  | "low_satisfaction"
  | "complaints";

export const SIGNAL_LABEL: Record<SignalKey, string> = {
  activity_drop: "Caída de actividad",
  inactivity: "Inactividad prolongada",
  payment_failures: "Pago rechazado",
  renewal_proximity: "Renovación próxima",
  low_satisfaction: "Baja satisfacción",
  complaints: "Reclamos recientes",
};

/** Señal que contribuye al Risk Score, con su aporte en puntos. */
export interface RiskSignal {
  key: SignalKey;
  label: string;
  detail: string;
  points: number;
  maxPoints: number;
}

/** Resultado del motor de riesgo (contrato estable para un modelo ML futuro). */
export interface RiskPrediction {
  score: number;
  level: RiskLevel;
  signals: RiskSignal[];
  principalReason: string;
  principalSignalKey: SignalKey | null;
  recommendedAction: string;
}

/** Regla de riesgo normalizada para el motor. */
export interface RiskRule {
  id: string;
  ruleKey: SignalKey;
  name: string;
  description: string;
  enabled: boolean;
  weight: number;
  configuration: Record<string, number>;
}

export interface RiskThresholds {
  medium: number;
  high: number;
  critical: number;
}

export const DEFAULT_THRESHOLDS: RiskThresholds = { medium: 25, high: 50, critical: 75 };

/** Suscriptor + evaluación de riesgo + estado de intervención. */
export interface SubscriberWithRisk {
  subscriber: Subscriber;
  prediction: RiskPrediction;
  priorityScore: number;
  interventionStatus: "none" | "open" | "completed";
  lastActionAt: string | null;
}

export const ACTION_TYPES = [
  "Llamada",
  "Email",
  "WhatsApp",
  "Oferta",
  "Seguimiento",
  "Encuesta",
  "Contenido personalizado",
  "Soporte de pago",
  "Otro",
] as const;

export const ACTION_STATUSES = ["Pendiente", "Programada", "En curso", "Completada"] as const;

export const ACTION_OUTCOMES = [
  "Retenido",
  "Sin respuesta",
  "Seguimiento pendiente",
  "Rechazó oferta",
  "Canceló",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
export type ActionStatus = (typeof ACTION_STATUSES)[number];
export type ActionOutcome = (typeof ACTION_OUTCOMES)[number];

/** Equipo de Retención (datos de demostración). */
export const TEAM_MEMBERS = ["Jorge Molina", "Camila Soto", "Luis Herrera"] as const;

/** Señal dominante: causa principal del riesgo, en lenguaje de negocio. */
export interface DominantSignalMeta {
  emoji: string;
  label: string;
}

export const DOMINANT_SIGNAL: Record<SignalKey, DominantSignalMeta> = {
  payment_failures: { emoji: "💳", label: "Problemas de pago" },
  activity_drop: { emoji: "📉", label: "Caída de engagement" },
  inactivity: { emoji: "📉", label: "Inactividad prolongada" },
  low_satisfaction: { emoji: "😡", label: "Insatisfacción" },
  renewal_proximity: { emoji: "📅", label: "Renovación próxima" },
  complaints: { emoji: "🆘", label: "Soporte / reclamos" },
};

export const NO_DOMINANT_SIGNAL: DominantSignalMeta = {
  emoji: "✅",
  label: "Sin señales importantes",
};

export type PriorityLevel = "very_high" | "high" | "medium" | "low";

export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  very_high: "Muy alta",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

/** Recomendación operativa derivada de las señales activas. */
export interface Recommendation {
  action: string;
  reason: string;
  urgency: "Inmediata" | "Esta semana" | "Programada" | "Sin urgencia";
  actionType: ActionType;
}
