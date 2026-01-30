import { logAiUsage } from "@/lib/finance/usageLogger";

const mockGetSupabase = jest.fn();
const mockIsSupabaseConfigured = jest.fn();

jest.mock("@/lib/supabase", () => ({
  getSupabase: (...args: unknown[]) => mockGetSupabase(...args),
  isSupabaseConfigured: () => mockIsSupabaseConfigured(),
}));

const baseEntry = {
  provider: "gemini" as const,
  model: "gemini-2.5-flash",
  inputTokens: 100,
  outputTokens: 50,
  totalTokens: 150,
  costUsd: 0.001,
  costBrl: 0.005,
  creditsSpent: 13,
  mode: "now" as const,
  questionLength: 10,
  responseLength: 100,
  success: true,
};

describe("lib/finance/usageLogger (sem Supabase)", () => {
  beforeEach(() => {
    mockGetSupabase.mockReturnValue(null);
    mockIsSupabaseConfigured.mockReturnValue(false);
  });

  it("retorna null quando Supabase não configurado", async () => {
    const id = await logAiUsage(baseEntry, { userEmail: "a@b.com" });
    expect(id).toBeNull();
  });
});

describe("lib/finance/usageLogger (com Supabase)", () => {
  beforeEach(() => {
    mockIsSupabaseConfigured.mockReturnValue(true);
  });

  it("retorna id do log quando user existe e insert ok", async () => {
    mockGetSupabase.mockReturnValue({
      from: jest.fn((table: string) => {
        if (table === "users") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: { id: "u1" } }),
              })),
            })),
          };
        }
        if (table === "ai_usage_log") {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: "log-123" },
                  error: null,
                }),
              })),
            })),
          };
        }
        return {};
      }),
    });
    const id = await logAiUsage(baseEntry, { userEmail: "a@b.com" });
    expect(id).toBe("log-123");
  });

  it("cria user e insere log quando user não existe", async () => {
    mockGetSupabase.mockReturnValue({
      from: jest.fn((table: string) => {
        if (table === "users") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: null }),
              })),
            })),
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: "u-new" },
                }),
              })),
            })),
          };
        }
        if (table === "ai_usage_log") {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: "log-456" },
                  error: null,
                }),
              })),
            })),
          };
        }
        return {};
      }),
    });
    const id = await logAiUsage(baseEntry, { userEmail: "new@b.com" });
    expect(id).toBe("log-456");
  });

  it("retorna null quando userTableId passado mas insert ai_usage_log falha", async () => {
    mockGetSupabase.mockReturnValue({
      from: jest.fn((table: string) => {
        if (table === "ai_usage_log") {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: new Error("db error"),
                }),
              })),
            })),
          };
        }
        return {};
      }),
    });
    const id = await logAiUsage(baseEntry, {
      userEmail: "a@b.com",
      userTableId: "u1",
    });
    expect(id).toBeNull();
  });

  it("retorna null quando userEmail vazio e userTableId não passado", async () => {
    mockGetSupabase.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null }),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null }),
          })),
        })),
      })),
    });
    const id = await logAiUsage(baseEntry, { userEmail: "" });
    expect(id).toBeNull();
  });
});
