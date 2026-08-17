import { queryOptions, useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { fetchPortfolio } from "@/services/portfolioService";
import { fetchRulesConfig } from "@/services/rulesService";
import type { RiskHistoryRow } from "@/types/domain";

export const portfolioQuery = queryOptions({
  queryKey: ["portfolio"],
  queryFn: fetchPortfolio,
  staleTime: 30_000,
});

export const rulesQuery = queryOptions({
  queryKey: ["risk-rules"],
  queryFn: fetchRulesConfig,
  staleTime: 60_000,
});

export const riskHistoryQuery = queryOptions({
  queryKey: ["risk-history"],
  queryFn: async (): Promise<RiskHistoryRow[]> => {
    const { data, error } = await supabase
      .from("risk_history")
      .select("*")
      .order("snapshot_date", { ascending: true });
    if (error) throw new Error(`No fue posible cargar el histórico de riesgo: ${error.message}`);
    return data ?? [];
  },
  staleTime: 60_000,
});

export function usePortfolio() {
  return useQuery(portfolioQuery);
}

export function useRules() {
  return useQuery(rulesQuery);
}

export function useRiskHistory() {
  return useQuery(riskHistoryQuery);
}
