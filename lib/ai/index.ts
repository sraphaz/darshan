import type { AIConnector, ConnectorId } from "./types";
import { createOpenAIConnector } from "./openai";
import { createAnthropicConnector } from "./anthropic";
import { createGoogleConnector } from "./google";

const CONNECTORS: Record<ConnectorId, () => AIConnector | null> = {
  openai: createOpenAIConnector,
  anthropic: createAnthropicConnector,
  google: createGoogleConnector,
};

/**
 * Retorna o conector de IA configurado.
 * DARSHAN_AI_PROVIDER = openai | anthropic | google (default: primeiro com chave definida).
 */
export function getConnector(): AIConnector | null {
  const preferred = (process.env.DARSHAN_AI_PROVIDER ?? "").toLowerCase() as ConnectorId;
  if (preferred && CONNECTORS[preferred]) {
    const connector = CONNECTORS[preferred]();
    if (connector) return connector;
  }
  for (const key of ["openai", "anthropic", "google"] as ConnectorId[]) {
    const connector = CONNECTORS[key]();
    if (connector) return connector;
  }
  return null;
}

/**
 * Lista os conectores disponíveis (com chave configurada).
 */
export function getAvailableConnectors(): AIConnector[] {
  const list: AIConnector[] = [];
  for (const key of ["openai", "anthropic", "google"] as ConnectorId[]) {
    const connector = CONNECTORS[key]();
    if (connector) list.push(connector);
  }
  return list;
}

export type { AIConnector, ConnectorId } from "./types";
