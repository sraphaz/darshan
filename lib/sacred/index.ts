/**
 * Sacred Library Engine — textos sagrados (Upanishads, Yoga Sutras, Bhagavad Gita).
 * pickSacredText: rotação determinística, cooldown, tags temáticas.
 *
 * Para Instant Light medicinal use lib/sacredRemedy (sacredSelector + dictionaries/sacred/*.json).
 * Este módulo usa classicTexts; mantido para outros fluxos.
 */

export { pickSacredText, getDailySeed } from "./sacredPicker";
export type { SacredTextEntry, PickSacredOptions, SacredSource } from "./types";
