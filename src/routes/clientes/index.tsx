import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatCLP, formatDate, formatNumber } from "@/lib/format";
import { PLAN_CATALOG, SUBSCRIBERS } from "@/data/subscribers";

export const Route = createFileRoute("/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes | RevistaViva Retention Intelligence" },
      {
        name: "description",
        content:
          "Cartera sintética de 40 suscriptores de RevistaViva con plan, valor mensual, renovación y actividad reciente.",
      },
      { property: "og:title", content: "Clientes | RevistaViva Retention Intelligence" },
      {
        property: "og:description",
        content: "Listado de suscriptores con datos de suscripción y actividad.",
      },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("todos");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return SUBSCRIBERS.filter((item) => {
      if (term && !item.customer_code.toLowerCase().includes(term)) return false;
      if (plan !== "todos" && item.plan !== plan) return false;
      return true;
    });
  }, [search, plan]);

  return (
    <AppShell>
      <PageHeader
        title="Clientes"
        description="Cartera sintética de 40 suscriptores. Cada registro usa un código anónimo."
        breadcrumbs={[{ label: "Clientes" }]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por código (ej: RV-10012)"
                aria-label="Buscar suscriptor por código"
                className="pl-9"
              />
            </div>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="sm:w-56" aria-label="Filtrar por plan">
                <SelectValue placeholder="Todos los planes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los planes</SelectItem>
                {PLAN_CATALOG.map((item) => (
                  <SelectItem key={item.plan} value={item.plan}>
                    {item.plan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            {formatNumber(rows.length)} de {formatNumber(SUBSCRIBERS.length)} suscriptores
          </p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Valor mensual</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Renovación</TableHead>
                  <TableHead className="text-right">Sesiones 30d</TableHead>
                  <TableHead className="text-right">Sesiones previas</TableHead>
                  <TableHead className="text-right">Últ. acceso</TableHead>
                  <TableHead className="text-right">Satisfacción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.customer_code} className="hover:bg-accent/60">
                    <TableCell className="font-medium">
                      <Link
                        to="/clientes/$code"
                        params={{ code: item.customer_code }}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {item.customer_code}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.plan}</TableCell>
                    <TableCell className="tabular text-right">
                      {formatCLP(item.monthly_value)}
                    </TableCell>
                    <TableCell className="tabular text-muted-foreground">
                      {formatDate(item.subscription_start_date)}
                    </TableCell>
                    <TableCell className="tabular text-muted-foreground">
                      {formatDate(item.renewal_date)}
                    </TableCell>
                    <TableCell className="tabular text-right">{item.sessions_30d}</TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">
                      {item.sessions_previous_30d}
                    </TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">
                      {item.days_since_last_access} d
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {item.satisfaction_score}/10
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      No hay suscriptores que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
