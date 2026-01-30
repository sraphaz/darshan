import { getPlatformFeePercent, getPlatformFeeDecimal } from "@/lib/finance/platformFee";

const ENV_KEY = "PLATFORM_FEE_PERCENT";

describe("lib/finance/platformFee", () => {
  const originalEnv = process.env[ENV_KEY];

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env[ENV_KEY] = originalEnv;
    } else {
      delete process.env[ENV_KEY];
    }
  });

  describe("getPlatformFeePercent", () => {
    it("retorna 30 quando PLATFORM_FEE_PERCENT não está definido", () => {
      delete process.env[ENV_KEY];
      expect(getPlatformFeePercent()).toBe(30);
    });

    it("retorna 30 quando PLATFORM_FEE_PERCENT está vazio", () => {
      process.env[ENV_KEY] = "";
      expect(getPlatformFeePercent()).toBe(30);
    });

    it("retorna o valor numérico válido da env", () => {
      process.env[ENV_KEY] = "25";
      expect(getPlatformFeePercent()).toBe(25);
      process.env[ENV_KEY] = "0";
      expect(getPlatformFeePercent()).toBe(0);
      process.env[ENV_KEY] = "100";
      expect(getPlatformFeePercent()).toBe(100);
    });

    it("arredonda e limita entre 0 e 100", () => {
      process.env[ENV_KEY] = "35.7";
      expect(getPlatformFeePercent()).toBe(36);
      process.env[ENV_KEY] = "-10";
      expect(getPlatformFeePercent()).toBe(0);
      process.env[ENV_KEY] = "150";
      expect(getPlatformFeePercent()).toBe(100);
    });

    it("retorna 30 quando valor não é numérico", () => {
      process.env[ENV_KEY] = "abc";
      expect(getPlatformFeePercent()).toBe(30);
    });
  });

  describe("getPlatformFeeDecimal", () => {
    it("retorna 0.30 quando percentual é 30", () => {
      process.env[ENV_KEY] = "30";
      expect(getPlatformFeeDecimal()).toBe(0.3);
    });

    it("retorna 0 quando percentual é 0", () => {
      process.env[ENV_KEY] = "0";
      expect(getPlatformFeeDecimal()).toBe(0);
    });

    it("retorna 1 quando percentual é 100", () => {
      process.env[ENV_KEY] = "100";
      expect(getPlatformFeeDecimal()).toBe(1);
    });
  });
});
