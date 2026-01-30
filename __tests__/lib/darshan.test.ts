import { PHASE_NAMES } from "@/lib/darshan";

describe("lib/darshan", () => {
  describe("PHASE_NAMES", () => {
    it("tem nomes para fases 1 a 7", () => {
      expect(PHASE_NAMES[1]).toBe("Luz — frase-oráculo");
      expect(PHASE_NAMES[2]).toContain("Jyotish");
      expect(PHASE_NAMES[7]).toContain("presença");
    });
  });
});
