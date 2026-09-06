import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, RefreshCw, Search, User2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import bgAsset from "@/assets/vida-bg.jpg.asset.json";
import { BrandLockup } from "@/components/layout/BrandLockup";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { NavDrawer } from "@/components/layout/NavDrawer";
import { routeTitle } from "@/components/layout/nav-items";
import { PERIOD_OPTIONS, ShellProvider, useShell } from "@/components/layout/shell-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

function useUpdatedLabel() {
  const [stamp, setStamp] = useState<string | null>(null);
  return { stamp, setStamp };
}

function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { period, setPeriod } = useShell();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { stamp, setStamp } = useUpdatedLabel();
  const [refreshing, setRefreshing] = useState(false);

  const title = routeTitle(pathname);
  const showPeriod = pathname.startsWith("/resumen") || pathname.startsWith("/analisis");

  async function refresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setStamp(new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }));
    setRefreshing(false);
  }

  return (
    <header className="glass-card grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-none border-0 border-b px-3 lg:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <NavDrawer
          open={navOpen}
          onOpenChange={setNavOpen}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="min-h-10 min-w-10"
              aria-label="Abrir navegación"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          }
        />
        <BrandLockup title={title} />
      </div>

      <div className="min-w-0 sm:hidden">
        <p className="truncate text-xs font-semibold tracking-[0.16em] text-foreground uppercase">
          {title}
        </p>
      </div>
      <div className="hidden sm:block" />


      <div className="flex items-center gap-1.5">
        {showPeriod && (
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger
              className="hidden h-8 w-[150px] md:flex"
              aria-label="Periodo de análisis"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="hidden min-h-10 min-w-10 sm:inline-flex"
          aria-label="Buscar y navegar (Ctrl+K)"
          onClick={() => setPaletteOpen(true)}
        >
          <Search className="h-4 w-4" aria-hidden />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="min-h-10 gap-1.5 text-muted-foreground"
          onClick={() => void refresh()}
          aria-label="Actualizar datos"
        >
          <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
          <span className="hidden text-[11px] lg:inline">
            {stamp ? `Actualizado ${stamp}` : "Actualizar"}
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-10 min-w-10"
              aria-label="Menú de usuario"
            >
              <User2 className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
              {user?.email ?? "Sesión activa"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOut className="h-4 w-4" aria-hidden />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <div
        className="brand-canvas grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-background"
        style={{ ["--brand-canvas-image" as string]: `url(${bgAsset.url})` }}
      >
        <Header />
        <main className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex h-full w-full max-w-[1800px] min-w-0 flex-col px-3 py-3 lg:px-5 lg:py-4">
            {children}
          </div>
        </main>
      </div>
    </ShellProvider>
  );
}

