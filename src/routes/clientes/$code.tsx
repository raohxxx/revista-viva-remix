import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubscriber, type Subscriber } from "@/data/subscribers";
import { InterventionForm } from "@/components/interventions/InterventionForm";
import { InterventionList } from "@/components/interventions/InterventionList";
import { useInterventions } from "@/state/interventions";
import {
  daysUntil,
  formatCLP,
  formatDate,
  formatPercentChange,
  formatTenure,
  percentChange,
} from "@/lib/format";

export const Route = createFileRoute("/clientes/$code")({
  loader: ({ params }) => {
    const subscriber = getSubscriber(params.code);
    if (!subscriber) throw notFound();
    return { subscriber };
  },
  head: ({ params }) => ({
    meta: [
      { title: `Suscriptor ${params.code} | RevistaViva Retention Intelligence` },
      {
        name: "description",
        content: `Ficha del suscriptor ${params.code}: plan, renovación, actividad, pagos, reclamos y satisfacción.`,
      },
      { property: "og:title", content: `Suscriptor ${params.code} | RevistaViva` },
      {
        property: "og:description",
        content: "Ficha de suscriptor con datos de suscripción y comportamiento.",
      },
    ],
  }),
  component: ClienteDetalle,
  notFoundComponent: () => (
    <AppShell>
      <PageHeader
        title="Suscriptor no encontrado"
        description="El código indicado no existe en la cartera de demostración."
        breadcrumbs={[{ label: "Clientes", to: "/clientes" }, { label: "No encontrado" }]}
      />
      <Button asChild variant="outline" size="sm">
        <Link to="/clientes">Volver a Clientes</Link>
      </Button>
    </AppShell>
  ),
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="tabular text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ClienteDetalle() {
  const { subscriber } = Route.useLoaderData() as { subscriber: Subscriber };
  const { interventions } = useInterventions();
  const history = interventions.filter((i) => i.customer_code === subscriber.customer_code);

  const days = daysUntil(subscriber.renewal_date);
  const change = percentChange(subscriber.sessions_30d, subscriber.sessions_previous_30d);

  return (
    <AppShell>
      <PageHeader
        title={subscriber.customer_code}
        description={`${subscriber.plan} · ${formatCLP(subscriber.monthly_value)} mensual`}
        breadcrumbs={[
          { label: "Clientes", to: "/clientes" },
          { label: subscriber.customer_code },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/clientes">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Volver
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suscripción</CardTitle>
              <CardDescription>Datos comerciales del plan contratado</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Código" value={subscriber.customer_code} />
              <Field label="Plan" value={subscriber.plan} />
              <Field
                label="Precio de lista"
                value={`${formatCLP(subscriber.plan_list_price)} ${
                  subscriber.billing_period === "anual" ? "al año" : "al mes"
                }`}
              />
              <Field label="Valor mensual" value={formatCLP(subscriber.monthly_value)} />
              <Field
                label="Inicio de suscripción"
                value={formatDate(subscriber.subscription_start_date)}
              />
              <Field label="Antigüedad" value={formatTenure(subscriber.subscription_start_date)} />
              <Field
                label="Fecha de renovación"
                value={`${formatDate(subscriber.renewal_date)}${
                  days == null ? "" : ` (${days} días)`
                }`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comportamiento</CardTitle>
              <CardDescription>Actividad, pagos y satisfacción registrados</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Sesiones últimos 30 días" value={String(subscriber.sessions_30d)} />
              <Field
                label="Sesiones 30 días anteriores"
                value={String(subscriber.sessions_previous_30d)}
              />
              <Field label="Variación de sesiones" value={formatPercentChange(change)} />
              <Field
                label="Artículos leídos últimos 30 días"
                value={String(subscriber.articles_read_30d)}
              />
              <Field
                label="Días desde el último acceso"
                value={`${subscriber.days_since_last_access} días`}
              />
              <Field
                label="Pagos rechazados últimos 90 días"
                value={String(subscriber.payment_failures_90d)}
              />
              <Field label="Reclamos últimos 90 días" value={String(subscriber.complaints_90d)} />
              <Field
                label="Puntaje de satisfacción"
                value={`${subscriber.satisfaction_score} de 10`}
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registrar intervención</CardTitle>
              <CardDescription>
                Queda guardada en esta sesión del navegador; se pierde al recargar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InterventionForm fixedCustomer={subscriber.customer_code} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Intervenciones de este suscriptor</CardTitle>
              <CardDescription>Historial registrado en la sesión actual</CardDescription>
            </CardHeader>
            <CardContent>
              <InterventionList items={history} showCustomer={false} />
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
