/**
 * Testes de integração para GET /api/instant-light.
 * Cobre: resposta universal (anon), resposta personal (perfil), cooldown server-side (sessão mock).
 */

import { sessionCookieHeader } from "@/lib/auth";

const mockCookies = jest.fn();
const mockGetRecentInstantLightIds = jest.fn();
const mockRecordInstantLightUse = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

jest.mock("@/lib/historyStorage", () => ({
  getRecentInstantLightIds: (...args: unknown[]) => mockGetRecentInstantLightIds(...args),
  recordInstantLightUse: (...args: unknown[]) => mockRecordInstantLightUse(...args),
}));

describe("GET /api/instant-light", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue({ toString: () => "" });
    mockGetRecentInstantLightIds.mockResolvedValue({ sacredIds: [], stateKeys: [] });
    mockRecordInstantLightUse.mockResolvedValue(undefined);
  });

  async function getHandler() {
    const mod = await import("@/app/api/instant-light/route");
    return mod.GET;
  }

  describe("modo anônimo (sem sessão)", () => {
    it("retorna 200 com sacredText, practice, question, sacredId, stateKey", async () => {
      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("sacredText");
      expect(body).toHaveProperty("practice");
      expect(body).toHaveProperty("question");
      expect(body).toHaveProperty("sacredId");
      expect(body).toHaveProperty("stateKey");
      expect(typeof body.sacredText).toBe("string");
      expect(typeof body.practice).toBe("string");
      expect(typeof body.question).toBe("string");
    });

    it("não inclui insight quando não há perfil", async () => {
      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      const body = await res.json();
      expect(body.insight).toBeUndefined();
    });

    it("não chama getRecentInstantLightIds nem recordInstantLightUse quando não há sessão", async () => {
      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      await GET(req);
      expect(mockGetRecentInstantLightIds).not.toHaveBeenCalled();
      expect(mockRecordInstantLightUse).not.toHaveBeenCalled();
    });
  });

  describe("modo personal (query fullName + birthDate)", () => {
    it("retorna 200 e pode incluir insight", async () => {
      const GET = await getHandler();
      const req = new Request(
        "http://localhost/api/instant-light?fullName=Ana+Costa&birthDate=1988-03-20"
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("sacredText");
      expect(body).toHaveProperty("practice");
      expect(body).toHaveProperty("question");
      if (body.insight) expect(typeof body.insight).toBe("string");
    });
  });

  describe("cooldown server-side (com sessão)", () => {
    it("com sessão válida, chama getRecentInstantLightIds e usa resultado no composer", async () => {
      const cookieStr = sessionCookieHeader({ email: "user@example.com" });
      mockCookies.mockResolvedValue({ toString: () => cookieStr });
      mockGetRecentInstantLightIds.mockResolvedValue({
        sacredIds: ["yoga_sutras.YS.1.1"],
        stateKeys: ["anxiety"],
      });

      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(mockGetRecentInstantLightIds).toHaveBeenCalledWith("user@example.com", 20);
      const body = await res.json();
      expect(body).toHaveProperty("sacredId");
      expect(body).toHaveProperty("stateKey");
    });

    it("com sessão e sacredId na resposta, chama recordInstantLightUse", async () => {
      const cookieStr = sessionCookieHeader({ email: "user@example.com" });
      mockCookies.mockResolvedValue({ toString: () => cookieStr });
      mockGetRecentInstantLightIds.mockResolvedValue({ sacredIds: [], stateKeys: [] });

      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      if (body.sacredId) {
        expect(mockRecordInstantLightUse).toHaveBeenCalledWith("user@example.com", {
          sacredId: body.sacredId,
          stateKey: body.stateKey ?? undefined,
        });
      }
    });
  });

  describe("formato da resposta (food, sleep, routine opcionais)", () => {
    it("resposta pode conter food, sleep, routine quando aplicável", async () => {
      const GET = await getHandler();
      const req = new Request(
        "http://localhost/api/instant-light?fullName=Maria&birthDate=1990-05-15"
      );
      const res = await GET(req);
      const body = await res.json();
      expect(body).toHaveProperty("practice");
      expect(body).toHaveProperty("question");
      if (body.food !== undefined) expect(typeof body.food).toBe("string");
      if (body.sleep !== undefined) expect(typeof body.sleep).toBe("string");
      if (body.routine !== undefined) expect(typeof body.routine).toBe("string");
    });
  });
});
