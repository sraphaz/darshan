import {
  checkAndRecordRateLimit,
  checkDailyLimit,
  recordDailyRequest,
  getRateLimitConfig,
  getDailyLimitConfig,
} from "@/lib/usageLimits";

const RATE_KEY = "RATE_LIMIT_PER_MINUTE";
const DAILY_KEY = "DAILY_AI_LIMIT";

describe("lib/usageLimits", () => {
  const originalRate = process.env[RATE_KEY];
  const originalDaily = process.env[DAILY_KEY];

  afterEach(() => {
    if (originalRate !== undefined) process.env[RATE_KEY] = originalRate;
    else delete process.env[RATE_KEY];
    if (originalDaily !== undefined) process.env[DAILY_KEY] = originalDaily;
    else delete process.env[DAILY_KEY];
  });

  describe("checkAndRecordRateLimit", () => {
    it("retorna true quando RATE_LIMIT_PER_MINUTE=0 (desativado)", () => {
      process.env[RATE_KEY] = "0";
      const key = "rate-test-off@test.com";
      expect(checkAndRecordRateLimit(key)).toBe(true);
      expect(checkAndRecordRateLimit(key)).toBe(true);
    });

    it("permite até N requisições por minuto e bloqueia a N+1", () => {
      process.env[RATE_KEY] = "2";
      const key = "rate-test-2@test.com";
      expect(checkAndRecordRateLimit(key)).toBe(true);
      expect(checkAndRecordRateLimit(key)).toBe(true);
      expect(checkAndRecordRateLimit(key)).toBe(false);
    });

    it("usa chaves diferentes por usuário", () => {
      process.env[RATE_KEY] = "1";
      expect(checkAndRecordRateLimit("user-a@test.com")).toBe(true);
      expect(checkAndRecordRateLimit("user-b@test.com")).toBe(true);
      expect(checkAndRecordRateLimit("user-a@test.com")).toBe(false);
    });
  });

  describe("getRateLimitConfig / getDailyLimitConfig", () => {
    it("retorna padrão quando env não definido", () => {
      delete process.env[RATE_KEY];
      delete process.env[DAILY_KEY];
      expect(getRateLimitConfig().perMinute).toBe(5);
      expect(getDailyLimitConfig()).toBe(30);
    });
    it("retorna valor da env quando definido", () => {
      process.env[RATE_KEY] = "10";
      process.env[DAILY_KEY] = "50";
      expect(getRateLimitConfig().perMinute).toBe(10);
      expect(getDailyLimitConfig()).toBe(50);
    });
  });

  describe("checkDailyLimit", () => {
    it("retorna allowed true e limit 0 quando DAILY_AI_LIMIT=0", async () => {
      process.env[DAILY_KEY] = "0";
      const r = await checkDailyLimit("daily-off@test.com");
      expect(r.allowed).toBe(true);
      expect(r.limit).toBe(0);
    });
    it("retorna allowed true quando count < limit (sem Supabase usa in-memory 0)", async () => {
      process.env[DAILY_KEY] = "30";
      const r = await checkDailyLimit("daily-new@test.com");
      expect(r.allowed).toBe(true);
      expect(r.count).toBe(0);
      expect(r.limit).toBe(30);
    });
  });

  describe("recordDailyRequest", () => {
    it("não lança quando chamado (in-memory quando sem Supabase)", () => {
      recordDailyRequest("record@test.com");
      recordDailyRequest("record@test.com");
    });
  });
});
