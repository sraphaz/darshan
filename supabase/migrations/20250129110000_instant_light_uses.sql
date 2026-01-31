-- Cooldown server-side para Instant Light: registra uso de sacredId/stateKey por usuário.
-- Usado por getRecentInstantLightIds e recordInstantLightUse (historyStorage).

CREATE TABLE IF NOT EXISTS instant_light_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  sacred_id TEXT NOT NULL,
  state_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instant_light_uses_user_id ON instant_light_uses (user_id);
CREATE INDEX IF NOT EXISTS idx_instant_light_uses_created_at ON instant_light_uses (created_at DESC);

COMMENT ON TABLE instant_light_uses IS 'Uso recente de textos/estados do Instant Light por usuário (cooldown server-side).';
