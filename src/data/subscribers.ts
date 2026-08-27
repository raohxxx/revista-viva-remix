/** Dataset sintético en memoria — 40 suscriptores de demostración de RevistaViva.
 * No corresponde a personas reales: cada registro usa un código anónimo RV-10001..RV-10040.
 * Generado con coherencia interna (antigüedad, actividad, pagos, satisfacción y renovaciones).
 */

export type PlanName = "Digital Mensual" | "Digital Anual" | "Premium";
export type BillingPeriod = "mensual" | "anual";
/** Perfil sintético usado solo para construir el dataset. No se muestra en la interfaz. */
export type SyntheticProfile = "critico" | "alto" | "medio" | "bajo";

export interface Subscriber {
  customer_code: string;
  profile: SyntheticProfile;
  plan: PlanName;
  billing_period: BillingPeriod;
  /** Precio de lista del plan en CLP (anual para Digital Anual). */
  plan_list_price: number;
  /** Valor mensual equivalente en CLP. */
  monthly_value: number;
  subscription_start_date: string;
  renewal_date: string;
  sessions_30d: number;
  sessions_previous_30d: number;
  articles_read_30d: number;
  days_since_last_access: number;
  payment_failures_90d: number;
  complaints_90d: number;
  /** Puntaje de satisfacción de 1 a 10. */
  satisfaction_score: number;
}

export const PLAN_CATALOG: { plan: PlanName; price: number; period: BillingPeriod }[] = [
  { plan: "Digital Mensual", price: 6990, period: "mensual" },
  { plan: "Digital Anual", price: 69900, period: "anual" },
  { plan: "Premium", price: 9990, period: "mensual" },
];

