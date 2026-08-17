import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Pendiente: "bg-muted text-muted-foreground border-border",
  Programada: "bg-accent text-accent-foreground border-border",
  "En curso": "bg-risk-medium-soft text-risk-medium border-risk-medium/30",
  Completada: "bg-risk-low-soft text-risk-low border-risk-low/25",
};

const OUTCOME_STYLES: Record<string, string> = {
  Retenido: "bg-risk-low-soft text-risk-low border-risk-low/25",
  Canceló: "bg-risk-critical-soft text-risk-critical border-risk-critical/30",
  "Sin respuesta": "bg-muted text-muted-foreground border-border",
  "Seguimiento pendiente": "bg-risk-medium-soft text-risk-medium border-risk-medium/30",
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Pill label={status} className={STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border"} />;
}

export function OutcomeBadge({ outcome }: { outcome: string }) {
  return <Pill label={outcome} className={OUTCOME_STYLES[outcome] ?? "bg-muted text-muted-foreground border-border"} />;
}
