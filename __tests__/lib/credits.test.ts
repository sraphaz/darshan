import {
  CREDITS_PER_AI_REQUEST,
  CREDIT_PACKAGES,
  formatPriceBRL,
  getCreditsFromCookie,
  creditsCookieHeader,
  clearCreditsCookieHeader,
  getCreditsForRevelation,
} from "@/lib/credits";

describe("lib/credits", () => {
  describe("CREDITS_PER_AI_REQUEST", () => {
    it("deve ser 1 (modo ritual)", () => {
      expect(CREDITS_PER_AI_REQUEST).toBe(1);
    });
  });

  describe("CREDIT_PACKAGES", () => {
    it("deve ter 5 pacotes Fibonacci com id, amount, priceCents, label", () => {
      expect(CREDIT_PACKAGES).toHaveLength(5);
      expect(CREDIT_PACKAGES[0]).toEqual({ id: "13", amount: 13, priceCents: 890, label: "13 créditos" });
      expect(CREDIT_PACKAGES[1].id).toBe("21");
      expect(CREDIT_PACKAGES[2].amount).toBe(34);
      expect(CREDIT_PACKAGES[4].priceCents).toBe(5590);
    });
  });

  describe("formatPriceBRL", () => {
    it("formata centavos em BRL", () => {
      expect(formatPriceBRL(1990)).toMatch(/19,90/);
      expect(formatPriceBRL(0)).toMatch(/0,00/);
    });
  });

  describe("getCreditsFromCookie", () => {
    it("retorna 0 quando header é null", () => {
      expect(getCreditsFromCookie(null)).toBe(0);
    });
    it("retorna 0 quando cookie não existe", () => {
      expect(getCreditsFromCookie("other=1")).toBe(0);
    });
    it("retorna o valor do cookie darshan_credits", () => {
      expect(getCreditsFromCookie("darshan_credits=100")).toBe(100);
      expect(getCreditsFromCookie("darshan_credits=0")).toBe(0);
      expect(getCreditsFromCookie("foo=1; darshan_credits=50; bar=2")).toBe(50);
    });
    it("retorna 0 para valor inválido ou negativo", () => {
      expect(getCreditsFromCookie("darshan_credits=abc")).toBe(0);
      expect(getCreditsFromCookie("darshan_credits=-1")).toBe(0);
    });
    it("aceita valor com decodeURIComponent", () => {
      expect(getCreditsFromCookie("darshan_credits=" + encodeURIComponent("42"))).toBe(42);
    });
  });

  describe("creditsCookieHeader", () => {
    it("retorna header com valor não negativo e inteiro", () => {
      const h = creditsCookieHeader(100);
      expect(h).toContain("darshan_credits=100");
      expect(h).toContain("Path=/");
      expect(creditsCookieHeader(0)).toContain("darshan_credits=0");
      expect(creditsCookieHeader(99.7)).toContain("darshan_credits=99");
      expect(creditsCookieHeader(-5)).toContain("darshan_credits=0");
    });
  });

  describe("clearCreditsCookieHeader", () => {
    it("retorna header que limpa o cookie", () => {
      const h = clearCreditsCookieHeader();
      expect(h).toContain("darshan_credits=;");
      expect(h).toContain("Max-Age=0");
    });
  });

  describe("getCreditsForRevelation", () => {
    it("ritual = 1, long = 2, long_image = 3", () => {
      expect(getCreditsForRevelation("ritual")).toBe(1);
      expect(getCreditsForRevelation("long")).toBe(2);
      expect(getCreditsForRevelation("long_image")).toBe(3);
    });
  });
});
