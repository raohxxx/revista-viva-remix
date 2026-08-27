import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, CircleDollarSign, Flame, Users } from "lucide-react";

import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/resumen")({
  head: () => ({
    meta: [
      { title: "Resumen de Retención | RevistaViva Retention Intelligence" },
      {
        name: "description",
        content:
          "Resumen de Retención de RevistaViva: indicadores de cartera y espacios reservados para el motor de riesgo de fuga.",
      },
      { property: "og:title", content: "Resumen de Retención | RevistaViva" },
      {
        property: "og:description",
        content: "Panel interno de detección temprana de riesgo de fuga de suscriptores.",
      },
    ],
  }),
  component: ResumenPage,
});

const ENGINE_MESSAGE = "El motor de riesgo aún no está configurado";

const KPIS = [
  {
    label: "Suscriptores activos",
    icon: Users,
    tooltip: "Total de suscriptores con suscripción vigente en la cartera.",
  },
  {
    label: "Clientes en alto riesgo",
    icon: AlertTriangle,
    tooltip:
      "Suscriptores en nivel alto más crítico. Incluirá el porcentaje sobre el total de la cartera.",
  },
  {
    label: "Clientes críticos",
    icon: Flame,
    tooltip: "Suscriptores en el nivel de riesgo más severo.",
  },
  {
    label: "Ingreso mensual en riesgo",
    icon: CircleDollarSign,
    tooltip: "Suma del valor mensual de los clientes en riesgo alto y crítico.",
  },
  {
    label: "Renovaciones próximas 30 días",
    icon: CalendarClock,
    tooltip: "Suscriptores cuya renovación ocurre dentro de los próximos 30 días.",
  },
] as const;

const RISK_LEVELS = [
  { label: "Bajo", className: "bg-risk-low" },
  { label: "Medio", className: "bg-risk-medium" },
  { label: "Alto", className: "bg-risk-high" },
  { label: "Crítico", className: "bg-risk-critical" },
] as const;

function EnginePlaceholder({ description }: { description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{ENGINE_MESSAGE}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ResumenPage() {
  return (
    <AppShell>
      <PageHeader
        title="Resumen de Retención"
        description="Estado de la cartera sintética de suscriptores. Los indicadores de riesgo se activarán cuando se incorpore el motor de riesgo."
        breadcrumbs={[{ label: "Resumen" }]}
      />

      <div className="space-y-6">
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
          aria-label="Indicadores principales"
        >
          {KPIS.map((kpi) => (
            <MetricCard
              key={kpi.label}
              label={kpi.label}
              value="—"
              icon={kpi.icon}
              tooltip={kpi.tooltip}
              hint="Pendiente del motor de riesgo"
            />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribución de riesgo</CardTitle>
              <CardDescription>Suscriptores por nivel de riesgo</CardDescription>
            </CardHeader>
            <CardContent>
              <EnginePlaceholder description="Al configurarlo, aquí se mostrará cuántos suscriptores hay en cada nivel." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prioridad de hoy</CardTitle>
              <CardDescription>Clientes sugeridos para contactar</CardDescription>
            </CardHeader>
            <CardContent>
              <EnginePlaceholder description="Al configurarlo, aquí aparecerán los clientes priorizados para la gestión del día." />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Escala de niveles de riesgo</CardTitle>
            <CardDescription>
              Referencia de colores que usará la aplicación cuando el motor esté disponible.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {RISK_LEVELS.map((level) => (
              <span key={level.label} className="flex items-center gap-2 text-sm text-foreground">
                <span className={`h-2.5 w-2.5 rounded-full ${level.className}`} aria-hidden />
                {level.label}
              </span>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Estado actual de la demo: cartera sintética disponible y registro de intervenciones
          operativo. El cálculo automático de riesgo, la priorización y las alertas se incorporarán
          en una etapa posterior.
        </p>
      </div>
    </AppShell>
  );
}
