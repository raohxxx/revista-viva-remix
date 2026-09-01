import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type PeriodValue = "7" | "30" | "90";

export const PERIOD_OPTIONS: { value: PeriodValue; label: string }[] = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
];

interface ShellState {
  period: PeriodValue;
  setPeriod: (value: PeriodValue) => void;
}

const ShellContext = createContext<ShellState>({ period: "30", setPeriod: () => {} });

export function ShellProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodValue>("30");
  const value = useMemo(() => ({ period, setPeriod }), [period]);
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellState {
  return useContext(ShellContext);
}
