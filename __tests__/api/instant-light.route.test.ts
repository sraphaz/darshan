/**
 * Testes de integração para GET /api/instant-light.
 * Cobre: resposta universal (anon), resposta personal (perfil), cooldown server-side (sessão mock).
 */

import { sessionCookieHeader } from "@/lib/auth";

const mockCookies = jest.fn();
const mockGetRecentSacredIds = jest.fn();
const mockGetRecentStateKeys = jest.fn();
const mockRecordInstantLight = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

jest.mock("@/lib/history/historyAdapter", () => ({
  getRecentSacredIds: (...args: unknown[]) => mockGetRecentSacredIds(...args),
  getRecentStateKeys: (...args: unknown[]) => mockGetRecentStateKeys(...args),
  recordInstantLight: (...args: unknown[]) => mockRecordInstantLight(...args),
}));

describe("GET /api/instant-light", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue({ toString: () => "" });
    mockGetRecentSacredIds.mockResolvedValue([]);
    mockGetRecentStateKeys.mockResolvedValue([]);
    mockRecordInstantLight.mockResolvedValue(undefined);
  });

  async function getHandler() {
    const mod = await import("@/app/api/instant-light/route");
    return mod.GET;
  }

  describe("modo anônimo (sem sessão)", () => {
    it("retorna 200 com DarshanTruthPackage: sacred, practice, question, sacredId, stateKey", async () => {
      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("sacredText");
      expect(body).toHaveProperty("sacred");
      expect(body.sacred).toHaveProperty("id");
      expect(body.sacred).toHaveProperty("corpus");
      expect(body).toHaveProperty("practice");
      expect(body.practice).toHaveProperty("title");
      expect(body.practice).toHaveProperty("steps");
      expect(body).toHaveProperty("question");
      expect(body.question).toHaveProperty("text");
      expect(body).toHaveProperty("sacredId");
      expect(body).toHaveProperty("stateKey");
      expect(typeof body.sacredText).toBe("string");
      expect(typeof body.question.text).toBe("string");
    });

    it("não inclui insight quando não há perfil", async () => {
      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      const body = await res.json();
      expect(body.insight).toBeUndefined();
    });

    it("não chama getRecentSacredIds nem recordInstantLight quando não há sessão", async () => {
      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      await GET(req);
      expect(mockGetRecentSacredIds).not.toHaveBeenCalled();
      expect(mockRecordInstantLight).not.toHaveBeenCalled();
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
    it("com sessão válida, chama getRecentSacredIds e getRecentStateKeys e usa resultado no composer", async () => {
      const cookieStr = sessionCookieHeader({ email: "user@example.com" });
      mockCookies.mockResolvedValue({ toString: () => cookieStr });
      mockGetRecentSacredIds.mockResolvedValue(["yoga_sutras.YS.1.1"]);
      mockGetRecentStateKeys.mockResolvedValue(["anxiety"]);

      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(mockGetRecentSacredIds).toHaveBeenCalledWith("user@example.com", 7);
      expect(mockGetRecentStateKeys).toHaveBeenCalledWith("user@example.com", 7);
      const body = await res.json();
      expect(body).toHaveProperty("sacredId");
      expect(body).toHaveProperty("stateKey");
    });

    it("com sessão e sacred na resposta, chama recordInstantLight", async () => {
      const cookieStr = sessionCookieHeader({ email: "user@example.com" });
      mockCookies.mockResolvedValue({ toString: () => cookieStr });
      mockGetRecentSacredIds.mockResolvedValue([]);
      mockGetRecentStateKeys.mockResolvedValue([]);

      const GET = await getHandler();
      const req = new Request("http://localhost/api/instant-light");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      if (body.sacred?.id) {
        expect(mockRecordInstantLight).toHaveBeenCalledWith("user@example.com", body);
      }
    });
  });

  describe("formato da resposta (food, sleep, routine opcionais)", () => {
    it("resposta pode conter food (do/avoid), sleep, routine quando aplicável", async () => {
      const GET = await getHandler();
      const req = new Request(
        "http://localhost/api/instant-light?fullName=Maria&birthDate=1990-05-15"
      );
      const res = await GET(req);
      const body = await res.json();
      expect(body).toHaveProperty("practice");
      expect(body.practice).toHaveProperty("steps");
      expect(body).toHaveProperty("question");
      expect(body.question).toHaveProperty("text");
      if (body.food !== undefined) expect(Array.isArray(body.food.do) || Array.isArray(body.food)).toBe(true);
      if (body.sleep !== undefined) expect(typeof body.sleep).toBe("string");
      if (body.routine !== undefined) expect(typeof body.routine).toBe("string");
    });
  });
});
