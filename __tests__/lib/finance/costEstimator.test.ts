import {
  estimateCost,
  setUsdToBrl,
  getUsdToBrl,
  getRates,
  refreshUsdToBrlCache,
  type CostProvider,
} from "@/lib/finance/costEstimator";

describe("lib/finance/costEstimator", () => {
  beforeEach(() => {
    setUsdToBrl(5);
  });

  describe("getUsdToBrl e setUsdToBrl", () => {
    it("valor padrão e set", () => {
      setUsdToBrl(5.5);
      expect(getUsdToBrl()).toBe(5.5);
    });
    it("não aceita valor menor que 0.01", () => {
      setUsdToBrl(5);
      setUsdToBrl(0);
      expect(getUsdToBrl()).toBeGreaterThanOrEqual(0.01);
    });
  });

  describe("estimateCost", () => {
    it("calcula custo USD e BRL para openai", () => {
      setUsdToBrl(5);
      const r = estimateCost("openai", 1000, 500);
      expect(r.costUsd).toBeGreaterThan(0);
      expect(r.costBrl).toBe(r.costUsd * 5);
    });
    it("calcula custo para gemini", () => {
      const r = estimateCost("gemini", 1_000_000, 500_000);
      expect(r.costUsd).toBeGreaterThan(0);
      expect(r.costBrl).toBeGreaterThan(0);
    });
    it("provider desconhecido usa rates openai", () => {
      const r = estimateCost("openai" as CostProvider, 0, 0);
      expect(r.costUsd).toBe(0);
      expect(r.costBrl).toBe(0);
    });
  });

  describe("getRates", () => {
    it("retorna cópia das taxas para openai, anthropic, gemini", () => {
      const rates = getRates();
      expect(rates.openai.inputPer1M).toBe(0.15);
      expect(rates.openai.outputPer1M).toBe(0.6);
      expect(rates.gemini.inputPer1M).toBe(0.35);
      expect(rates.anthropic.outputPer1M).toBe(15);
    });
  });

  describe("refreshUsdToBrlCache", () => {
    it("retorna valor atual quando fetch falha", async () => {
      setUsdToBrl(5.2);
      const globalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
      const rate = await refreshUsdToBrlCache();
      expect(rate).toBe(5.2);
      global.fetch = globalFetch;
    });
    it("atualiza usdToBrl quando API retorna dados válidos", async () => {
      setUsdToBrl(5);
      const globalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ compra: 5.1, venda: 5.2 }),
      });
      const rate = await refreshUsdToBrlCache();
      expect(rate).toBeCloseTo(5.15);
      global.fetch = globalFetch;
    });
    it("mantém valor atual quando fetch lança erro", async () => {
      setUsdToBrl(5.5);
      const globalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error("network"));
      const rate = await refreshUsdToBrlCache();
      expect(rate).toBe(5.5);
      global.fetch = globalFetch;
    });
    it("mantém valor atual quando JSON não tem compra/venda numéricos", async () => {
      setUsdToBrl(5);
      const globalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      const rate = await refreshUsdToBrlCache();
      expect(rate).toBe(5);
      global.fetch = globalFetch;
    });
    it("anthropic usa taxas corretas", () => {
      const r = estimateCost("anthropic", 1000, 500);
      expect(r.costUsd).toBeGreaterThan(0);
      expect(r.costBrl).toBeCloseTo(r.costUsd * 5);
    });
  });
});
