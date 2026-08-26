import { Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  tooltip?: string;
  icon?: LucideIcon;
  accent?: "default" | "high" | "critical" | "positive";
  children?: ReactNode;
}

const ACCENT: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  default: "text-foreground",
  high: "text-risk-high",
  critical: "text-risk-critical",
  positive: "text-risk-low",
};

export function MetricCard({
  label,
  value,
  hint,
  tooltip,
  icon: Icon,
  accent = "default",
  children,
}: MetricCardProps) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Definición de ${label}`}
                  className="text-muted-foreground"
                >
                  <Info className="h-3.5 w-3.5" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />}
      </div>
      <p className={cn("tabular mt-2 text-2xl font-semibold", ACCENT[accent])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </Card>
  );
}
