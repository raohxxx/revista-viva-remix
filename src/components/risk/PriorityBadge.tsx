import { classifyPriority } from "@/services/riskEngine";
import { cn } from "@/lib/utils";
import { PRIORITY_LABEL, type PriorityLevel } from "@/types/domain";

const STYLES: Record<PriorityLevel, string> = {
  very_high: "border-risk-critical/30 bg-risk-critical-soft text-risk-critical",
  high: "border-risk-high/30 bg-risk-high-soft text-risk-high",
  medium: "border-risk-medium/30 bg-risk-medium-soft text-risk-medium",
  low: "border-border bg-muted/50 text-muted-foreground",
};

/** Prioridad operativa: qué tan urgente es actuar sobre el cliente. */
export function PriorityBadge({
  score,
  showScore = true,
  className,
}: {
  score: number;
  showScore?: boolean;
  className?: string;
}) {
  const level = classifyPriority(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        STYLES[level],
        className,
      )}
    >
      {PRIORITY_LABEL[level]}
      {showScore && <span className="tabular opacity-70">{score}</span>}
    </span>
  );
}
