import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface QueryStateProps {
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  skeleton?: ReactNode;
  children: ReactNode;
}

export function QueryState({ isLoading, error, onRetry, skeleton, children }: QueryStateProps) {
  if (isLoading) {
    return <>{skeleton ?? <DefaultSkeleton />}</>;
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
        <AlertTriangle className="mb-3 h-5 w-5 text-destructive" aria-hidden />
        <p className="text-sm font-medium text-foreground">No fue posible cargar la información</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

export function DefaultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}
