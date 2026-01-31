-- Darshan: histórico de respostas (orb) e leituras — por usuário.
-- Também estende credit_ledger.reason para incluir personal_map (leitura completa).
-- Executar no Supabase (SQL Editor ou CLI: supabase db push).

-- Permitir reason 'personal_map' no credit_ledger (se a constraint existir)
DO $$
BEGIN
  ALTER TABLE credit_ledger DROP CONSTRAINT IF EXISTS credit_ledger_reason_check;
  ALTER TABLE credit_ledger ADD CONSTRAINT credit_ledger_reason_check
    CHECK (reason IN ('purchase', 'darshan_call', 'personal_map', 'admin_adjust'));
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN others THEN NULL;
END $$;

-- 1. revelations (respostas da interação com o orb — pergunta opcional + resposta da IA)
CREATE TABLE IF NOT EXISTS revelations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_text TEXT,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revelations_user_id ON revelations (user_id);
CREATE INDEX IF NOT EXISTS idx_revelations_created_at ON revelations (created_at DESC);

-- 2. readings (resultado das leituras completas — mapa pessoal)
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings (user_id);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings (created_at DESC);

COMMENT ON TABLE revelations IS 'Histórico de respostas da IA na interação com o orb (pergunta + revelação).';
COMMENT ON TABLE readings IS 'Histórico de leituras completas (mapa pessoal) por usuário.';
