/**
 * Uso de tokens retornado por alguns provedores (para custo e auditoria).
 */
export type AIUsage = {
  input_tokens: number;
  output_tokens: number;
};

/**
 * Resultado de uma chamada complete: texto e opcionalmente uso de tokens.
 */
export type CompleteResult = {
  text: string;
  usage?: AIUsage;
};

/**
 * Contrato de um conector de IA para o Darshan.
 * Qualquer provedor (OpenAI, Anthropic, Google, etc.) implementa este contrato.
 */
export type AIConnector = {
  readonly id: string;
  readonly name: string;
  /**
   * Envia system + user e retorna o texto da resposta e, se disponível, uso de tokens.
   */
  complete(systemPrompt: string, userContent: string): Promise<CompleteResult>;
};

export type ConnectorId = "openai" | "anthropic" | "google";
