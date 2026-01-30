const originalEnv = process.env;

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({ _mock: "stripe" }));
});

describe("lib/stripe", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  describe("isStripeConfigured", () => {
    it("retorna false quando STRIPE_SECRET_KEY não está definida", () => {
      delete process.env.STRIPE_SECRET_KEY;
      const { isStripeConfigured } = require("@/lib/stripe");
      expect(isStripeConfigured()).toBe(false);
    });
    it("retorna false quando STRIPE_SECRET_KEY é string vazia", () => {
      process.env.STRIPE_SECRET_KEY = "   ";
      const { isStripeConfigured } = require("@/lib/stripe");
      expect(isStripeConfigured()).toBe(false);
    });
    it("retorna true quando STRIPE_SECRET_KEY tem valor", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_abc";
      const { isStripeConfigured } = require("@/lib/stripe");
      expect(isStripeConfigured()).toBe(true);
    });
  });

  describe("getStripe", () => {
    it("retorna null quando não configurado", () => {
      delete process.env.STRIPE_SECRET_KEY;
      jest.resetModules();
      const { getStripe } = require("@/lib/stripe");
      expect(getStripe()).toBeNull();
    });
    it("retorna instância quando configurado", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
      jest.resetModules();
      const { getStripe } = require("@/lib/stripe");
      expect(getStripe()).not.toBeNull();
    });
  });
});
