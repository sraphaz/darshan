/**
 * Testes para lib/input — Intent Parser e State Scorer.
 * Multi-eixo: verbo, sujeito, tema, emoção → stateCandidates → bestStateKey.
 */

import { parseIntent } from "@/lib/input/intentParser";
import { scoreState } from "@/lib/input/stateScorer";

describe("lib/input intentParser", () => {
  describe("parseIntent", () => {
    it("retorna null para texto vazio ou null", () => {
      expect(parseIntent(null)).toBeNull();
      expect(parseIntent(undefined)).toBeNull();
      expect(parseIntent("")).toBeNull();
      expect(parseIntent("   ")).toBeNull();
    });

    it("detecta verbClass fear em 'Tenho medo de perder meu relacionamento'", () => {
      const intent = parseIntent("Tenho medo de perder meu relacionamento");
      expect(intent).not.toBeNull();
      expect(intent!.verbClass).toBe("fear");
      expect(intent!.subject).toBe("self");
      expect(intent!.theme).toBe("love");
      expect(intent!.stateCandidates.length).toBeGreaterThan(0);
    });

    it("detecta tema love em texto com 'amor' e 'relacionamento'", () => {
      const intent = parseIntent("Estou com medo no meu relacionamento");
      expect(intent).not.toBeNull();
      expect(intent!.theme).toBe("love");
    });

    it("detecta emoção e stateCandidates para 'ansioso'", () => {
      const intent = parseIntent("Estou muito ansioso");
      expect(intent).not.toBeNull();
      expect(intent!.emotionLabels.length).toBeGreaterThan(0);
      expect(intent!.stateCandidates.some((c) => c.stateKey === "anxiety")).toBe(true);
    });

    it("retorna subject self quando tem 'eu' ou 'meu'", () => {
      expect(parseIntent("Eu não aguento mais")!.subject).toBe("self");
      expect(parseIntent("Meu trabalho está me matando")!.subject).toBe("self");
    });
  });
});

describe("lib/input stateScorer", () => {
  it("retorna undefined para intent null; retorna fallback confusion quando sem stateCandidates", () => {
    expect(scoreState(null)).toBeUndefined();
    expect(scoreState({ subject: "self", verbClass: null, theme: "general", emotionLabels: [], stateCandidates: [] })).toBe("confusion");
  });

  it("retorna stateKey válido quando há candidatos", () => {
    const intent = parseIntent("Tenho medo de perder meu relacionamento");
    const best = scoreState(intent);
    expect(best).toBeDefined();
    expect(["anxiety", "relational_insecurity", "avoidance"]).toContain(best);
  });

  it("prioriza anxiety para fear + love (ex.: medo de perder relacionamento)", () => {
    const intent = parseIntent("Tenho medo de perder meu relacionamento");
    const best = scoreState(intent);
    expect(best).toBeDefined();
    expect(["anxiety", "relational_insecurity"]).toContain(best);
  });
});
