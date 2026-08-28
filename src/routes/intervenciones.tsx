import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { AppShell } from "@/components/layout/AppShell";
import { InterventionForm } from "@/components/interventions/InterventionForm";
import { InterventionList } from "@/components/interventions/InterventionList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterventions } from "@/state/interventions";

export const Route = createFileRoute("/intervenciones")({
  head: () => ({
    meta: [
      { title: "Intervenciones | RevistaViva Retention Intelligence" },
      {
        name: "description",
        content:
          "Registro de acciones de retención del equipo de RevistaViva: llamadas, correos y ofertas guardadas en la sesión de demostración.",
      },
      { property: "og:title", content: "Intervenciones | RevistaViva Retention Intelligence" },
      {
        property: "og:description",
        content: "Registro de acciones de retención de la demo.",
      },
    ],
  }),
  component: IntervencionesPage,
});

function IntervencionesPage() {
  const { interventions } = useInterventions();
  const pendientes = interventions.filter((item) => item.status === "Pendiente");
  const completadas = interventions.filter((item) => item.status === "Completada");

  return (
    <AppShell>
      <PageHeader
        title="Intervenciones"
        description="Acciones de retención registradas por el equipo. En esta demo se guardan solo en la sesión del navegador."
        breadcrumbs={[{ label: "Intervenciones" }]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Nueva intervención</CardTitle>
            <CardDescription>Selecciona el suscriptor y la acción realizada</CardDescription>
          </CardHeader>
          <CardContent>
            <InterventionForm />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pendientes ({pendientes.length})</CardTitle>
              <CardDescription>Gestiones abiertas del equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <InterventionList items={pendientes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completadas ({completadas.length})</CardTitle>
              <CardDescription>Gestiones cerradas en esta sesión</CardDescription>
            </CardHeader>
            <CardContent>
              <InterventionList items={completadas} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
