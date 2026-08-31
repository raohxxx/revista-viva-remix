import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acceso | RevistaViva Retention Intelligence" },
      {
        name: "description",
        content:
          "Acceso interno al sistema de detección temprana de riesgo de fuga de suscriptores de RevistaViva.",
      },
      { property: "og:title", content: "Acceso | RevistaViva Retention Intelligence" },
      {
        property: "og:description",
        content: "Herramienta interna del equipo de Retención de RevistaViva.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/resumen" });
    });
  }, [navigate]);

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("No fue posible iniciar sesión", { description: error.message });
      return;
    }
    toast.success("Sesión iniciada");
    void navigate({ to: "/resumen" });
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/resumen` },
    });
    setLoading(false);
    if (error) {
      toast.error("No fue posible crear la cuenta", { description: error.message });
      return;
    }
    toast.success("Cuenta creada", { description: "Ya puedes acceder al sistema." });
    void navigate({ to: "/resumen" });
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("No fue posible continuar con Google", {
        description: result.error.message ?? "Intenta nuevamente.",
      });
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/resumen" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold text-foreground">
            RevistaViva Retention Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">Detección temprana de riesgo de fuga</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="signin">
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form className="space-y-4" onSubmit={handleSignIn}>
                <Fields
                  email={email}
                  password={password}
                  onEmail={setEmail}
                  onPassword={setPassword}
                  idPrefix="signin"
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={handleSignUp}>
                <Fields
                  email={email}
                  password={password}
                  onEmail={setEmail}
                  onPassword={setPassword}
                  idPrefix="signup"
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Crear cuenta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />o continuar con
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Google
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Herramienta interna del equipo de Retención. Opera sobre datos sintéticos de demostración.
        </p>
      </div>
    </div>
  );
}

function Fields({
  email,
  password,
  onEmail,
  onPassword,
  idPrefix,
}: {
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  idPrefix: string;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-email`}>Correo corporativo</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => onEmail(event.target.value)}
          placeholder="nombre@revistaviva.cl"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-password`}>Contraseña</Label>
        <Input
          id={`${idPrefix}-password`}
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(event) => onPassword(event.target.value)}
        />
      </div>
    </>
  );
}
