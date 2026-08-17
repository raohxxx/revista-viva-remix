/** Utilidades de formato local (Chile). */

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return clpFormatter.format(value);
}

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** DD/MM/YYYY */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date || Number.isNaN(date.getTime())) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date || Number.isNaN(date.getTime())) return "—";
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date)} ${hh}:${mi}`;
}

/** Acepta "YYYY-MM-DD" (date) y timestamps ISO sin desfase de zona. */
export function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y!, (m ?? 1) - 1, d ?? 1);
  }
  return new Date(value);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Días restantes hasta una fecha (negativo si ya pasó). */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const target = startOfDay(parseDate(value));
  if (Number.isNaN(target.getTime())) return null;
  const today = startOfDay(new Date());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Días transcurridos desde una fecha. */
export function daysSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const source = startOfDay(parseDate(value));
  if (Number.isNaN(source.getTime())) return null;
  const today = startOfDay(new Date());
  return Math.max(0, Math.round((today.getTime() - source.getTime()) / 86_400_000));
}

/**
 * Variación porcentual entre dos períodos.
 * Devuelve null cuando el período anterior es 0 (evita Infinity/NaN).
 */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatPercentChange(value: number | null): string {
  if (value == null) return "s/ referencia";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

/** Antigüedad legible a partir de la fecha de inicio de suscripción. */
export function formatTenure(startDate: string | null | undefined): string {
  const days = daysSince(startDate);
  if (days == null) return "—";
  const months = Math.floor(days / 30);
  if (months < 1) return `${days} días`;
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} año${years > 1 ? "s" : ""}` : `${years}a ${rest}m`;
}

export function tenureMonths(startDate: string | null | undefined): number {
  const days = daysSince(startDate);
  return days == null ? 0 : Math.floor(days / 30);
}
