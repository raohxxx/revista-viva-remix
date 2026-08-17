import { calculateRiskScore } from "@/services/riskEngine";
import {
  DEFAULT_THRESHOLDS,
  type RiskPrediction,
  type RiskRule,
  type RiskThresholds,
  type Subscriber,
} from "@/types/domain";

/**
 * Capa de abstracción entre la aplicación y el modelo de churn.
 *
 * Hoy la predicción proviene del motor heurístico local (`riskEngine`).
 * Para reemplazarlo por un modelo de Machine Learning basta registrar otro
 * proveedor que respete el mismo contrato `RiskPrediction`, por ejemplo:
 *
 *   setChurnPredictionProvider({
 *     async predictBatch(subscribers) {
 *       const res = await fetch("/api/predict-churn", {
 *         method: "POST",
 *         body: JSON.stringify({ subscribers }),
 *       });
 *       return (await res.json()) as RiskPrediction[];
 *     },
 *   });
 *
 * Ningún componente de UI depende del motor heurístico directamente.
 */
export interface ChurnPredictionProvider {
  readonly name: string;
  predictBatch(
    subscribers: Subscriber[],
    rules: RiskRule[],
    thresholds: RiskThresholds,
  ): Promise<RiskPrediction[]>;
}

const heuristicProvider: ChurnPredictionProvider = {
  name: "heuristic-v1",
  async predictBatch(subscribers, rules, thresholds) {
    return subscribers.map((subscriber) => calculateRiskScore(subscriber, rules, thresholds));
  },
};

let activeProvider: ChurnPredictionProvider = heuristicProvider;

export function setChurnPredictionProvider(provider: ChurnPredictionProvider): void {
  activeProvider = provider;
}

export function getChurnPredictionProviderName(): string {
  return activeProvider.name;
}

export async function predictChurnBatch(
  subscribers: Subscriber[],
  rules: RiskRule[],
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): Promise<RiskPrediction[]> {
  if (subscribers.length === 0) return [];
  return activeProvider.predictBatch(subscribers, rules, thresholds);
}

export async function predictChurn(
  subscriber: Subscriber,
  rules: RiskRule[],
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): Promise<RiskPrediction> {
  const [prediction] = await predictChurnBatch([subscriber], rules, thresholds);
  return prediction!;
}
