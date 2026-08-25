import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, CircleDollarSign, Sparkles, TrendingDown, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { DominantSignalBadge } from "@/components/risk/DominantSignalBadge";
import { PriorityBadge } from "@/components/risk/PriorityBadge";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { RISK_HEX } from "@/components/risk/RiskBadge";
import { RiskScoreInline, RiskScoreTooltip } from "@/components/risk/RiskScore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio, useRiskHistory } from "@/hooks/usePortfolio";
import { DOMINANT_SIGNAL, type RiskHistoryRow } from "@/types/domain";
import { daysUntil, formatCLP, formatDate, formatNumber, monthlyRevenue } from "@/lib/format";
import {
  computeDominantCauses,
  computeImpactScenario,
  computeOverview,
  computeSignalRanking,
  computeTodayPriorities,
} from "@/services/analytics";

export const Route = createFileRoute("/_authenticated/resumen")({
  head: () => ({
    meta: [
      { title: "Resumen de retención | RevistaViva" },
      {
        name: "description",
        content:
          "Panel de control con riesgo de churn, ingresos en riesgo y prioridades del día del equipo de Retención de RevistaViva.",
      },
      { property: "og:title", content: "Resumen de retención | RevistaViva" },
      {
        property: "og:description",
        content: "KPIs de churn, distribución de riesgo y prioridades del día.",
      },
    ],
  }),
  component: ResumenPage,
});

function ResumenPage() {
  const portfolio = usePortfolio();
  const history = useRiskHistory();

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Estado general de la cartera de suscriptores y prioridades de retención para hoy."
        breadcrumbs={[{ label: "Resumen" }]}
        actions={
          <Button asChild size="sm">
            <Link to="/clientes">Ver cartera completa</Link>
          </Button>
        }
      />

      <QueryState
        isLoading={portfolio.isLoading}
        error={portfolio.error}
        onRetry={() => void portfolio.refetch()}
      >
        {portfolio.data && (
          <ResumenContent
            data={portfolio.data}
            history={history.data ?? []}
          />
        )}
      </QueryState>
    </>
  );
}

