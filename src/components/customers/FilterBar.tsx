import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SIGNAL_LABEL, type RiskLevel, type SignalKey } from "@/types/domain";

import { hasActiveFilters, type CustomerFilters } from "./filters";

interface FilterBarProps {
  filters: CustomerFilters;
  plans: string[];
  resultCount: number;
  totalCount: number;
  onChange: (filters: CustomerFilters) => void;
  onClear: () => void;
}

const RISK_OPTIONS: { value: RiskLevel | "all"; label: string }[] = [
  { value: "all", label: "Todos los riesgos" },
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
  { value: "critical", label: "Crítico" },
];

const SIGNAL_OPTIONS: { value: SignalKey | "all"; label: string }[] = [
  { value: "all", label: "Toda señal principal" },
  ...(Object.keys(SIGNAL_LABEL) as SignalKey[]).map((key) => ({
    value: key,
    label: SIGNAL_LABEL[key],
  })),
];

export function FilterBar({
  filters,
  plans,
  resultCount,
  totalCount,
  onChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, email o código (ej: RV-10482)"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            aria-label="Buscar cliente"
          />
        </div>

        <Select
          value={filters.risk}
          onValueChange={(value) => onChange({ ...filters, risk: value as RiskLevel | "all" })}
        >
          <SelectTrigger className="w-[170px]" aria-label="Filtrar por nivel de riesgo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RISK_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onChange({ ...filters, priority: value as CustomerFilters["priority"] })
          }
        >
          <SelectTrigger className="w-[170px]" aria-label="Filtrar por prioridad">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda prioridad</SelectItem>
            <SelectItem value="very_high">Prioridad muy alta</SelectItem>
            <SelectItem value="high">Prioridad alta</SelectItem>
            <SelectItem value="medium">Prioridad media</SelectItem>
            <SelectItem value="low">Prioridad baja</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.renewal}
          onValueChange={(value) =>
            onChange({ ...filters, renewal: value as CustomerFilters["renewal"] })
          }
        >
          <SelectTrigger className="w-[170px]" aria-label="Filtrar por renovación">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda renovación</SelectItem>
            <SelectItem value="7">Próximos 7 días</SelectItem>
            <SelectItem value="15">Próximos 15 días</SelectItem>
            <SelectItem value="30">Próximos 30 días</SelectItem>
            <SelectItem value="30plus">Más de 30 días</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.plan} onValueChange={(value) => onChange({ ...filters, plan: value })}>
          <SelectTrigger className="w-[160px]" aria-label="Filtrar por plan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los planes</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.intervention}
          onValueChange={(value) =>
            onChange({ ...filters, intervention: value as CustomerFilters["intervention"] })
          }
        >
          <SelectTrigger className="w-[180px]" aria-label="Filtrar por intervención">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda intervención</SelectItem>
            <SelectItem value="none">Sin intervención</SelectItem>
            <SelectItem value="open">Pendiente / en curso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.signal}
          onValueChange={(value) => onChange({ ...filters, signal: value as SignalKey | "all" })}
        >
          <SelectTrigger className="w-[190px]" aria-label="Filtrar por señal principal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIGNAL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" aria-hidden />
            Limpiar filtros
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Mostrando <span className="text-foreground">{resultCount}</span> de {totalCount} suscriptores
      </p>
    </div>
  );
}
