
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code text NOT NULL UNIQUE,
  subscription_status text NOT NULL DEFAULT 'Activa',
  plan text NOT NULL,
  subscription_start_date date NOT NULL,
  renewal_date date NOT NULL,
  monthly_value integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'Tarjeta de crédito',
  last_access_at timestamptz,
  sessions_30d integer NOT NULL DEFAULT 0,
  sessions_previous_30d integer NOT NULL DEFAULT 0,
  articles_read_30d integer NOT NULL DEFAULT 0,
  articles_read_previous_30d integer NOT NULL DEFAULT 0,
  avg_read_time_minutes numeric NOT NULL DEFAULT 0,
  newsletter_open_rate numeric NOT NULL DEFAULT 0,
  payment_failures_90d integer NOT NULL DEFAULT 0,
  complaints_90d integer NOT NULL DEFAULT 0,
  satisfaction_score numeric,
  renewal_intent_score numeric,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  risk_score integer NOT NULL,
  risk_level text NOT NULL,
  principal_reason text NOT NULL,
  principal_signal_key text,
  contributing_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_action text NOT NULL,
  priority_score numeric NOT NULL DEFAULT 0,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT risk_assessments_subscriber_unique UNIQUE (subscriber_id)
);

CREATE TABLE public.retention_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  status text NOT NULL DEFAULT 'Pendiente',
  owner text,
  notes text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.risk_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  weight numeric NOT NULL,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.risk_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL UNIQUE,
  low_count integer NOT NULL DEFAULT 0,
  medium_count integer NOT NULL DEFAULT 0,
  high_count integer NOT NULL DEFAULT 0,
  critical_count integer NOT NULL DEFAULT 0,
  revenue_at_risk integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_assessments TO authenticated;
GRANT ALL ON public.risk_assessments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.retention_actions TO authenticated;
GRANT ALL ON public.retention_actions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_rules TO authenticated;
GRANT ALL ON public.risk_rules TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_history TO authenticated;
GRANT ALL ON public.risk_history TO service_role;

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscribers_auth_all" ON public.subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "risk_assessments_auth_all" ON public.risk_assessments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "retention_actions_auth_all" ON public.retention_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "risk_rules_auth_all" ON public.risk_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "risk_history_auth_all" ON public.risk_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER subscribers_updated_at BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER risk_rules_updated_at BEFORE UPDATE ON public.risk_rules
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.risk_rules (rule_key, name, description, enabled, weight, configuration) VALUES
('activity_drop', 'Caída importante de actividad', 'Compara las sesiones de los últimos 30 días con el período anterior. Una caída porcentual mayor al umbral aporta el peso máximo.', true, 25, '{"threshold_pct": -15, "max_drop_pct": -60}'::jsonb),
('inactivity', 'Tiempo desde último acceso', 'Días transcurridos sin ingresar a la plataforma.', true, 15, '{"threshold_days": 7, "max_days": 30}'::jsonb),
('payment_failures', 'Problemas de pago', 'Intentos de cobro rechazados durante los últimos 90 días.', true, 20, '{"max_failures": 2}'::jsonb),
('renewal_proximity', 'Renovación próxima', 'Cercanía de la fecha de renovación de la suscripción.', true, 15, '{"threshold_days": 30, "critical_days": 7}'::jsonb),
('low_satisfaction', 'Baja satisfacción', 'Puntaje de satisfacción declarado por el suscriptor (escala 1 a 10).', true, 15, '{"threshold_score": 7, "min_score": 3}'::jsonb),
('complaints', 'Reclamos recientes', 'Reclamos registrados durante los últimos 90 días.', true, 10, '{"max_complaints": 2}'::jsonb);

INSERT INTO public.subscribers (
  customer_code, subscription_status, plan, subscription_start_date, renewal_date, monthly_value, payment_method,
  last_access_at, sessions_30d, sessions_previous_30d, articles_read_30d, articles_read_previous_30d,
  avg_read_time_minutes, newsletter_open_rate, payment_failures_90d, complaints_90d, satisfaction_score, renewal_intent_score
)
SELECT
  'RV-' || (10000 + g)::text,
  'Activa',
  plan,
  start_date,
  (CURRENT_DATE + ((g * 7 + (random()*90)::int) % 120))::date,
  CASE plan WHEN 'Digital' THEN 4990 WHEN 'Digital Plus' THEN 7990 WHEN 'Premium' THEN 12990 ELSE 19990 END,
  (ARRAY['Tarjeta de crédito','Tarjeta de débito','Transferencia','Débito automático'])[1 + (g % 4)],
  (now() - (inactive_days || ' days')::interval),
  sess_now,
  sess_prev,
  GREATEST(0, (sess_now * (1.2 + random()))::int),
  GREATEST(0, (sess_prev * (1.2 + random()))::int),
  ROUND((2 + random() * 9)::numeric, 1),
  ROUND((0.1 + random() * 0.75)::numeric, 2),
  CASE WHEN g % 9 = 0 THEN 1 + (random()*1)::int ELSE 0 END,
  CASE WHEN g % 11 = 0 THEN 1 + (random()*1)::int ELSE 0 END,
  ROUND(sat::numeric, 1),
  ROUND((GREATEST(1, LEAST(10, sat + (random()*2 - 1))))::numeric, 1)
FROM (
  SELECT
    g,
    (ARRAY['Digital','Digital Plus','Premium','Anual Premium'])[1 + (g % 4)] AS plan,
    (CURRENT_DATE - ((90 + (random()*1200))::int))::date AS start_date,
    sess_prev,
    GREATEST(0, ROUND(sess_prev * factor)::int) AS sess_now,
    CASE WHEN factor < 0.6 THEN (6 + random()*25)::int ELSE (random()*7)::int END AS inactive_days,
    CASE WHEN factor < 0.6 THEN 2 + random()*4 ELSE 6 + random()*4 END AS sat
  FROM (
    SELECT g,
      (5 + (random()*35))::int AS sess_prev,
      (0.15 + random() * 1.35) AS factor
    FROM generate_series(1,150) g
  ) base
) s;

INSERT INTO public.risk_history (snapshot_date, low_count, medium_count, high_count, critical_count, revenue_at_risk)
SELECT
  (CURRENT_DATE - (d * 7))::date,
  (58 + (random()*10)::int),
  (46 + (random()*10)::int),
  (28 + (random()*8)::int + d),
  (14 + (random()*6)::int - (d/2)::int),
  (450000 + (random()*180000)::int)
FROM generate_series(0, 11) d;
