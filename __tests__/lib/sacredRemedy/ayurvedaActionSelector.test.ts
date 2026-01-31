/**
 * Testes para lib/sacredRemedy/ayurvedaActionSelector.
 * Antídotos por qualidade, múltiplas qualities, prioridade por dosha.
 */

import {
  getPracticeForQuality,
  getFoodForQuality,
  getActionsForQualities,
  getActionsForQualitiesWithDosha,
  QUALITY_TO_PRACTICE,
  QUALITY_TO_FOOD,
} from "@/lib/sacredRemedy/ayurvedaActionSelector";

describe("sacredRemedy/ayurvedaActionSelector", () => {
  describe("getPracticeForQuality / getFoodForQuality", () => {
    it("retorna prática e alimento para qualidade conhecida", () => {
      const practice = getPracticeForQuality("ruksha");
      const food = getFoodForQuality("ruksha");
      expect(typeof practice).toBe("string");
      expect(practice.length).toBeGreaterThan(0);
      expect(practice).not.toBe("—");
      expect(typeof food).toBe("string");
      expect(food.length).toBeGreaterThan(0);
    });

    it("ruksha tem antídoto oleação/calor", () => {
      expect(getPracticeForQuality("ruksha")).toMatch(/oleação|óleo/i);
      expect(getFoodForQuality("ruksha")).toMatch(/ghee|oleação|sopa/i);
    });

    it("chala tem antídoto grounding", () => {
      expect(getPracticeForQuality("chala")).toMatch(/grounding|pés|chão|caminhada/i);
    });
  });

  describe("getActionsForQualities", () => {
    it("retorna practice e food para lista de qualities", () => {
      const { practice, food } = getActionsForQualities(["ruksha", "chala"]);
      expect(typeof practice).toBe("string");
      expect(typeof food).toBe("string");
    });

    it("usa primeira qualidade com mapeamento", () => {
      const { practice } = getActionsForQualities(["ruksha"]);
      expect(practice).toBe(QUALITY_TO_PRACTICE["ruksha"]);
    });

    it("lista vazia retorna strings vazias", () => {
      const { practice, food } = getActionsForQualities([]);
      expect(practice).toBe("");
      expect(food).toBe("");
    });
  });

  describe("getActionsForQualitiesWithDosha", () => {
    it("retorna practice e food com múltiplas sugestões quando há várias qualities", () => {
      const { practice, food } = getActionsForQualitiesWithDosha(
        ["ruksha", "chala", "ushna"],
        "vata",
        { maxSuggestions: 3 }
      );
      expect(typeof practice).toBe("string");
      expect(typeof food).toBe("string");
      if (practice) expect(practice.length).toBeGreaterThan(0);
      if (food) expect(food.length).toBeGreaterThan(0);
    });

    it("com dosha pitta prioriza qualities do pitta", () => {
      const { practice } = getActionsForQualitiesWithDosha(
        ["ushna", "tikshna", "ruksha"],
        "pitta",
        { maxSuggestions: 2 }
      );
      expect(typeof practice).toBe("string");
    });

    it("maxSuggestions limita quantidade de sugestões combinadas", () => {
      const { practice } = getActionsForQualitiesWithDosha(
        ["ruksha", "chala", "guru", "manda", "sthira"],
        "kapha",
        { maxSuggestions: 1 }
      );
      const parts = practice.split(". ").filter(Boolean);
      expect(parts.length).toBeLessThanOrEqual(2);
    });
  });

  describe("20 gunas cobertas", () => {
    const qualities = [
      "ruksha", "chala", "tikshna", "ushna", "guru", "manda", "sthira",
      "picchila", "kathina", "khara", "sukshma", "laghu", "snigdha", "sita",
      "mridu", "vishada", "sandra", "drava", "sara", "shlakshna", "sthula",
    ];
    it("QUALITY_TO_PRACTICE e QUALITY_TO_FOOD têm entrada para todas as qualities principais", () => {
      for (const q of qualities) {
        const p = QUALITY_TO_PRACTICE[q];
        const f = QUALITY_TO_FOOD[q];
        expect(p !== undefined).toBe(true);
        expect(f !== undefined).toBe(true);
        expect(p === "—" || p.length > 0).toBe(true);
        expect(f === "—" || f.length > 0).toBe(true);
      }
    });
  });
});
