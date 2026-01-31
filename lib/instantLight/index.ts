/**
 * Instant Light — re-export do Sacred Remedy Engine (único composer).
 *
 * @deprecated Use @/lib/sacredRemedy. Este módulo é apenas wrapper de compatibilidade;
 * todos os endpoints (darshan mock, instant-light) já usam sacredRemedy.
 */
export { composeInstantLight } from "./instantLightComposer";
export type { InstantLightProfile, ComposeInstantLightOptions } from "./instantLightComposer";
