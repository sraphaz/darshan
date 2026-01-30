/**
 * Autenticação sem senha — sessão por código enviado por email.
 * Sessão armazenada em cookie; identificador único = email.
 */

const SESSION_COOKIE = "darshan_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export type Session = {
  email: string;
};

function encodeSession(s: Session): string {
  return Buffer.from(JSON.stringify(s), "utf-8").toString("base64url");
}

function decodeSession(value: string): Session | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    const s = JSON.parse(json) as Session;
    return typeof s.email === "string" && s.email ? s : null;
  } catch {
    return null;
  }
}

export function getSessionFromCookie(cookieHeader: string | null): Session | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const value = match?.[1];
  if (!value) return null;
  return decodeSession(decodeURIComponent(value));
}

export function sessionCookieHeader(session: Session): string {
  const value = encodeURIComponent(encodeSession(session));
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
