import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { RiskBadge } from "@/components/risk/RiskBadge";
import { RiskScoreInline } from "@/components/risk/RiskScore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  daysSince,
  daysUntil,
  formatDate,
  formatPercentChange,
  formatTenure,
  percentChange,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { SIGNAL_LABEL, type SubscriberWithRisk } from "@/types/domain";

import type { SortKey } from "./filters";

const INTERVENTION_LABEL: Record<SubscriberWithRisk["interventionStatus"], string> = {
  none: "Sin intervención",
  open: "En curso",
  completed: "Completada",
};

interface CustomerTableProps {
  items: SubscriberWithRisk[];
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
  onSort: (key: SortKey) => void;
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: "asc" | "desc";
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === sortKey;
  const Icon = !active ? ChevronsUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className="h-3 w-3" aria-hidden />
      </button>
    </TableHead>
  );
}

export function CustomerTable({ items, sortKey, sortDirection, onSort }: CustomerTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Cliente</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Antigüedad</TableHead>
            <SortHeader
              label="Score"
              sortKey="score"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <TableHead>Riesgo</TableHead>
            <SortHeader
              label="Renovación"
              sortKey="renewal"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <SortHeader
              label="Última actividad"
              sortKey="last_access"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <SortHeader
              label="Var. actividad"
              sortKey="activity"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <TableHead>Principal señal</TableHead>
            <TableHead>Intervención</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const { subscriber, prediction } = item;
            const change = percentChange(subscriber.sessions_30d, subscriber.sessions_previous_30d);
            const renewalDays = daysUntil(subscriber.renewal_date);
            const inactivity = daysSince(subscriber.last_access_at);

            return (
              <TableRow
                key={subscriber.id}
                className={cn(
                  "cursor-pointer",
                  prediction.level === "critical" && "bg-risk-critical-soft/40",
                )}
                onClick={() => {
                  void navigate({ to: "/clientes/$id", params: { id: subscriber.id } });
                }}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {subscriber.customer_code}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {subscriber.plan}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatTenure(subscriber.subscription_start_date)}
                </TableCell>
                <TableCell>
                  <RiskScoreInline score={prediction.score} level={prediction.level} />
                </TableCell>
                <TableCell>
                  <RiskBadge level={prediction.level} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="text-foreground">{formatDate(subscriber.renewal_date)}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {renewalDays == null
                      ? "—"
                      : renewalDays < 0
                        ? "vencida"
                        : `en ${renewalDays} días`}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {inactivity == null ? "—" : `hace ${inactivity} días`}
                </TableCell>
                <TableCell
                  className={cn(
                    "tabular whitespace-nowrap",
                    change != null && change < -15 ? "text-risk-high" : "text-muted-foreground",
                  )}
                >
                  {formatPercentChange(change)}
                </TableCell>
                <TableCell className="max-w-[180px] text-xs text-muted-foreground">
                  {prediction.principalSignalKey
                    ? SIGNAL_LABEL[prediction.principalSignalKey]
                    : "Sin señales"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {INTERVENTION_LABEL[item.interventionStatus]}
                </TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/clientes/$id" params={{ id: subscriber.id }}>
                      Ver cliente
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
