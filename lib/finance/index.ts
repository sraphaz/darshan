/**
 * Módulo financeiro: custo, créditos, log de uso e exportação CSV.
 */

export {
  estimateCost,
  setUsdToBrl,
  getUsdToBrl,
  refreshUsdToBrlCache,
  getRates,
  type CostProvider,
  type CostRates,
} from "./costEstimator";

export {
  getCreditsBalance,
  debitCredits,
  addCredits,
  recordPayment,
  addCreditsForPurchase,
  type DebitResult,
  type LedgerReason,
  type PaymentProvider,
  type PaymentStatus,
} from "./creditsManager";

export { logAiUsage, getTodayAiRequestCount, type LogUsageOptions } from "./usageLogger";

export {
  usageToCsv,
  paymentsToCsv,
  type UsageExportRow,
  type PaymentExportRow,
} from "./exportCsv";

export {
  getPlatformFeePercent,
  getPlatformFeeDecimal,
} from "./platformFee";

export type { AiUsageEntry, AiUsageProvider, UsageMode } from "./types";
