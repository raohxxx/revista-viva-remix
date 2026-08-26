import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createIntervention, updateIntervention } from "@/services/interventionsService";
import {
  ACTION_OUTCOMES,
  ACTION_STATUSES,
  ACTION_TYPES,
  type ActionOutcome,
  type ActionStatus,
  type ActionType,
  type RetentionAction,
} from "@/types/domain";

interface InterventionDialogProps {
  subscriberId: string;
  customerCode: string;
  action?: RetentionAction;
  suggestedType?: ActionType;
  suggestedNote?: string;
  trigger: ReactNode;
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

export function InterventionDialog({
  subscriberId,
  customerCode,
  action,
  suggestedType,
  suggestedNote,
  trigger,
}: InterventionDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [actionType, setActionType] = useState<ActionType>(
    (action?.action_type as ActionType) ?? suggestedType ?? "Llamada",
  );
  const [owner, setOwner] = useState(action?.owner ?? "");
  const [date, setDate] = useState(toDateInput(action?.scheduled_at));
  const [notes, setNotes] = useState(action?.notes ?? suggestedNote ?? "");
  const [status, setStatus] = useState<ActionStatus>((action?.status as ActionStatus) ?? "Pendiente");
  const [outcome, setOutcome] = useState<ActionOutcome | "">((action?.outcome as ActionOutcome) ?? "");

  useEffect(() => {
    if (!open) return;
    setActionType((action?.action_type as ActionType) ?? suggestedType ?? "Llamada");
    setOwner(action?.owner ?? "");
    setDate(toDateInput(action?.scheduled_at));
    setNotes(action?.notes ?? suggestedNote ?? "");
    setStatus((action?.status as ActionStatus) ?? "Pendiente");
    setOutcome((action?.outcome as ActionOutcome) ?? "");
  }, [open, action, suggestedType, suggestedNote]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const scheduledAt = date ? new Date(`${date}T12:00:00`).toISOString() : null;
      if (action) {
        await updateIntervention(action.id, {
          actionType,
          owner: owner || null,
          notes: notes || null,
          scheduledAt,
          status,
          outcome: status === "Completada" ? ((outcome || null) as ActionOutcome | null) : null,
        });
        toast.success("Intervención actualizada", { description: `Cliente ${customerCode}` });
      } else {
        await createIntervention({
          subscriberId,
          actionType,
          owner,
          notes,
          scheduledAt,
          status,
          outcome: status === "Completada" ? ((outcome || null) as ActionOutcome | null) : null,
        });
        toast.success("Intervención creada", { description: `Cliente ${customerCode}` });
      }
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      setOpen(false);
    } catch (error) {
      toast.error("No fue posible guardar la intervención", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{action ? "Actualizar intervención" : "Crear intervención"}</DialogTitle>
          <DialogDescription>
            Cliente {customerCode}. Las intervenciones quedan registradas y alimentan las métricas de
            efectividad.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="action-type">Tipo de acción</Label>
              <Select value={actionType} onValueChange={(value) => setActionType(value as ActionType)}>
                <SelectTrigger id="action-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="action-owner">Responsable</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="action-owner">
                  <SelectValue placeholder="Asignar a…" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="action-date">Fecha</Label>
              <Input
                id="action-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="action-status">Estado</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ActionStatus)}>
                <SelectTrigger id="action-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "Completada" && (
            <div className="space-y-1.5">
              <Label htmlFor="action-outcome">Resultado</Label>
              <Select value={outcome} onValueChange={(value) => setOutcome(value as ActionOutcome)}>
                <SelectTrigger id="action-outcome">
                  <SelectValue placeholder="Selecciona un resultado" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OUTCOMES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="action-notes">Nota</Label>
            <Textarea
              id="action-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contexto de la gestión, compromisos, próximos pasos…"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : action ? "Guardar cambios" : "Crear intervención"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
