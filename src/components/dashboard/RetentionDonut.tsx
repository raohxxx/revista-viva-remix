import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

interface RetentionDonutProps {
  retained: number;
  atRisk: number;
}

export function RetentionDonut({ retained, atRisk }: RetentionDonutProps) {
  const total = retained + atRisk;
  const rate = total === 0 ? 0 : (retained / total) * 100;
  const data = [
    { key: "retenidos", value: Math.max(retained, 0) },
    { key: "riesgo", value: Math.max(atRisk, 0) },
  ];

  return (
    <Card className="glass-card flex flex-col gap-2 p-4">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Retención de usuarios
      </p>
      <div className="relative h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total === 0 ? [{ key: "vacio", value: 1 }] : data}
              dataKey="value"
              innerRadius="66%"
              outerRadius="94%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={total === 0 ? 0 : 2}
              stroke="none"
              isAnimationActive={false}
            >
              {(total === 0 ? [{ key: "vacio" }] : data).map((entry, index) => (
                <Cell
                  key={entry.key}
                  fill={index === 0 ? "var(--brand-teal)" : "var(--brand-magenta)"}
                  fillOpacity={index === 0 ? 0.9 : 0.35}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="tabular text-2xl font-semibold text-foreground">{rate.toFixed(0)}%</p>
            <p className="text-[11px] text-muted-foreground">estables</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatNumber(retained)} estables · {formatNumber(atRisk)} en riesgo
      </p>
    </Card>
  );
}
