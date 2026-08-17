import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState, TableSkeleton } from "@/components/common/QueryState";
import { InterventionDialog } from "@/components/interventions/InterventionDialog";
import { OutcomeBadge, StatusBadge } from "@/components/interventions/badges";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatDate, formatNumber } from "@/lib/format";
import { ACTION_TYPES } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/intervenciones")({
  head: () => ({
    meta: [
      { title: "Intervenciones de retención | RevistaViva" },
      {
        name: "description",
        content:
          "Gestiona las acciones de retención de RevistaViva: pendientes, en curso y completadas, con su resultado.",
      },
      { property: "og:title", content: "Intervenciones de retención | RevistaViva" },
      {
        property: "og:description",
        content: "Cola operativa de contactos y resultados del equipo de Retención.",
      },
    ],
  }),
  component: IntervencionesPage,
});

const OPEN_STATUSES = new Set(["Pendiente", "Programada", "En curso"]);

function IntervencionesPage() {
  const portfolio = usePortfolio();
  const [tab, setTab] = useState<"open" | "completed" | "all">("open");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const actions = portfolio.data?.actions ?? [];

  const filtered = useMemo(() => {
    return actions
      .filter((action) => {
        if (tab === "open" && !OPEN_STATUSES.has(action.status)) return false;
        if (tab === "completed" && action.status !== "Completada") return false;
        if (typeFilter !== "all" && action.action_type !== typeFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const aDate = a.scheduled_at ?? a.created_at;
        const bDate = b.scheduled_at ?? b.created_at;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  }, [actions, tab, typeFilter]);

  const open = actions.filter((a) => OPEN_STATUSES.has(a.status)).length;
  const completed = actions.filter((a) => a.status === "Completada").length;
  const retained = actions.filter((a) => a.outcome === "Retenido").length;

  return (
    <>
      <PageHeader
        title="Intervenciones"
        description="Cola de trabajo del equipo de Retención: qué está pendiente, qué se hizo y con qué resultado."
        breadcrumbs={[{ label: "Intervenciones" }]}
      />

      <QueryState
        isLoading={portfolio.isLoading}
        error={portfolio.error}
        onRetry={() => void portfolio.refetch()}
        skeleton={<TableSkeleton rows={8} />}
      >
        <div className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total registradas" value={formatNumber(actions.length)} />
            <MetricCard label="Abiertas" value={formatNumber(open)} accent="high" />
            <MetricCard label="Completadas" value={formatNumber(completed)} />
            <MetricCard
              label="Con retención lograda"
              value={formatNumber(retained)}
              accent="positive"
              tooltip="Intervenciones cuyo resultado registrado fue 'Retenido'. La atribución es declarativa, no causal."
            />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
              <TabsList>
                <TabsTrigger value="open">Abiertas</TabsTrigger>
                <TabsTrigger value="completed">Completadas</TabsTrigger>
                <TabsTrigger value="all">Todas</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[220px]" aria-label="Filtrar por tipo de acción">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Sin intervenciones en esta vista"
              description="Registra acciones desde la ficha de un suscriptor para hacerles seguimiento aquí."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link to="/clientes">Ir a la cartera</Link>
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead className="text-right">Gestionar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((action) => {
                    const item = portfolio.data?.byId.get(action.subscriber_id);
                    return (
                      <TableRow key={action.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(action.completed_at ?? action.scheduled_at ?? action.created_at)}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          {item ? (
                            <Link
                              to="/clientes/$id"
                              params={{ id: action.subscriber_id }}
                              className="hover:underline"
                            >
                              {item.subscriber.customer_code}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {item ? <RiskBadge level={item.prediction.level} /> : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{action.action_type}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {action.owner ?? "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={action.status} />
                        </TableCell>
                        <TableCell>
                          {action.outcome ? <OutcomeBadge outcome={action.outcome} /> : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <InterventionDialog
                            subscriberId={action.subscriber_id}
                            customerCode={item?.subscriber.customer_code ?? "—"}
                            action={action}
                            trigger={
                              <Button variant="ghost" size="sm">
                                Actualizar
                              </Button>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </QueryState>
    </>
  );
}
