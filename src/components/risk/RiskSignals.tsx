import { RISK_BAR_COLOR } from "@/components/risk/RiskBadge";
import { cn } from "@/lib/utils";
import type { RiskPrediction } from "@/types/domain";

/** Explicabilidad: aporte de cada señal al Risk Score. */
export function RiskSignals({ prediction }: { prediction: RiskPrediction }) {
  const active = prediction.signals.filter((signal) => signal.points > 0);
  const inactive = prediction.signals.filter((signal) => signal.points === 0);

  if (active.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ninguna regla activa aporta puntos para este suscriptor. Su comportamiento se mantiene dentro
        de los rangos esperados.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {active.map((signal) => (
          <li key={signal.key} className="space-y-1.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{signal.label}</p>
                <p className="text-xs text-muted-foreground">{signal.detail}</p>
              </div>
              <span className="tabular shrink-0 text-sm font-semibold text-foreground">
                +{signal.points} pts
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <span
                className={cn("block h-full rounded-full", RISK_BAR_COLOR[prediction.level])}
                style={{ width: `${(signal.points / Math.max(signal.maxPoints, 1)) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Aporte máximo de la regla: {signal.maxPoints} pts
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="font-medium text-foreground">Total Risk Score</span>
        <span className="tabular font-semibold text-foreground">
          {active.reduce((sum, signal) => sum + signal.points, 0)} / 100
        </span>
      </div>

      {inactive.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">
            Señales evaluadas sin aporte ({inactive.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {inactive.map((signal) => (
              <li key={signal.key}>
                <span className="text-foreground">{signal.label}:</span> {signal.detail}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
