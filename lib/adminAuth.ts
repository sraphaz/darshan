/**
 * Autenticação admin (CONFIG_SECRET) para rotas de administração.
 */

export function getSecretFromRequest(req: Request): string | null {
  const key = req.headers.get("x-config-key");
  if (key) return key;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  const url = new URL(req.url);
  const q = url.searchParams.get("key");
  if (q) return q;
  return null;
}

export function checkAdminAuth(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.CONFIG_SECRET;
  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "Admin desativado. Defina CONFIG_SECRET.",
    };
  }
  const provided = getSecretFromRequest(req);
  if (provided !== secret) {
    return { ok: false, status: 401, error: "Não autorizado." };
  }
  return { ok: true };
}
