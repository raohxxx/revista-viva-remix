import { BarChart3, LayoutDashboard, Settings, Users, Workflow } from "lucide-react";

export const NAV_ITEMS = [
  {
    to: "/resumen",
    label: "Resumen",
    icon: LayoutDashboard,
    description: "Command center de retención",
  },
  { to: "/clientes", label: "Clientes", icon: Users, description: "Cartera de suscriptores" },
  {
    to: "/intervenciones",
    label: "Intervenciones",
    icon: Workflow,
    description: "Gestiones de retención",
  },
  { to: "/analisis", label: "Análisis", icon: BarChart3, description: "Efectividad y cobertura" },
  {
    to: "/configuracion",
    label: "Configuración",
    icon: Settings,
    description: "Motor de riesgo y umbrales",
  },
] as const;

export function routeTitle(pathname: string): string {
  if (pathname.startsWith("/clientes/")) return "Ficha del suscriptor";
  const match = NAV_ITEMS.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
  return match?.label ?? "VIDA";
}
