import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ActionOutcome, ActionStatus, ActionType, RetentionAction } from "@/types/domain";

export interface InterventionInput {
  subscriberId: string;
  actionType: ActionType;
  owner: string;
  scheduledAt: string | null;
  notes: string;
  status: ActionStatus;
  outcome?: ActionOutcome | null;
}

export async function createIntervention(input: InterventionInput): Promise<RetentionAction> {
  const { data, error } = await supabase
    .from("retention_actions")
    .insert({
      subscriber_id: input.subscriberId,
      action_type: input.actionType,
      status: input.status,
      owner: input.owner || null,
      notes: input.notes || null,
      scheduled_at: input.scheduledAt,
      completed_at: input.status === "Completada" ? new Date().toISOString() : null,
      outcome: input.status === "Completada" ? (input.outcome ?? null) : null,
    })
    .select()
    .single();

  if (error) throw new Error(`No fue posible crear la intervención: ${error.message}`);
  return data;
}

export async function updateIntervention(
  id: string,
  patch: {
    status?: ActionStatus;
    outcome?: ActionOutcome | null;
    owner?: string | null;
    notes?: string | null;
    scheduledAt?: string | null;
    actionType?: ActionType;
  },
): Promise<void> {
  const update: Database["public"]["Tables"]["retention_actions"]["Update"] = {};
  if (patch.status !== undefined) {
    update.status = patch.status;
    update.completed_at = patch.status === "Completada" ? new Date().toISOString() : null;
    if (patch.status !== "Completada") update.outcome = null;
  }
  if (patch.outcome !== undefined) update.outcome = patch.outcome;
  if (patch.owner !== undefined) update.owner = patch.owner;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (patch.scheduledAt !== undefined) update.scheduled_at = patch.scheduledAt;
  if (patch.actionType !== undefined) update.action_type = patch.actionType;

  const { error } = await supabase.from("retention_actions").update(update).eq("id", id);
  if (error) throw new Error(`No fue posible actualizar la intervención: ${error.message}`);
}