function ResumenContent({
  data,
  history,
}: {
  data: NonNullable<ReturnType<typeof usePortfolio>["data"]>;
  history: RiskHistoryRow[];
}) {
  const overview = computeOverview(data.items, data.actions);
  const priorities = computeTodayPriorities(data.items, 8);
  const signals = computeSignalRanking(data.items).slice(0, 6);

  const historyData = history.map((row) => ({
    date: formatDate(row.snapshot_date).slice(0, 5),
    alto: row.high_count + row.critical_count,
    critico: row.critical_count,
  }));

  const scenario = computeImpactScenario(data.items, 10, 0.4);
  const causes = computeDominantCauses(data.items).slice(0, 6);
  const topAction = priorities[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="MRR total de la cartera"
          value={formatCLP(overview.totalMRR)}
          icon={CircleDollarSign}
          tooltip="Ingreso mensual recurrente de los suscriptores activos. Los planes anuales se contabilizan como su equivalente mensual."
          hint={`${formatNumber(overview.totalActive)} suscriptores activos`}
        />
        <MetricCard
          label="MRR en riesgo"
          value={formatCLP(overview.revenueAtRisk)}
          icon={TrendingDown}
          accent="critical"
          tooltip="Suma del MRR de los suscriptores en riesgo Alto y Crítico. Es una estimación de exposición, no una pérdida confirmada."
          hint={`${overview.mrrAtRiskPct.toFixed(1)}% del MRR total`}
        />
        <MetricCard
          label="Clientes en riesgo"
          value={`${formatNumber(overview.highRisk)} (${overview.highRiskPct.toFixed(0)}%)`}
          icon={Users}
          accent="high"
          tooltip="Suscriptores con Risk Score en nivel Alto o Crítico según los umbrales configurados."
          hint={`${overview.critical} en nivel crítico`}
        />
        <MetricCard
          label="Renovaciones 30 días"
          value={formatNumber(overview.renewals30d)}
          icon={CalendarClock}
          tooltip="Suscriptores cuya renovación ocurre dentro de los próximos 30 días: la ventana donde la gestión tiene mayor efecto."
          hint={`${overview.churnObserved} cancelaciones registradas`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-primary/30 bg-primary/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              Acción recomendada hoy
            </CardTitle>
            <CardDescription>
              La decisión de mayor impacto según prioridad, valor y cercanía de renovación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topAction ? (
              <>
                <p className="text-sm text-foreground">
                  Contactar a{" "}
                  <span className="font-semibold">
                    {topAction.subscriber.full_name ?? topAction.subscriber.customer_code}
                  </span>{" "}
                  ({formatCLP(monthlyRevenue(topAction.subscriber))}/mes) —{" "}
                  {topAction.prediction.recommendedAction}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={topAction.prediction.level} />
                  <DominantSignalBadge signalKey={topAction.prediction.principalSignalKey} />
                  <PriorityBadge score={topAction.priorityScore} />
                  <Button asChild size="sm">
                    <Link to="/clientes/$id" params={{ id: topAction.subscriber.id }}>
                      Abrir ficha
                    </Link>
                  </Button>
                </div>
                <p className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  Si gestionas los {scenario.targetClients} clientes de mayor prioridad (
                  {formatCLP(scenario.targetMRR)}/mes) y retienes al{" "}
                  {(scenario.retentionRate * 100).toFixed(0)}%, proteges aproximadamente{" "}
                  <span className="font-medium text-foreground">
                    {formatCLP(scenario.mrrSaved)}/mes
                  </span>{" "}
                  ({formatCLP(scenario.annualSaved)} al año). Escenario estimado con supuestos de
                  demostración.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay clientes en riesgo alto o crítico. Mantén el seguimiento estándar.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por qué están en riesgo</CardTitle>
            <CardDescription>Causa dominante por cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {causes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin causas de riesgo detectadas.</p>
            ) : (
              causes.map((cause) => (
                <div key={cause.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <span aria-hidden>{DOMINANT_SIGNAL[cause.key].emoji}</span>
                      {DOMINANT_SIGNAL[cause.key].label}
                    </span>
                    <span className="tabular text-muted-foreground">
                      {cause.clients} · {formatCLP(cause.mrr)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${cause.share}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Distribución de riesgo</CardTitle>
            <CardDescription>Suscriptores por nivel de Risk Score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.distribution} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <RechartsTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value} suscriptores`, "Total"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {overview.distribution.map((entry) => (
                    <Cell key={entry.level} fill={RISK_HEX[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Evolución del riesgo</CardTitle>
            <CardDescription>
              Volumen de suscriptores en riesgo alto y crítico por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Aún no hay snapshots históricos disponibles.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={historyData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alto"
                    name="Riesgo alto + crítico"
                    stroke="var(--risk-high)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="critico"
                    name="Riesgo crítico"
                    stroke="var(--risk-critical)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-1.5 text-base">
                Lista de acción inmediata
                <RiskScoreTooltip />
              </CardTitle>
              <CardDescription>
                Ordenada por Priority Score: riesgo, cercanía de renovación, valor del cliente y
                señales críticas.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/clientes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorities.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No hay clientes que requieran acción inmediata.
              </p>
            )}
            {priorities.map((item) => {
              const days = daysUntil(item.subscriber.renewal_date);
              return (
                <Link
                  key={item.subscriber.id}
                  to="/clientes/$id"
                  params={{ id: item.subscriber.id }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className="min-w-[170px]">
                    <p className="text-sm font-medium text-foreground">
                      {item.subscriber.full_name ?? item.subscriber.customer_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.subscriber.plan} · {formatCLP(monthlyRevenue(item.subscriber))}/mes
                    </p>
                  </div>
                  <div className="min-w-[220px] flex-1 space-y-1">
                    <DominantSignalBadge signalKey={item.prediction.principalSignalKey} />
                    <p className="text-xs text-muted-foreground">
                      {item.prediction.recommendedAction}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {days == null ? "—" : days < 0 ? "Renovación vencida" : `Renueva en ${days}d`}
                    </span>
                    <RiskScoreInline score={item.prediction.score} level={item.prediction.level} />
                    <RiskBadge level={item.prediction.level} />
                    <PriorityBadge score={item.priorityScore} />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Señales más frecuentes</CardTitle>
            <CardDescription>Suscriptores afectados por cada señal activa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((signal) => (
              <div key={signal.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{signal.label}</span>
                  <span className="tabular text-muted-foreground">{signal.affected}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{
                      width: `${(signal.affected / Math.max(signals[0]?.affected ?? 1, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
