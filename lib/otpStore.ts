/**
 * Armazenamento temporário de códigos OTP por email (em memória).
 * Em produção: enviar código por email (Resend, SendGrid, etc.) e opcionalmente persistir em Redis/DB.
 */

const store = new Map<string, { code: string; expiry: number }>();
const TTL_MS = 10 * 60 * 1000; // 10 minutos

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function setOtp(email: string): string {
  const code = generateCode();
  store.set(email.toLowerCase().trim(), {
    code,
    expiry: Date.now() + TTL_MS,
  });
  return code;
}

export function verifyOtp(email: string, code: string): boolean {
  const key = email.toLowerCase().trim();
  const entry = store.get(key);
  if (!entry || entry.expiry < Date.now()) {
    store.delete(key);
    return false;
  }
  const ok = entry.code === String(code).trim();
  if (ok) store.delete(key);
  return ok;
}

/** Para desenvolvimento: código fixo 123456 sempre válido quando NODE_ENV !== production */
export function isDevCode(email: string, code: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return String(code).trim() === "123456";
}
