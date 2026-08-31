import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { RISK_HEX } from "@/components/risk/RiskBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCLP, formatNumber } from "@/lib/format";
import {
  computeEffectivenessByAction,
  computeFunnel,
  computeOverview,
  computeSignalRanking,
} from "@/services/analytics";

export const Route = createFileRoute("/_authenticated/analisis")({
  head: () => ({
    meta: [
      { title: "Análisis de churn | RevistaViva" },
      {
        name: "description",
        content:
          "Embudo de retención, efectividad por tipo de acción y ranking de señales de abandono en RevistaViva.",
      },
      { property: "og:title", content: "Análisis de churn | RevistaViva" },
      {
        property: "og:description",
        content: "Cobertura de gestión, efectividad de intervenciones y señales dominantes.",
      },
    ],
  }),
  component: AnalisisPage,
});

function AnalisisPage() {
  const portfolio = usePortfolio();

  return (
    <>
      <PageHeader
        title="Análisis"
        description="Cómo se comporta la cartera y qué tan efectivo está siendo el trabajo de retención."
        breadcrumbs={[{ label: "Análisis" }]}
      />

      <QueryState
        isLoading={portfolio.isLoading}
        error={portfolio.error}
        onRetry={() => void portfolio.refetch()}
      >
        {portfolio.data && (
          <AnalisisContent items={portfolio.data.items} actions={portfolio.data.actions} />
        )}
      </QueryState>
    </>
  );
}

function AnalisisContent({
  items,
  actions,
}: {
  items: NonNullable<ReturnType<typeof usePortfolio>["data"]>["items"];
  actions: NonNullable<ReturnType<typeof usePortfolio>["data"]>["actions"];
}) {
  const funnel = computeFunnel(items, actions);
  const overview = computeOverview(items, actions);
  const effectiveness = computeEffectivenessByAction(actions);
  const signals = computeSignalRanking(items);

  const funnelData = [
    { stage: "Cartera", value: funnel.total },
    { stage: "En riesgo", value: funnel.atRisk },
    { stage: "Intervenidos", value: funnel.intervened },
    { stage: "Retenidos", value: funnel.retained },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Cobertura de gestión"
          value={`${funnel.interventionRate.toFixed(0)}%`}
          tooltip="Porcentaje de suscriptores en riesgo Alto o Crítico que ya tienen al menos una intervención registrada."
          hint={`${funnel.intervened} de ${funnel.atRisk} en riesgo`}
        />
        <MetricCard
          label="Efectividad global"
          value={funnel.effectiveness == null ? "Sin datos" : `${funnel.effectiveness.toFixed(0)}%`}
          accent="positive"
          tooltip="Intervenciones con resultado 'Retenido' sobre el total con resultado conocido. Es una medida declarativa, no causal."
        />
        <MetricCard
          label="Críticos contactados"
          value={`${funnel.criticalContacted}/${funnel.criticalTotal}`}
          accent="critical"
          hint="Cobertura del segmento más urgente"
        />
        <MetricCard
          label="Ingreso mensual retenido"
          value={formatCLP(funnel.revenueRetained)}
          hint={`De ${formatCLP(funnel.revenueAtRisk)} en riesgo`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Embudo de retención</CardTitle>
            <CardDescription>
              Del total de la cartera a los suscriptores efectivamente retenidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 8, right: 16, bottom: 0, left: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={90}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value} suscriptores`, "Total"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por nivel de riesgo</CardTitle>
            <CardDescription>Composición actual de la cartera</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={overview.distribution}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              >
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
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Efectividad por tipo de acción</CardTitle>
            <CardDescription>
              Resultados registrados por el equipo. Con volúmenes bajos, interpretar con cautela.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Acción</TableHead>
                  <TableHead className="text-right">Intervenciones</TableHead>
                  <TableHead className="text-right">Retenidos</TableHead>
                  <TableHead className="text-right">Efectividad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effectiveness.map((row) => (
                  <TableRow key={row.actionType}>
                    <TableCell>{row.actionType}</TableCell>
                    <TableCell className="tabular text-right">{row.interventions}</TableCell>
                    <TableCell className="tabular text-right">{row.retained}</TableCell>
                    <TableCell className="tabular text-right">
                      {row.effectiveness == null ? "Sin datos" : `${row.effectiveness.toFixed(0)}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Señales de abandono más frecuentes</CardTitle>
            <CardDescription>Cantidad de suscriptores afectados por cada señal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((signal) => (
              <div key={signal.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{signal.label}</span>
                  <span className="tabular text-muted-foreground">
                    {formatNumber(signal.affected)}
                  </span>
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

      <p className="text-xs text-muted-foreground">
        Nota metodológica: el Risk Score es una heurística explicable basada en reglas
        configurables. No es un modelo predictivo entrenado con datos históricos de cancelación, por
        lo que las métricas de efectividad describen lo observado por el equipo y no relaciones
        causales.
      </p>
    </div>
  );
}
