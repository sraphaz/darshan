/**
 * Testes para lib/sacredRemedy/sutraContextResolver.
 */

import { resolveSutraContext, shouldIncludePrevContext } from "@/lib/sacredRemedy/sutraContextResolver";

describe("sacredRemedy/sutraContextResolver", () => {
  describe("resolveSutraContext", () => {
    it("retorna primary para YS.1.1 (primeiro sutra)", () => {
      const r = resolveSutraContext("YS.1.1");
      expect(r).not.toBeNull();
      expect(r!.primary.id).toBe("YS.1.1");
      expect(r!.primary.text).toBeTruthy();
      expect(r!.prev).toBeUndefined();
      expect(r!.next).toBeDefined();
    });

    it("retorna prev e primary para YS.1.2", () => {
      const r = resolveSutraContext("YS.1.2");
      expect(r).not.toBeNull();
      expect(r!.prev).toBeDefined();
      expect(r!.prev!.id).toBe("YS.1.1");
      expect(r!.primary.id).toBe("YS.1.2");
      expect(r!.next).toBeDefined();
    });

    it("retorna null para id inexistente", () => {
      expect(resolveSutraContext("YS.99.99")).toBeNull();
    });
  });

  describe("shouldIncludePrevContext", () => {
    it("retorna false para YS.1.1", () => {
      expect(shouldIncludePrevContext("YS.1.1")).toBe(false);
    });
    it("retorna true para YS.1.2", () => {
      expect(shouldIncludePrevContext("YS.1.2")).toBe(true);
    });
  });
});
