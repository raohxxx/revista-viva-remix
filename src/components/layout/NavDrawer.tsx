import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

export function NavDrawer({ open, onOpenChange, trigger }: NavDrawerProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, signOut } = useAuth();
  const email = user?.email ?? "Sesión activa";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-[min(20rem,88vw)] gap-0 p-0">
        <SheetTitle className="sr-only">Navegación principal</SheetTitle>
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-2.5 border-b border-border px-4 py-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-foreground">VIDA</p>
              <p className="truncate text-[11px] text-muted-foreground">Análisis de churn</p>
            </div>
          </div>

          <nav className="min-h-0 overflow-y-auto p-2" aria-label="Navegación principal">
            <ul className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => onOpenChange(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className={cn("h-4 w-4 shrink-0", active && "text-brand-teal")}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="block truncate">{item.label}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border p-3">
            <p className="truncate px-1 text-xs text-muted-foreground">{email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-full justify-start text-muted-foreground"
              onClick={() => void signOut()}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