export const SUBSCRIBERS: Subscriber[] = [
  {"customer_code":"RV-10001","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-05-17","renewal_date":"2027-02-17","sessions_30d":14,"sessions_previous_30d":12,"articles_read_30d":26,"days_since_last_access":2,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":8},
  {"customer_code":"RV-10002","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2025-03-15","renewal_date":"2026-10-31","sessions_30d":9,"sessions_previous_30d":12,"articles_read_30d":15,"days_since_last_access":5,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":6},
  {"customer_code":"RV-10003","profile":"alto","plan":"Digital Mensual","billing_period":"mensual","plan_list_price":6990,"monthly_value":6990,"subscription_start_date":"2023-03-12","renewal_date":"2026-09-11","sessions_30d":3,"sessions_previous_30d":12,"articles_read_30d":5,"days_since_last_access":17,"payment_failures_90d":2,"complaints_90d":0,"satisfaction_score":4},
  {"customer_code":"RV-10004","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-04-12","renewal_date":"2027-01-11","sessions_30d":16,"sessions_previous_30d":15,"articles_read_30d":34,"days_since_last_access":4,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":9},
  {"customer_code":"RV-10005","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2026-01-10","renewal_date":"2026-09-23","sessions_30d":9,"sessions_previous_30d":8,"articles_read_30d":12,"days_since_last_access":9,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":7},
  {"customer_code":"RV-10006","profile":"critico","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-09-02","renewal_date":"2026-09-08","sessions_30d":0,"sessions_previous_30d":13,"articles_read_30d":3,"days_since_last_access":54,"payment_failures_90d":2,"complaints_90d":3,"satisfaction_score":1},
  {"customer_code":"RV-10007","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-01-30","renewal_date":"2026-12-19","sessions_30d":12,"sessions_previous_30d":11,"articles_read_30d":25,"days_since_last_access":2,"payment_failures_90d":0,"complaints_90d":1,"satisfaction_score":8},
  {"customer_code":"RV-10008","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2023-08-05","renewal_date":"2026-10-17","sessions_30d":8,"sessions_previous_30d":11,"articles_read_30d":9,"days_since_last_access":10,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":5},
  {"customer_code":"RV-10009","profile":"alto","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2022-11-07","renewal_date":"2026-09-21","sessions_30d":6,"sessions_previous_30d":12,"articles_read_30d":5,"days_since_last_access":10,"payment_failures_90d":1,"complaints_90d":0,"satisfaction_score":5},
  {"customer_code":"RV-10010","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2024-08-27","renewal_date":"2026-12-14","sessions_30d":27,"sessions_previous_30d":16,"articles_read_30d":18,"days_since_last_access":0,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":9},
  {"customer_code":"RV-10011","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2023-05-28","renewal_date":"2026-10-21","sessions_30d":7,"sessions_previous_30d":11,"articles_read_30d":7,"days_since_last_access":6,"payment_failures_90d":0,"complaints_90d":1,"satisfaction_score":7},
  {"customer_code":"RV-10012","profile":"alto","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2023-03-31","renewal_date":"2026-09-21","sessions_30d":4,"sessions_previous_30d":17,"articles_read_30d":5,"days_since_last_access":23,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":5},
  {"customer_code":"RV-10013","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2024-01-26","renewal_date":"2026-10-12","sessions_30d":20,"sessions_previous_30d":8,"articles_read_30d":23,"days_since_last_access":2,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":10},
  {"customer_code":"RV-10014","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2024-02-08","renewal_date":"2026-10-09","sessions_30d":10,"sessions_previous_30d":9,"articles_read_30d":5,"days_since_last_access":6,"payment_failures_90d":0,"complaints_90d":1,"satisfaction_score":7},
  {"customer_code":"RV-10015","profile":"critico","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-12-02","renewal_date":"2026-08-30","sessions_30d":2,"sessions_previous_30d":13,"articles_read_30d":1,"days_since_last_access":41,"payment_failures_90d":3,"complaints_90d":3,"satisfaction_score":3},
  {"customer_code":"RV-10016","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2023-06-26","renewal_date":"2026-11-07","sessions_30d":22,"sessions_previous_30d":19,"articles_read_30d":13,"days_since_last_access":0,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":10},
  {"customer_code":"RV-10017","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2025-07-29","renewal_date":"2026-10-22","sessions_30d":10,"sessions_previous_30d":13,"articles_read_30d":14,"days_since_last_access":3,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":5},
  {"customer_code":"RV-10018","profile":"alto","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2026-02-05","renewal_date":"2026-09-01","sessions_30d":5,"sessions_previous_30d":16,"articles_read_30d":4,"days_since_last_access":15,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":6},
  {"customer_code":"RV-10019","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-11-29","renewal_date":"2027-01-18","sessions_30d":20,"sessions_previous_30d":11,"articles_read_30d":25,"days_since_last_access":3,"payment_failures_90d":0,"complaints_90d":1,"satisfaction_score":8},
  {"customer_code":"RV-10020","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2022-11-30","renewal_date":"2026-09-30","sessions_30d":7,"sessions_previous_30d":13,"articles_read_30d":10,"days_since_last_access":9,"payment_failures_90d":1,"complaints_90d":0,"satisfaction_score":8},
  {"customer_code":"RV-10021","profile":"alto","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2022-09-08","renewal_date":"2026-09-25","sessions_30d":6,"sessions_previous_30d":11,"articles_read_30d":4,"days_since_last_access":15,"payment_failures_90d":2,"complaints_90d":0,"satisfaction_score":4},
  {"customer_code":"RV-10022","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2022-10-20","renewal_date":"2027-01-01","sessions_30d":26,"sessions_previous_30d":17,"articles_read_30d":15,"days_since_last_access":0,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":9},
  {"customer_code":"RV-10023","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2022-10-17","renewal_date":"2026-10-12","sessions_30d":7,"sessions_previous_30d":15,"articles_read_30d":16,"days_since_last_access":11,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":8},
  {"customer_code":"RV-10024","profile":"critico","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2026-01-13","renewal_date":"2026-08-31","sessions_30d":0,"sessions_previous_30d":18,"articles_read_30d":0,"days_since_last_access":30,"payment_failures_90d":3,"complaints_90d":2,"satisfaction_score":3},
  {"customer_code":"RV-10025","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2023-01-23","renewal_date":"2027-02-10","sessions_30d":16,"sessions_previous_30d":16,"articles_read_30d":12,"days_since_last_access":2,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":9},
  {"customer_code":"RV-10026","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2024-03-18","renewal_date":"2026-10-21","sessions_30d":10,"sessions_previous_30d":14,"articles_read_30d":15,"days_since_last_access":9,"payment_failures_90d":1,"complaints_90d":0,"satisfaction_score":7},
  {"customer_code":"RV-10027","profile":"alto","plan":"Digital Mensual","billing_period":"mensual","plan_list_price":6990,"monthly_value":6990,"subscription_start_date":"2024-12-20","renewal_date":"2026-09-05","sessions_30d":4,"sessions_previous_30d":14,"articles_read_30d":2,"days_since_last_access":21,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":6},
  {"customer_code":"RV-10028","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2024-08-29","renewal_date":"2026-10-22","sessions_30d":19,"sessions_previous_30d":14,"articles_read_30d":36,"days_since_last_access":0,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":8},
  {"customer_code":"RV-10029","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2025-02-22","renewal_date":"2026-11-01","sessions_30d":13,"sessions_previous_30d":10,"articles_read_30d":7,"days_since_last_access":8,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":5},
  {"customer_code":"RV-10030","profile":"alto","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2025-07-31","renewal_date":"2026-09-01","sessions_30d":4,"sessions_previous_30d":17,"articles_read_30d":6,"days_since_last_access":23,"payment_failures_90d":1,"complaints_90d":0,"satisfaction_score":6},
  {"customer_code":"RV-10031","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2022-11-28","renewal_date":"2027-02-06","sessions_30d":19,"sessions_previous_30d":14,"articles_read_30d":39,"days_since_last_access":3,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":10},
  {"customer_code":"RV-10032","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2023-04-12","renewal_date":"2026-10-22","sessions_30d":14,"sessions_previous_30d":16,"articles_read_30d":12,"days_since_last_access":10,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":8},
  {"customer_code":"RV-10033","profile":"critico","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2024-04-28","renewal_date":"2026-08-28","sessions_30d":2,"sessions_previous_30d":19,"articles_read_30d":3,"days_since_last_access":49,"payment_failures_90d":1,"complaints_90d":1,"satisfaction_score":1},
  {"customer_code":"RV-10034","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-10-26","renewal_date":"2026-11-04","sessions_30d":19,"sessions_previous_30d":15,"articles_read_30d":20,"days_since_last_access":4,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":10},
  {"customer_code":"RV-10035","profile":"medio","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2025-09-14","renewal_date":"2026-09-30","sessions_30d":8,"sessions_previous_30d":11,"articles_read_30d":9,"days_since_last_access":10,"payment_failures_90d":1,"complaints_90d":0,"satisfaction_score":8},
  {"customer_code":"RV-10036","profile":"alto","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2024-04-21","renewal_date":"2026-09-10","sessions_30d":4,"sessions_previous_30d":14,"articles_read_30d":8,"days_since_last_access":22,"payment_failures_90d":0,"complaints_90d":2,"satisfaction_score":3},
  {"customer_code":"RV-10037","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-03-04","renewal_date":"2026-11-24","sessions_30d":22,"sessions_previous_30d":19,"articles_read_30d":28,"days_since_last_access":2,"payment_failures_90d":0,"complaints_90d":1,"satisfaction_score":8},
  {"customer_code":"RV-10038","profile":"bajo","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2023-10-28","renewal_date":"2027-01-31","sessions_30d":18,"sessions_previous_30d":15,"articles_read_30d":28,"days_since_last_access":4,"payment_failures_90d":0,"complaints_90d":0,"satisfaction_score":9},
  {"customer_code":"RV-10039","profile":"critico","plan":"Premium","billing_period":"mensual","plan_list_price":9990,"monthly_value":9990,"subscription_start_date":"2024-04-03","renewal_date":"2026-09-06","sessions_30d":1,"sessions_previous_30d":21,"articles_read_30d":2,"days_since_last_access":31,"payment_failures_90d":2,"complaints_90d":2,"satisfaction_score":4},
  {"customer_code":"RV-10040","profile":"bajo","plan":"Digital Anual","billing_period":"anual","plan_list_price":69900,"monthly_value":5825,"subscription_start_date":"2025-11-30","renewal_date":"2026-10-30","sessions_30d":31,"sessions_previous_30d":19,"articles_read_30d":13,"days_since_last_access":1,"payment_failures_90d":0,"complaints_90d":1,"satisfaction_score":10},
];

export function getSubscriber(code: string): Subscriber | undefined {
  return SUBSCRIBERS.find((s) => s.customer_code === code);
}
