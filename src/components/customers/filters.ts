import { daysUntil, monthlyRevenue } from "@/lib/format";
import { classifyPriority } from "@/services/riskEngine";
import type { PriorityLevel, RiskLevel, SignalKey, SubscriberWithRisk } from "@/types/domain";

export type RenewalFilter = "all" | "7" | "15" | "30" | "30plus";
export type InterventionFilter = "all" | "none" | "open" | "completed";
export type PriorityFilter = PriorityLevel | "all";

export interface CustomerFilters {
  search: string;
  risk: RiskLevel | "all";
  priority: PriorityFilter;
  renewal: RenewalFilter;
  plan: string;
  intervention: InterventionFilter;
  signal: SignalKey | "all";
}

export const EMPTY_FILTERS: CustomerFilters = {
  search: "",
  risk: "all",
  priority: "all",
  renewal: "all",
  plan: "all",
  intervention: "all",
  signal: "all",
};

export function hasActiveFilters(filters: CustomerFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.risk !== "all" ||
    filters.priority !== "all" ||
    filters.renewal !== "all" ||
    filters.plan !== "all" ||
    filters.intervention !== "all" ||
    filters.signal !== "all"
  );
}

function matchesRenewal(item: SubscriberWithRisk, filter: RenewalFilter): boolean {
  if (filter === "all") return true;
  const days = daysUntil(item.subscriber.renewal_date);
  if (days == null) return false;
  if (filter === "30plus") return days > 30;
  return days <= Number(filter);
}

export function applyFilters(
  items: SubscriberWithRisk[],
  filters: CustomerFilters,
): SubscriberWithRisk[] {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (search) {
      const haystack = [
        item.subscriber.customer_code,
        item.subscriber.full_name,
        item.subscriber.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.risk !== "all" && item.prediction.level !== filters.risk) return false;
    if (filters.priority !== "all" && classifyPriority(item.priorityScore) !== filters.priority)
      return false;
    if (filters.plan !== "all" && item.subscriber.plan !== filters.plan) return false;
    if (filters.intervention !== "all" && item.interventionStatus !== filters.intervention)
      return false;
    if (filters.signal !== "all" && item.prediction.principalSignalKey !== filters.signal)
      return false;
    if (!matchesRenewal(item, filters.renewal)) return false;
    return true;
  });
}

export type SortKey = "score" | "priority" | "renewal" | "last_access" | "activity" | "value";

export function sortItems(
  items: SubscriberWithRisk[],
  key: SortKey,
  direction: "asc" | "desc",
): SubscriberWithRisk[] {
  const factor = direction === "asc" ? 1 : -1;

  const value = (item: SubscriberWithRisk): number => {
    switch (key) {
      case "score":
        return item.prediction.score;
      case "priority":
        return item.priorityScore;
      case "renewal":
        return daysUntil(item.subscriber.renewal_date) ?? 9999;
      case "last_access":
        return item.subscriber.last_access_at
          ? new Date(item.subscriber.last_access_at).getTime()
          : 0;
      case "activity": {
        const prev = item.subscriber.sessions_previous_30d;
        if (prev === 0) return 0;
        return ((item.subscriber.sessions_30d - prev) / prev) * 100;
      }
      case "value":
        return monthlyRevenue(item.subscriber);
      default:
        return 0;
    }
  };

  return [...items].sort(
    (a, b) => (value(a) - value(b)) * factor || b.priorityScore - a.priorityScore,
  );
}
