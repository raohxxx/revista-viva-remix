import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Menu, ShieldCheck, Users, Workflow } from "lucide-react";
import { useState, type ReactNode } from "react";

import { DemoBadge } from "@/components/common/DemoBadge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/resumen", label: "Resumen", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/intervenciones", label: "Intervenciones", icon: Workflow },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <ShieldCheck className="h-4 w-4" aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-foreground">
          RevistaViva Retention Intelligence
        </p>
        <p className="text-[11px] text-muted-foreground">Detección temprana de riesgo de fuga</p>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className="flex-1 space-y-0.5 px-2" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarNote() {
  return (
    <div className="border-t border-sidebar-border p-3">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Demo autónoma del equipo de Retención. Los datos son sintéticos y viven solo en esta sesión.
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <NavLinks />
        <SidebarNote />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navegación</SheetTitle>
                <div className="flex h-full flex-col">
                  <Brand />
                  <NavLinks onNavigate={() => setOpen(false)} />
                  <SidebarNote />
                </div>
              </SheetContent>
            </Sheet>
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">
                RevistaViva Retention Intelligence
              </p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Detección temprana de riesgo de fuga
              </p>
            </div>
          </div>
          <DemoBadge />
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
