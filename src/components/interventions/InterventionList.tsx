import { Check, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { useInterventions, type Intervention } from "@/state/interventions";

export function InterventionList({
  items,
  showCustomer = true,
}: {
  items: Intervention[];
  showCustomer?: boolean;
}) {
  const { completeIntervention, removeIntervention } = useInterventions();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Sin intervenciones registradas"
        description="Las gestiones que registres aparecerán aquí durante esta sesión."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
        >
          <div className="min-w-[200px] space-y-1">
            <p className="text-sm font-medium text-foreground">
              {showCustomer && <span className="tabular">{item.customer_code} · </span>}
              {item.action_type}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.owner} · registrada el {formatDateTime(item.created_at)}
              {item.completed_at ? ` · completada el ${formatDateTime(item.completed_at)}` : ""}
            </p>
            {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={item.status === "Completada" ? "secondary" : "outline"}>
              {item.status}
            </Badge>
            {item.status === "Pendiente" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => completeIntervention(item.id)}
                aria-label={`Marcar como completada la intervención de ${item.customer_code}`}
              >
                <Check className="h-4 w-4" aria-hidden />
                Completar
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeIntervention(item.id)}
              aria-label={`Eliminar intervención de ${item.customer_code}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
