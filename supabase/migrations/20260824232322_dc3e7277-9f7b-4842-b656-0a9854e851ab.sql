ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT 'Sin nombre',
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS billing_period text NOT NULL DEFAULT 'mensual';

ALTER TABLE public.subscribers
  ADD CONSTRAINT subscribers_billing_period_check CHECK (billing_period IN ('mensual', 'anual'));

CREATE INDEX IF NOT EXISTS subscribers_full_name_idx ON public.subscribers (full_name);