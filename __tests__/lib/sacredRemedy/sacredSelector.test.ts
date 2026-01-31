/**
 * Testes para lib/sacredRemedy/sacredSelector.
 * Determinismo, avoidIds, retorno com corpus.
 */

import { selectSacredText, getAllSacredEntries } from "@/lib/sacredRemedy/sacredSelector";

describe("sacredRemedy/sacredSelector", () => {
  describe("getAllSacredEntries", () => {
    it("retorna array não vazio com id, text, corpus", () => {
      const all = getAllSacredEntries();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
      const first = all[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("text");
      expect(first).toHaveProperty("corpus");
      expect(typeof first.corpus).toBe("string");
    });
  });

  describe("selectSacredText", () => {
    it("retorna entrada com id, text e corpus", () => {
      const entry = selectSacredText({ seed: 10 });
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("text");
      expect(entry).toHaveProperty("corpus");
      expect(entry.text?.length).toBeGreaterThan(0);
    });

    it("é determinístico: mesmo options produz mesmo id", () => {
      const e1 = selectSacredText({ seed: 77 });
      const e2 = selectSacredText({ seed: 77 });
      expect(e1.id).toBe(e2.id);
      expect(e1.corpus).toBe(e2.corpus);
    });

    it("evita avoidIds quando possível", () => {
      const e1 = selectSacredText({ seed: 1 });
      const fullId = `${e1.corpus}.${e1.id}`;
      const e2 = selectSacredText({ seed: 1, avoidIds: [fullId] });
      const all = getAllSacredEntries();
      if (all.length > 1) {
        expect(e2.id).not.toBe(e1.id);
      }
    });

    it("com kleshaTargets e qualities retorna entrada compatível", () => {
      const entry = selectSacredText({
        kleshaTargets: ["raga"],
        qualities: ["chala"],
        seed: 5,
      });
      expect(entry.id).toBeDefined();
      expect(entry.text).toBeDefined();
    });
  });
});
