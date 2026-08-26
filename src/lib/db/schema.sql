-- MIZZLI FC — schema PostgreSQL (Render / Supabase / qualsiasi Postgres)

CREATE TABLE IF NOT EXISTS app_kv (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_kv_updated_at_idx ON app_kv (updated_at DESC);
