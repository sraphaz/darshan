/**
 * Testes para lib/sacredRemedy/diagnosisEngine.
 * Determinismo, universal vs personal, numerologia no diagnóstico.
 */

import {
  diagnosisUniversal,
  diagnosisPersonal,
  getRemedyForDiagnosis,
  getRemedyMatrix,
} from "@/lib/sacredRemedy/diagnosisEngine";
import type { ConsciousDiagnosis } from "@/lib/sacredRemedy/types";

describe("sacredRemedy/diagnosisEngine", () => {
  describe("getRemedyMatrix", () => {
    it("retorna array não vazio com estados, klesha, samkhyaGuna, qualities", () => {
      const matrix = getRemedyMatrix();
      expect(Array.isArray(matrix)).toBe(true);
      expect(matrix.length).toBeGreaterThan(0);
      const first = matrix[0];
      expect(first).toHaveProperty("state");
      expect(first).toHaveProperty("klesha");
      expect(first).toHaveProperty("samkhyaGuna");
      expect(first).toHaveProperty("qualities");
      expect(first).toHaveProperty("sacred");
      expect(first).toHaveProperty("practice");
      expect(first).toHaveProperty("food");
      expect(first).toHaveProperty("question");
    });
  });

  describe("diagnosisUniversal", () => {
    it("retorna ConsciousDiagnosis com klesha, samkhyaGunas, ayurvedicQualities, stateKey", () => {
      const d = diagnosisUniversal({ seed: 42 });
      expect(d).toHaveProperty("klesha");
      expect(d).toHaveProperty("samkhyaGunas");
      expect(d.samkhyaGunas).toHaveProperty("sattva");
      expect(d.samkhyaGunas).toHaveProperty("rajas");
      expect(d.samkhyaGunas).toHaveProperty("tamas");
      expect(d).toHaveProperty("ayurvedicQualities");
      expect(d.ayurvedicQualities).toHaveProperty("excess");
      expect(d.ayurvedicQualities).toHaveProperty("deficient");
      expect(d).toHaveProperty("stateKey");
      expect(typeof d.stateKey).toBe("string");
    });

    it("é determinístico: mesmo seed produz mesmo stateKey", () => {
      const d1 = diagnosisUniversal({ seed: 100 });
      const d2 = diagnosisUniversal({ seed: 100 });
      expect(d1.stateKey).toBe(d2.stateKey);
      expect(d1.klesha).toBe(d2.klesha);
    });

    it("usa preferredStateKey quando informado e válido", () => {
      const d = diagnosisUniversal({ preferredStateKey: "anxiety" });
      expect(d.stateKey).toBe("anxiety");
      expect(d.klesha).toBeDefined();
    });

    it("ignora preferredStateKey inexistente e cai no seed", () => {
      const d = diagnosisUniversal({ seed: 5, preferredStateKey: "estado_inexistente" });
      expect(d.stateKey).toBeDefined();
      expect(d.stateKey).not.toBe("estado_inexistente");
    });

    it("evita recentStateKeys quando possível", () => {
      const d1 = diagnosisUniversal({ seed: 1 });
      const key = d1.stateKey!;
      const d2 = diagnosisUniversal({ seed: 1, recentStateKeys: [key] });
      if (getRemedyMatrix().length > 1) {
        expect(d2.stateKey).not.toBe(key);
      }
    });
  });

  describe("diagnosisPersonal", () => {
    const profileWithData: { fullName: string; birthDate: string } = {
      fullName: "Maria Silva",
      birthDate: "1990-05-15",
    };

    it("retorna ConsciousDiagnosis com numerologyFromMap quando perfil tem nome/data", () => {
      const d = diagnosisPersonal(profileWithData, { seed: 7 });
      expect(d).toHaveProperty("numerologyFromMap");
      expect(d.numerologyFromMap).toHaveProperty("lifePath");
      expect(d.numerologyFromMap).toHaveProperty("soulUrge");
      expect(d).toHaveProperty("prakritiFromJyotish");
      expect(d.prakritiFromJyotish).toHaveProperty("dosha");
      expect(d.prakritiFromJyotish).toHaveProperty("element");
    });

    it("é determinístico para mesmo perfil e seed", () => {
      const d1 = diagnosisPersonal(profileWithData, { seed: 99 });
      const d2 = diagnosisPersonal(profileWithData, { seed: 99 });
      expect(d1.stateKey).toBe(d2.stateKey);
      expect(d1.klesha).toBe(d2.klesha);
    });

    it("diferentes perfis podem produzir diferentes diagnósticos (guna/dosha)", () => {
      const d1 = diagnosisPersonal(profileWithData, { seed: 0 });
      const d2 = diagnosisPersonal(
        { fullName: "João Santos", birthDate: "1985-12-01" },
        { seed: 0 }
      );
      expect(d1.prakritiFromJyotish?.dosha).toBeDefined();
      expect(d2.prakritiFromJyotish?.dosha).toBeDefined();
    });

    it("usa preferredStateKey quando informado e válido", () => {
      const d = diagnosisPersonal(profileWithData, { preferredStateKey: "grief" });
      expect(d.stateKey).toBe("grief");
      expect(d.numerologyFromMap).toBeDefined();
      expect(d.prakritiFromJyotish).toBeDefined();
    });
  });

  describe("getRemedyForDiagnosis", () => {
    it("retorna entrada da matriz quando diagnosis tem stateKey", () => {
      const d: ConsciousDiagnosis = {
        klesha: "raga",
        samkhyaGunas: { sattva: 0.2, rajas: 0.6, tamas: 0.2 },
        ayurvedicQualities: { excess: [], deficient: [] },
        stateKey: "anxiety",
      };
      const remedy = getRemedyForDiagnosis(d, { seed: 0 });
      expect(remedy.state).toBe("anxiety");
      expect(remedy.klesha).toBe("raga");
    });

    it("é determinístico para mesmo diagnosis e seed", () => {
      const d: ConsciousDiagnosis = {
        klesha: "abhinivesha",
        samkhyaGunas: { sattva: 0.2, rajas: 0.2, tamas: 0.6 },
        ayurvedicQualities: { excess: [], deficient: [] },
      };
      const r1 = getRemedyForDiagnosis(d, { seed: 3 });
      const r2 = getRemedyForDiagnosis(d, { seed: 3 });
      expect(r1.state).toBe(r2.state);
    });
  });
});
