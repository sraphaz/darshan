/**
 * Histórico e cooldown — adapter para Instant Light (sacredIds/stateKeys recentes, recordInstantLight).
 * Delega para historyStorage (Supabase).
 */

export {
  getRecentSacredIds,
  getRecentStateKeys,
  recordInstantLight,
} from "./historyAdapter";
