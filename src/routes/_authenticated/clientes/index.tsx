import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState, TableSkeleton } from "@/components/common/QueryState";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { FilterBar } from "@/components/customers/FilterBar";
import {
  applyFilters,
  EMPTY_FILTERS,
  sortItems,
  type CustomerFilters,
  type SortKey,
} from "@/components/customers/filters";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/hooks/usePortfolio";

export const Route = createFileRoute("/_authenticated/clientes/")({
  head: () => ({
    meta: [
      { title: "Cartera de suscriptores | RevistaViva" },
      {
        name: "description",
        content:
          "Explora, filtra y prioriza la cartera de suscriptores de RevistaViva según su riesgo de abandono.",
      },
      { property: "og:title", content: "Cartera de suscriptores | RevistaViva" },
      {
        property: "og:description",
        content: "Búsqueda y filtros por riesgo, renovación, plan y señales de churn.",
      },
    ],
  }),
  component: ClientesPage,
});

const PAGE_SIZE = 25;

function ClientesPage() {
  const portfolio = usePortfolio();
  const [filters, setFilters] = useState<CustomerFilters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const items = portfolio.data?.items ?? [];

  const plans = useMemo(
    () => [...new Set(items.map((item) => item.subscriber.plan))].sort(),
    [items],
  );

  const filtered = useMemo(
    () => sortItems(applyFilters(items, filters), sortKey, sortDirection),
    [items, filters, sortKey, sortDirection],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setPage(1);
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cartera completa de suscriptores con su nivel de riesgo, señales y estado de gestión."
        breadcrumbs={[{ label: "Clientes" }]}
      />

      <QueryState
        isLoading={portfolio.isLoading}
        error={portfolio.error}
        onRetry={() => void portfolio.refetch()}
        skeleton={<TableSkeleton rows={10} />}
      >
        <div className="space-y-4">
          <FilterBar
            filters={filters}
            plans={plans}
            resultCount={filtered.length}
            totalCount={items.length}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
            onClear={() => {
              setFilters(EMPTY_FILTERS);
              setPage(1);
            }}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description="Ningún suscriptor cumple con los filtros seleccionados. Ajusta los criterios de búsqueda."
              action={
                <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <>
              <CustomerTable
                items={pageItems}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </QueryState>
    </>
  );
}
