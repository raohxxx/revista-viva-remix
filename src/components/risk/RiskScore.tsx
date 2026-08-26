import { Info } from "lucide-react";

import { RISK_BAR_COLOR, RISK_TEXT_COLOR } from "@/components/risk/RiskBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/domain";

export function RiskScoreTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Qué es el Risk Score"
        >
          <Info className="h-3.5 w-3.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        Risk Score: puntaje experimental de 0 a 100 que resume las señales asociadas a riesgo de
        abandono. Se calcula con reglas configurables, no con datos históricos calibrados.
      </TooltipContent>
    </Tooltip>
  );
}

/** Puntaje compacto con barra, para tablas y listados. */
export function RiskScoreInline({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("tabular w-8 text-sm font-semibold", RISK_TEXT_COLOR[level])}>
        {score}
      </span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full rounded-full", RISK_BAR_COLOR[level])}
          style={{ width: `${score}%` }}
        />
      </span>
    </div>
  );
}

/** Visualización principal del score en el perfil del cliente. */
export function RiskScoreGauge({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className={cn("tabular text-5xl font-semibold", RISK_TEXT_COLOR[level])}>
          {score}
        </span>
        <span className="text-lg text-muted-foreground">/ 100</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            RISK_BAR_COLOR[level],
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="tabular flex justify-between text-[11px] text-muted-foreground">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}
