jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ mock: true })),
}));

const originalEnv = process.env;

describe("lib/supabase", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isSupabaseConfigured", () => {
    it("retorna false quando faltam variáveis", () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_KEY;
      const { isSupabaseConfigured } = require("@/lib/supabase");
      expect(isSupabaseConfigured()).toBe(false);
    });
    it("retorna true quando ambas estão definidas", () => {
      process.env.SUPABASE_URL = "https://x.supabase.co";
      process.env.SUPABASE_SERVICE_KEY = "key";
      const { isSupabaseConfigured } = require("@/lib/supabase");
      expect(isSupabaseConfigured()).toBe(true);
    });
  });

  describe("getSupabase", () => {
    it("retorna null quando não configurado", () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_KEY;
      const { getSupabase } = require("@/lib/supabase");
      expect(getSupabase()).toBeNull();
    });
    it("retorna cliente quando configurado", () => {
      process.env.SUPABASE_URL = "https://x.supabase.co";
      process.env.SUPABASE_SERVICE_KEY = "key";
      const { getSupabase } = require("@/lib/supabase");
      expect(getSupabase()).toEqual({ mock: true });
    });
  });
});
