import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRules } from "@/hooks/usePortfolio";
import { getChurnPredictionProviderName } from "@/services/churnPrediction";
import { recalculateScores } from "@/services/portfolioService";
import { saveThresholds, updateRule } from "@/services/rulesService";
import type { RiskRule, RiskThresholds } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración del modelo | RevistaViva" },
      {
        name: "description",
        content:
          "Ajusta pesos de las reglas de riesgo, umbrales de clasificación y recalcula el Risk Score de la cartera.",
      },
      { property: "og:title", content: "Configuración del modelo | RevistaViva" },
      {
        property: "og:description",
        content: "Reglas, pesos y umbrales del motor de riesgo de churn.",
      },
    ],
  }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const rules = useRules();

  return (
    <>
      <PageHeader
        title="Configuración"
        description="El motor de riesgo es heurístico y transparente: aquí defines cuánto pesa cada señal."
        breadcrumbs={[{ label: "Configuración" }]}
      />

      <QueryState
        isLoading={rules.isLoading}
        error={rules.error}
        onRetry={() => void rules.refetch()}
      >
        {rules.data && <ConfigForm rules={rules.data.rules} thresholds={rules.data.thresholds} />}
      </QueryState>
    </>
  );
}

function ConfigForm({ rules, thresholds }: { rules: RiskRule[]; thresholds: RiskThresholds }) {
  const queryClient = useQueryClient();
  const [localRules, setLocalRules] = useState(rules);
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalRules(rules);
    setLocalThresholds(thresholds);
  }, [rules, thresholds]);

  const totalWeight = localRules
    .filter((rule) => rule.enabled)
    .reduce((sum, rule) => sum + rule.weight, 0);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        localRules.map((rule) =>
          updateRule(rule.id, { enabled: rule.enabled, weight: rule.weight }),
        ),
      );
      await saveThresholds(localThresholds);
      const count = await recalculateScores();
      await queryClient.invalidateQueries({ queryKey: ["risk-rules"] });
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Modelo actualizado", {
        description: `Se recalculó el Risk Score de ${count} suscriptores.`,
      });
    } catch (error) {
      toast.error("No fue posible guardar la configuración", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRecalculate() {
    setSaving(true);
    try {
      const count = await recalculateScores();
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Puntajes recalculados", {
        description: `${count} suscriptores evaluados con las reglas vigentes.`,
      });
    } catch (error) {
      toast.error("No fue posible recalcular", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reglas de riesgo</CardTitle>
          <CardDescription>
            Cada regla aporta como máximo su peso en puntos al Risk Score (0–100). Peso total
            activo: <span className="tabular text-foreground">{totalWeight}</span> pts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {localRules.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{rule.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{rule.description}</p>
                </div>
                <Switch
                  checked={rule.enabled}
                  aria-label={`Activar regla ${rule.name}`}
                  onCheckedChange={(checked) =>
                    setLocalRules((prev) =>
                      prev.map((item) =>
                        item.id === rule.id ? { ...item, enabled: checked } : item,
                      ),
                    )
                  }
                />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <Slider
                  className="flex-1"
                  value={[rule.weight]}
                  min={0}
                  max={40}
                  step={1}
                  disabled={!rule.enabled}
                  aria-label={`Peso de ${rule.name}`}
                  onValueChange={([value]) =>
                    setLocalRules((prev) =>
                      prev.map((item) =>
                        item.id === rule.id ? { ...item, weight: value ?? 0 } : item,
                      ),
                    )
                  }
                />
                <span className="tabular w-16 text-right text-sm text-foreground">
                  {rule.weight} pts
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Umbrales de clasificación</CardTitle>
          <CardDescription>
            Puntaje mínimo para clasificar un suscriptor en cada nivel de riesgo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {(["medium", "high", "critical"] as const).map((key) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`threshold-${key}`}>
                {key === "medium" ? "Medio" : key === "high" ? "Alto" : "Crítico"}
              </Label>
              <Input
                id={`threshold-${key}`}
                type="number"
                min={0}
                max={100}
                value={localThresholds[key]}
                onChange={(event) =>
                  setLocalThresholds((prev) => ({
                    ...prev,
                    [key]: Number(event.target.value),
                  }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Motor de predicción</CardTitle>
          <CardDescription>
            Proveedor activo:{" "}
            <span className="text-foreground">{getChurnPredictionProviderName()}</span>. La
            arquitectura permite reemplazarlo por un modelo de machine learning sin cambiar la
            interfaz.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Guardando…" : "Guardar y recalcular"}
          </Button>
          <Button variant="outline" onClick={() => void handleRecalculate()} disabled={saving}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Recalcular puntajes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
