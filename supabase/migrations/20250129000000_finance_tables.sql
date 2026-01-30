-- Darshan: módulo financeiro — tabelas para créditos, uso de IA e pagamentos.
-- Executar no Supabase (SQL Editor ou CLI: supabase db push).

-- 1. users (saldo de créditos e plano)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 2. ai_usage_log (cada chamada à IA)
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  cost_brl NUMERIC(12, 6) NOT NULL DEFAULT 0,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  mode TEXT NOT NULL DEFAULT 'now' CHECK (mode IN ('now', 'question')),
  question_length INTEGER NOT NULL DEFAULT 0,
  response_length INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  safety_flags TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_id ON ai_usage_log (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_created_at ON ai_usage_log (created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_provider ON ai_usage_log (provider);

-- 3. payments (compras de créditos)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'mercadopago')),
  amount_brl NUMERIC(12, 2) NOT NULL,
  credits_added INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at);

-- 4. credit_ledger (auditável: todo movimento de crédito)
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('purchase', 'darshan_call', 'admin_adjust')),
  related_usage_id UUID REFERENCES ai_usage_log (id) ON DELETE SET NULL,
  related_payment_id UUID REFERENCES payments (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON credit_ledger (user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at ON credit_ledger (created_at);

-- Trigger para atualizar updated_at em users
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

COMMENT ON TABLE users IS 'Usuários do Darshan; identificação por email (session).';
COMMENT ON TABLE ai_usage_log IS 'Registro de cada chamada à IA para custo e auditoria.';
COMMENT ON TABLE payments IS 'Pagamentos (Stripe, Mercado Pago) que adicionam créditos.';
COMMENT ON TABLE credit_ledger IS 'Ledger auditável: todo débito/crédito de créditos.';
