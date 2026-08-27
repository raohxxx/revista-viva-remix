import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const ACTION_TYPES = [
  "Llamada telefónica",
  "Correo de retención",
  "Oferta comercial",
  "Encuesta de satisfacción",
  "Revisión de cobro",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
export type InterventionStatus = "Pendiente" | "Completada";

export interface Intervention {
  id: string;
  customer_code: string;
  action_type: ActionType;
  owner: string;
  notes: string;
  created_at: string;
  status: InterventionStatus;
  completed_at: string | null;
}

export const TEAM_MEMBERS = [
  "C. Morales",
  "A. González",
  "P. Rojas",
  "M. Fuentes",
  "J. Vergara",
] as const;

interface InterventionsState {
  interventions: Intervention[];
  addIntervention: (input: {
    customer_code: string;
    action_type: ActionType;
    owner: string;
    notes: string;
  }) => void;
  completeIntervention: (id: string) => void;
  removeIntervention: (id: string) => void;
}

const InterventionsContext = createContext<InterventionsState | null>(null);

export function InterventionsProvider({ children }: { children: ReactNode }) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  const addIntervention = useCallback<InterventionsState["addIntervention"]>((input) => {
    setInterventions((prev) => [
      {
        id: `int-${Date.now()}-${prev.length + 1}`,
        created_at: new Date().toISOString(),
        status: "Pendiente",
        completed_at: null,
        ...input,
      },
      ...prev,
    ]);
  }, []);

  const completeIntervention = useCallback((id: string) => {
    setInterventions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "Completada", completed_at: new Date().toISOString() }
          : item,
      ),
    );
  }, []);

  const removeIntervention = useCallback((id: string) => {
    setInterventions((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<InterventionsState>(
    () => ({ interventions, addIntervention, completeIntervention, removeIntervention }),
    [interventions, addIntervention, completeIntervention, removeIntervention],
  );

  return <InterventionsContext.Provider value={value}>{children}</InterventionsContext.Provider>;
}

export function useInterventions(): InterventionsState {
  const context = useContext(InterventionsContext);
  if (!context) {
    throw new Error("useInterventions debe usarse dentro de InterventionsProvider");
  }
  return context;
}
