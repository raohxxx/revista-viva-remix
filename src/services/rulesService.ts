import { supabase } from "@/integrations/supabase/client";
import { mapRuleRow } from "@/services/riskEngine";
import { DEFAULT_THRESHOLDS, type RiskRule, type RiskThresholds } from "@/types/domain";

export const THRESHOLDS_RULE_KEY = "score_thresholds";

export interface RulesConfig {
  rules: RiskRule[];
  thresholds: RiskThresholds;
  thresholdsRuleId: string | null;
}

export async function fetchRulesConfig(): Promise<RulesConfig> {
  const { data, error } = await supabase.from("risk_rules").select("*").order("weight", { ascending: false });
  if (error) throw new Error(`No fue posible cargar las reglas del modelo: ${error.message}`);

  const rows = data ?? [];
  const thresholdRow = rows.find((row) => row.rule_key === THRESHOLDS_RULE_KEY);
  const config = (thresholdRow?.configuration ?? {}) as Partial<RiskThresholds>;

  return {
    rules: rows
      .filter((row) => row.rule_key !== THRESHOLDS_RULE_KEY)
      .map((row) => mapRuleRow({ ...row, weight: Number(row.weight) })),
    thresholds: {
      medium: Number(config.medium ?? DEFAULT_THRESHOLDS.medium),
      high: Number(config.high ?? DEFAULT_THRESHOLDS.high),
      critical: Number(config.critical ?? DEFAULT_THRESHOLDS.critical),
    },
    thresholdsRuleId: thresholdRow?.id ?? null,
  };
}

export async function updateRule(
  id: string,
  patch: { enabled?: boolean; weight?: number },
): Promise<void> {
  const { error } = await supabase.from("risk_rules").update(patch).eq("id", id);
  if (error) throw new Error(`No fue posible actualizar la regla: ${error.message}`);
}

export async function saveThresholds(thresholds: RiskThresholds): Promise<void> {
  const { error } = await supabase.from("risk_rules").upsert(
    {
      rule_key: THRESHOLDS_RULE_KEY,
      name: "Umbrales de clasificación",
      description: "Umbrales de corte para clasificar el Risk Score en Bajo, Medio, Alto y Crítico.",
      enabled: true,
      weight: 0,
      configuration: thresholds as unknown as Record<string, number>,
    },
    { onConflict: "rule_key" },
  );
  if (error) throw new Error(`No fue posible guardar los umbrales: ${error.message}`);
}
