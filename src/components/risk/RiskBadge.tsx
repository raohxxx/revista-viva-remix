import { cn } from "@/lib/utils";
import { RISK_LEVEL_LABEL, type RiskLevel } from "@/types/domain";

const STYLES: Record<RiskLevel, string> = {
  low: "bg-risk-low-soft text-risk-low border-risk-low/25",
  medium: "bg-risk-medium-soft text-risk-medium border-risk-medium/30",
  high: "bg-risk-high-soft text-risk-high border-risk-high/30",
  critical: "bg-risk-critical-soft text-risk-critical border-risk-critical/30",
};

export function RiskBadge({
  level,
  size = "sm",
  className,
}: {
  level: RiskLevel;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        STYLES[level],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {RISK_LEVEL_LABEL[level]}
    </span>
  );
}

export const RISK_TEXT_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low",
  medium: "text-risk-medium",
  high: "text-risk-high",
  critical: "text-risk-critical",
};

export const RISK_BAR_COLOR: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
};

export const RISK_HEX: Record<RiskLevel, string> = {
  low: "var(--risk-low)",
  medium: "var(--risk-medium)",
  high: "var(--risk-high)",
  critical: "var(--risk-critical)",
};
