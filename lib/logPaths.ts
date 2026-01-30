/**
 * Caminhos dos arquivos de log (app.log, audit.log).
 * Usado pela API admin de monitoramento para leitura.
 */

import path from "path";

export function getLogDir(): string {
  const base = process.env.LOG_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
  return path.join(base, "logs");
}

export function getAppLogPath(): string {
  return path.join(getLogDir(), "app.log");
}

export function getAuditLogPath(): string {
  return path.join(getLogDir(), "audit.log");
}
