import { CalendarClock } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { InterventionDialog } from "@/components/interventions/InterventionDialog";
import { OutcomeBadge, StatusBadge } from "@/components/interventions/badges";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { RetentionAction } from "@/types/domain";

export function InterventionTimeline({
  actions,
  customerCode,
  subscriberId,
}: {
  actions: RetentionAction[];
  customerCode: string;
  subscriberId: string;
}) {
  if (actions.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Sin intervenciones registradas"
        description="Este suscriptor aún no ha sido contactado por el equipo de Retención."
      />
    );
  }

  return (
    <ol className="space-y-4">
      {actions.map((action) => (
        <li key={action.id} className="relative border-l border-border pl-5">
          <span className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDate(action.completed_at ?? action.scheduled_at ?? action.created_at)}
            </span>
            <span className="text-sm font-medium text-foreground">{action.action_type}</span>
            <StatusBadge status={action.status} />
            {action.outcome && <OutcomeBadge outcome={action.outcome} />}
          </div>
          {action.owner && (
            <p className="mt-0.5 text-xs text-muted-foreground">Responsable: {action.owner}</p>
          )}
          {action.notes && <p className="mt-1 text-sm text-muted-foreground">{action.notes}</p>}
          <InterventionDialog
            subscriberId={subscriberId}
            customerCode={customerCode}
            action={action}
            trigger={
              <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs">
                Actualizar
              </Button>
            }
          />
        </li>
      ))}
    </ol>
  );
}
