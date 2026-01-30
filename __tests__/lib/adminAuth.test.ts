import { getSecretFromRequest, checkAdminAuth } from "@/lib/adminAuth";

const originalEnv = process.env;

describe("lib/adminAuth", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });
  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getSecretFromRequest", () => {
    it("lê do header x-config-key", () => {
      const req = new Request("https://x.com", {
        headers: { "x-config-key": "secret123" },
      });
      expect(getSecretFromRequest(req)).toBe("secret123");
    });
    it("lê do Authorization Bearer", () => {
      const req = new Request("https://x.com", {
        headers: { authorization: "Bearer token456" },
      });
      expect(getSecretFromRequest(req)).toBe("token456");
    });
    it("lê do query key", () => {
      const req = new Request("https://x.com/admin?key=q789");
      expect(getSecretFromRequest(req)).toBe("q789");
    });
    it("retorna null quando nenhum presente", () => {
      const req = new Request("https://x.com");
      expect(getSecretFromRequest(req)).toBeNull();
    });
  });

  describe("checkAdminAuth", () => {
    it("retorna 503 quando CONFIG_SECRET não está definido", () => {
      delete process.env.CONFIG_SECRET;
      const req = new Request("https://x.com");
      const result = checkAdminAuth(req);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(503);
      }
    });
    it("retorna 401 quando secret não confere", () => {
      process.env.CONFIG_SECRET = "correct";
      const req = new Request("https://x.com", {
        headers: { "x-config-key": "wrong" },
      });
      const result = checkAdminAuth(req);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(401);
    });
    it("retorna ok quando secret confere", () => {
      process.env.CONFIG_SECRET = "correct";
      const req = new Request("https://x.com", {
        headers: { "x-config-key": "correct" },
      });
      const result = checkAdminAuth(req);
      expect(result.ok).toBe(true);
    });
  });
});
