/**
 * Auditoria em arquivo — registro de ações relevantes (login, créditos, config).
 * Grava em data/logs/audit.log (ou LOG_DIR quando definido).
 */

import fs from "fs";
import path from "path";

function getLogDir(): string {
  const base = process.env.LOG_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
  return path.join(base, "logs");
}

function getAuditLogPath(): string {
  return path.join(getLogDir(), "audit.log");
}

function ensureLogDir(): void {
  const dir = getLogDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export type AuditEvent =
  | "login_email"
  | "login_google"
  | "logout"
  | "credits_add"
  | "credits_use"
  | "config_read"
  | "config_update"
  | "config_unlock";

/**
 * Registra um evento de auditoria. subject = identificador do ator (ex.: e-mail); details = dados opcionais.
 */
export function audit(
  event: AuditEvent,
  subject: string,
  details?: Record<string, unknown>
): void {
  try {
    ensureLogDir();
    const ts = new Date().toISOString();
    const line = `${ts} ${event} subject=${JSON.stringify(subject)}${details != null && Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : ""}\n`;
    fs.appendFileSync(getAuditLogPath(), line, "utf8");
  } catch (err) {
    console.error("[audit] write failed:", err);
  }
}
