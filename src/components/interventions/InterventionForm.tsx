import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SUBSCRIBERS } from "@/data/subscribers";
import { ACTION_TYPES, TEAM_MEMBERS, useInterventions, type ActionType } from "@/state/interventions";

export function InterventionForm({ fixedCustomer }: { fixedCustomer?: string }) {
  const { addIntervention } = useInterventions();
  const [customer, setCustomer] = useState(fixedCustomer ?? SUBSCRIBERS[0]!.customer_code);
  const [actionType, setActionType] = useState<ActionType>(ACTION_TYPES[0]);
  const [owner, setOwner] = useState<string>(TEAM_MEMBERS[0]);
  const [notes, setNotes] = useState("");

  const code = fixedCustomer ?? customer;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        addIntervention({ customer_code: code, action_type: actionType, owner, notes: notes.trim() });
        setNotes("");
        toast.success(`Intervención registrada para ${code}`);
      }}
    >
      {!fixedCustomer && (
        <div className="space-y-1.5">
          <Label htmlFor="customer">Suscriptor</Label>
          <Select value={customer} onValueChange={setCustomer}>
            <SelectTrigger id="customer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {SUBSCRIBERS.map((item) => (
                <SelectItem key={item.customer_code} value={item.customer_code}>
                  {item.customer_code} · {item.plan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="action-type">Tipo de acción</Label>
          <Select value={actionType} onValueChange={(value) => setActionType(value as ActionType)}>
            <SelectTrigger id="action-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner">Responsable</Label>
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger id="owner">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM_MEMBERS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Detalle de la gestión realizada o planificada"
          rows={3}
        />
      </div>

      <Button type="submit" size="sm">
        Registrar intervención
      </Button>
    </form>
  );
}
