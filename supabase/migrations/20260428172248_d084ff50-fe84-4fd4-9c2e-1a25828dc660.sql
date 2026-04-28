-- system_metrics: time-series of system samples per user
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cpu NUMERIC NOT NULL,
  memory NUMERIC NOT NULL,
  network_in NUMERIC NOT NULL DEFAULT 0,
  network_out NUMERIC NOT NULL DEFAULT 0,
  disk NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_metrics_user_created ON public.system_metrics (user_id, created_at DESC);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth view system_metrics"
  ON public.system_metrics FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "users insert own system_metrics"
  ON public.system_metrics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users delete own system_metrics"
  ON public.system_metrics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.system_metrics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_metrics;

-- user_settings: per-user dashboard config
CREATE TABLE public.user_settings (
  user_id UUID NOT NULL PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own settings"
  ON public.user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users insert own settings"
  ON public.user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users delete own settings"
  ON public.user_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
