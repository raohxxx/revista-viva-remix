import { cn } from "@/lib/utils";
import { DOMINANT_SIGNAL, NO_DOMINANT_SIGNAL, type SignalKey } from "@/types/domain";

/** Señal dominante: causa principal del riesgo en lenguaje de negocio. */
export function DominantSignalBadge({
  signalKey,
  className,
  size = "sm",
}: {
  signalKey: SignalKey | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const meta = signalKey ? DOMINANT_SIGNAL[signalKey] : NO_DOMINANT_SIGNAL;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-muted/50 font-medium text-foreground",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className,
      )}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
