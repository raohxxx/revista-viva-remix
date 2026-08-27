import { FlaskConical } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function DemoBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          <FlaskConical className="h-3 w-3" aria-hidden />
          Datos de demostración
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        Datos sintéticos cargados en memoria para demostrar el producto. No corresponden a
        suscriptores reales de RevistaViva.
      </TooltipContent>
    </Tooltip>
  );
}
