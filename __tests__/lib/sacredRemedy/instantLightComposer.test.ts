/**
 * Testes para lib/sacredRemedy/instantLightComposer.
 * Modo universal vs personal, determinismo com seed fixo.
 */

import { composeInstantLight } from "@/lib/sacredRemedy/instantLightComposer";

describe("sacredRemedy/instantLightComposer", () => {
  const fixedSeed = 12345;

  describe("modo universal (sem perfil)", () => {
    it("retorna DarshanTruthPackage: sacred, practice, question, stateKey", () => {
      const res = composeInstantLight(null, { seed: fixedSeed });
      expect(res).toHaveProperty("sacredText");
      expect(res).toHaveProperty("sacred");
      expect(res.sacred).toHaveProperty("id");
      expect(res.sacred).toHaveProperty("corpus");
      expect(res.sacred).toHaveProperty("text");
      expect(res).toHaveProperty("practice");
      expect(res.practice).toHaveProperty("title");
      expect(res.practice).toHaveProperty("steps");
      expect(res).toHaveProperty("question");
      expect(res.question).toHaveProperty("text");
      expect(res).toHaveProperty("sacredId");
      expect(res).toHaveProperty("stateKey");
      expect(typeof res.sacredText).toBe("string");
      expect(typeof res.question.text).toBe("string");
    });

    it("não inclui insight em modo universal", () => {
      const res = composeInstantLight(null, { seed: fixedSeed });
      expect(res.insight).toBeUndefined();
    });

    it("é determinístico com mesmo seed", () => {
      const r1 = composeInstantLight(null, { seed: fixedSeed });
      const r2 = composeInstantLight(null, { seed: fixedSeed });
      expect(r1.sacredId).toBe(r2.sacredId);
      expect(r1.stateKey).toBe(r2.stateKey);
      expect(r1.sacredText).toBe(r2.sacredText);
      expect(r1.question.text).toBe(r2.question.text);
    });
  });

  describe("modo personal (com perfil)", () => {
    const profile = {
      fullName: "Ana Costa",
      birthDate: "1988-03-20",
    };

    it("pode incluir insight quando perfil tem nome ou data", () => {
      const res = composeInstantLight(profile, { seed: fixedSeed });
      expect(res).toHaveProperty("sacredText");
      expect(res).toHaveProperty("practice");
      expect(res).toHaveProperty("question");
      expect(res).toHaveProperty("sacredId");
      expect(res).toHaveProperty("stateKey");
      if (res.insight) expect(typeof res.insight).toBe("string");
    });

    it("é determinístico para mesmo perfil e seed", () => {
      const r1 = composeInstantLight(profile, { seed: fixedSeed });
      const r2 = composeInstantLight(profile, { seed: fixedSeed });
      expect(r1.sacredId).toBe(r2.sacredId);
      expect(r1.stateKey).toBe(r2.stateKey);
      expect(r1.sacredText).toBe(r2.sacredText);
      expect(r1.question.text).toBe(r2.question.text);
    });
  });

  describe("anti-repetição (recentSacredIds / recentStateKeys)", () => {
    it("com recentStateKeys evita repetir mesmo estado quando há opções", () => {
      const r1 = composeInstantLight(null, { seed: 1 });
      const r2 = composeInstantLight(null, {
        seed: 1,
        recentStateKeys: r1.stateKey ? [r1.stateKey] : [],
      });
      if (r1.stateKey) {
        expect(r2.stateKey).not.toBe(r1.stateKey);
      }
    });

    it("com recentSacredIds pode alterar sacredId (evita repetir texto)", () => {
      const r1 = composeInstantLight(null, { seed: 2 });
      const r2 = composeInstantLight(null, {
        seed: 2,
        recentSacredIds: r1.sacredId ? [r1.sacredId] : [],
      });
      expect(r2.sacred?.id).toBeDefined();
      expect(r2.sacredId).toBeDefined();
    });
  });
});
