import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertOctagon,
  CalendarClock,
  CircleDollarSign,
  TrendingDown,
  Users,
} from "lucide-react";
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
import { RiskBadge } from "@/components/risk/RiskBadge";
import { RISK_HEX } from "@/components/risk/RiskBadge";
import { RiskScoreInline, RiskScoreTooltip } from "@/components/risk/RiskScore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio, useRiskHistory } from "@/hooks/usePortfolio";
import { daysUntil, formatCLP, formatDate, formatNumber } from "@/lib/format";
import {
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
  history: { snapshot_date: string; average_score: number; high_risk_count: number }[];
}) {
  const overview = computeOverview(data.items, data.actions);
  const priorities = computeTodayPriorities(data.items, 8);
  const signals = computeSignalRanking(data.items).slice(0, 6);

  const historyData = history.map((row) => ({
    date: formatDate(row.snapshot_date).slice(0, 5),
    score: Number(row.average_score),
    alto: row.high_risk_count,
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Suscriptores activos"
          value={formatNumber(overview.totalActive)}
          icon={Users}
          hint="Cartera vigente en seguimiento"
        />
        <MetricCard
          label="En riesgo alto"
          value={`${formatNumber(overview.highRisk)} (${overview.highRiskPct.toFixed(0)}%)`}
          icon={TrendingDown}
          accent="high"
          tooltip="Suscriptores con Risk Score en nivel Alto o Crítico según los umbrales configurados."
          hint={`${overview.critical} en nivel crítico`}
        />
        <MetricCard
          label="Ingresos en riesgo"
          value={formatCLP(overview.revenueAtRisk)}
          icon={CircleDollarSign}
          accent="critical"
          tooltip="Suma del valor mensual de los suscriptores en riesgo Alto y Crítico. Es una estimación, no una pérdida confirmada."
          hint="Valor mensual recurrente expuesto"
        />
        <MetricCard
          label="Renovaciones 30 días"
          value={formatNumber(overview.renewals30d)}
          icon={CalendarClock}
          hint="Ventana crítica de decisión"
        />
        <MetricCard
          label="Cancelaciones registradas"
          value={formatNumber(overview.churnObserved)}
          icon={AlertOctagon}
          tooltip="Intervenciones cuyo resultado registrado fue 'Canceló'. Refleja lo observado por el equipo, no una tasa de churn calibrada."
          hint="Según resultados de intervenciones"
        />
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
              Score promedio de la cartera y volumen en riesgo alto por día
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
                    dataKey="score"
                    name="Score promedio"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="alto"
                    name="Riesgo alto"
                    stroke="var(--risk-high)"
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
                Prioridades del día
                <RiskScoreTooltip />
              </CardTitle>
              <CardDescription>
                Combina Risk Score, cercanía de renovación, valor del plan y ausencia de gestión
                previa.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/clientes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorities.map((item) => {
              const days = daysUntil(item.subscriber.renewal_date);
              return (
                <Link
                  key={item.subscriber.id}
                  to="/clientes/$id"
                  params={{ id: item.subscriber.id }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className="min-w-[160px]">
                    <p className="text-sm font-medium text-foreground">
                      {item.subscriber.customer_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.subscriber.plan} · {formatCLP(item.subscriber.monthly_value)}/mes
                    </p>
                  </div>
                  <p className="min-w-[220px] flex-1 text-xs text-muted-foreground">
                    {item.prediction.principalReason}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {days == null ? "—" : days < 0 ? "Renovación vencida" : `Renueva en ${days}d`}
                    </span>
                    <RiskScoreInline score={item.prediction.score} level={item.prediction.level} />
                    <RiskBadge level={item.prediction.level} />
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
