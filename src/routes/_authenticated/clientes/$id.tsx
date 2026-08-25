import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, UserX } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { InterventionDialog } from "@/components/interventions/InterventionDialog";
import { InterventionTimeline } from "@/components/interventions/InterventionTimeline";
import { DominantSignalBadge } from "@/components/risk/DominantSignalBadge";
import { PriorityBadge } from "@/components/risk/PriorityBadge";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { RiskScoreGauge, RiskScoreTooltip } from "@/components/risk/RiskScore";
import { RiskSignals } from "@/components/risk/RiskSignals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  daysSince,
  daysUntil,
  formatCLP,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentChange,
  formatTenure,
  monthlyRevenue,
  percentChange,
} from "@/lib/format";
import { buildExplanation, buildRecommendation } from "@/services/riskEngine";

export const Route = createFileRoute("/_authenticated/clientes/$id")({
  head: () => ({
    meta: [
      { title: "Ficha del suscriptor | RevistaViva" },
      {
        name: "description",
        content:
          "Perfil del suscriptor con explicación del Risk Score, señales de churn e historial de intervenciones.",
      },
      { property: "og:title", content: "Ficha del suscriptor | RevistaViva" },
      {
        property: "og:description",
        content: "Explicabilidad del riesgo y registro de gestiones de retención.",
      },
    ],
  }),
  component: ClienteDetailPage,
});

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function suggestedType(action: string): ActionType {
  const lower = action.toLowerCase();
  if (lower.includes("pago")) return "Soporte de pago";
  if (lower.includes("llam")) return "Llamada";
  if (lower.includes("oferta") || lower.includes("descuento")) return "Oferta";
  if (lower.includes("encuesta")) return "Encuesta";
  if (lower.includes("contenido")) return "Contenido personalizado";
  return "Email";
}

function ClienteDetailPage() {
  const { id } = Route.useParams();
  const portfolio = usePortfolio();

  return (
    <QueryState
      isLoading={portfolio.isLoading}
      error={portfolio.error}
      onRetry={() => void portfolio.refetch()}
    >
      {(() => {
        const item = portfolio.data?.byId.get(id);
        if (!item) {
          return (
            <EmptyState
              icon={UserX}
              title="Suscriptor no encontrado"
              description="El cliente solicitado no existe o fue eliminado de la cartera."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link to="/clientes">Volver a la cartera</Link>
                </Button>
              }
            />
          );
        }

        const { subscriber, prediction } = item;
        const actions = (portfolio.data?.actions ?? []).filter((a) => a.subscriber_id === id);
        const change = percentChange(subscriber.sessions_30d, subscriber.sessions_previous_30d);
        const renewalDays = daysUntil(subscriber.renewal_date);
        const inactivity = daysSince(subscriber.last_access_at);

        return (
          <>
            <PageHeader
              title={subscriber.customer_code}
              description={`${subscriber.plan} · ${formatCLP(subscriber.monthly_value)}/mes · cliente hace ${formatTenure(subscriber.subscription_start_date)}`}
              breadcrumbs={[
                { label: "Clientes", to: "/clientes" },
                { label: subscriber.customer_code },
              ]}
              actions={
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/clientes">
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      Volver
                    </Link>
                  </Button>
                  <InterventionDialog
                    subscriberId={subscriber.id}
                    customerCode={subscriber.customer_code}
                    suggestedType={suggestedType(prediction.recommendedAction)}
                    suggestedNote={prediction.recommendedAction}
                    trigger={
                      <Button size="sm">
                        <Plus className="h-4 w-4" aria-hidden />
                        Registrar intervención
                      </Button>
                    }
                  />
                </div>
              }
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    Risk Score
                    <RiskScoreTooltip />
                  </CardTitle>
                  <CardDescription>Nivel calculado con las reglas vigentes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RiskScoreGauge score={prediction.score} level={prediction.level} />
                  <RiskBadge level={prediction.level} size="md" />
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground">Motivo principal</p>
                    <p className="mt-1 text-sm text-foreground">{prediction.principalReason}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground">Acción recomendada</p>
                    <p className="mt-1 text-sm text-foreground">{prediction.recommendedAction}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Por qué está en riesgo</CardTitle>
                  <CardDescription>
                    Aporte de cada señal al puntaje. El modelo es heurístico y explicable.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskSignals prediction={prediction} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Datos de suscripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataRow label="Plan" value={subscriber.plan} />
                  <DataRow label="Valor mensual" value={formatCLP(subscriber.monthly_value)} />
                  <DataRow label="Estado" value={subscriber.subscription_status} />
                  <DataRow label="Inicio" value={formatDate(subscriber.subscription_start_date)} />
                  <DataRow
                    label="Renovación"
                    value={`${formatDate(subscriber.renewal_date)}${
                      renewalDays == null ? "" : ` (${renewalDays}d)`
                    }`}
                  />
                  <DataRow
                    label="Método de pago"
                    value={subscriber.payment_method ?? "No registrado"}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comportamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataRow
                    label="Sesiones últimos 30 días"
                    value={formatNumber(subscriber.sessions_30d)}
                  />
                  <DataRow
                    label="Sesiones 30 días previos"
                    value={formatNumber(subscriber.sessions_previous_30d)}
                  />
                  <DataRow label="Variación de actividad" value={formatPercentChange(change)} />
                  <DataRow
                    label="Artículos leídos (30d)"
                    value={formatNumber(subscriber.articles_read_30d)}
                  />
                  <DataRow
                    label="Apertura de newsletter"
                    value={`${formatNumber(subscriber.newsletter_open_rate * 100)}%`}
                  />
                  <DataRow
                    label="Tiempo medio de lectura"
                    value={`${formatNumber(subscriber.avg_read_time_minutes, 1)} min`}
                  />
                  <DataRow
                    label="Último acceso"
                    value={`${formatDateTime(subscriber.last_access_at)}${
                      inactivity == null ? "" : ` · hace ${inactivity}d`
                    }`}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pagos y soporte</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataRow
                    label="Pagos fallidos (90d)"
                    value={formatNumber(subscriber.payment_failures_90d)}
                  />
                  <DataRow
                    label="Reclamos (90d)"
                    value={formatNumber(subscriber.complaints_90d)}
                  />
                  <DataRow
                    label="Satisfacción (NPS/CSAT)"
                    value={
                      subscriber.satisfaction_score == null
                        ? "Sin dato"
                        : `${subscriber.satisfaction_score}/10`
                    }
                  />
                  <DataRow
                    label="Intervenciones registradas"
                    value={formatNumber(actions.length)}
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base">Historial de intervenciones</CardTitle>
                  <CardDescription>
                    Registro de contactos realizados por el equipo de Retención.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InterventionTimeline
                    actions={actions}
                    customerCode={subscriber.customer_code}
                    subscriberId={subscriber.id}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        );
      })()}
    </QueryState>
  );
}
