import {
  getCreditsBalance,
  debitCredits,
  addCredits,
  addCreditsForPurchase,
  recordPayment,
} from "@/lib/finance/creditsManager";

const mockGetSupabase = jest.fn();
const mockIsSupabaseConfigured = jest.fn();

jest.mock("@/lib/supabase", () => ({
  getSupabase: (...args: unknown[]) => mockGetSupabase(...args),
  isSupabaseConfigured: () => mockIsSupabaseConfigured(),
}));

function createMockSupabaseClient(overrides: {
  selectUser?: { data: { id: string; credits_balance: number } | null };
  insertUser?: { data: { id: string; credits_balance?: number } | null };
  updateUser?: { error: Error | null };
  insertLedger?: { data: { id: string } | null };
  insertPayment?: { data: { id: string } | null };
} = {}) {
  const {
    selectUser = { data: { id: "u1", credits_balance: 50 } },
    insertUser = { data: { id: "u1", credits_balance: 50 } },
    updateUser = { error: null },
    insertLedger = { data: { id: "ledger1" } },
    insertPayment = { data: { id: "pay1" } },
  } = overrides;

  const from = jest.fn((table: string) => {
    if (table === "users") {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue(selectUser),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue(insertUser),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue(updateUser),
        })),
      };
    }
    if (table === "credit_ledger") {
      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue(insertLedger),
          })),
        })),
      };
    }
    if (table === "payments") {
      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue(insertPayment),
          })),
        })),
      };
    }
    return {};
  });
  return { from };
}

describe("lib/finance/creditsManager (sem Supabase)", () => {
  beforeEach(() => {
    mockGetSupabase.mockReturnValue(null);
    mockIsSupabaseConfigured.mockReturnValue(false);
  });

  describe("getCreditsBalance", () => {
    it("retorna balanceFromCookie quando Supabase não configurado", async () => {
      const balance = await getCreditsBalance("a@b.com", 100);
      expect(balance).toBe(100);
    });
  });

  describe("debitCredits", () => {
    it("retorna newBalance = current - amount quando sem Supabase", async () => {
      const r = await debitCredits("a@b.com", 13, "darshan_call", {
        currentBalanceFromCookie: 50,
      });
      expect(r.newBalance).toBe(37);
    });
    it("não fica negativo", async () => {
      const r = await debitCredits("a@b.com", 100, "darshan_call", {
        currentBalanceFromCookie: 20,
      });
      expect(r.newBalance).toBe(0);
    });
  });

  describe("addCredits", () => {
    it("retorna newBalance = current + amount quando sem Supabase", async () => {
      const r = await addCredits("a@b.com", 50, "purchase", {
        currentBalanceFromCookie: 10,
      });
      expect(r.newBalance).toBe(60);
    });
  });

  describe("recordPayment", () => {
    it("retorna null quando Supabase não configurado", async () => {
      const id = await recordPayment(
        "a@b.com",
        "stripe",
        39.9,
        100,
        "completed",
        "cs_abc"
      );
      expect(id).toBeNull();
    });
  });

  describe("addCreditsForPurchase", () => {
    it("soma créditos e retorna newBalance quando sem Supabase", async () => {
      const r = await addCreditsForPurchase(
        "a@b.com",
        100,
        39.9,
        "stripe",
        "cs_xyz",
        0
      );
      expect(r.newBalance).toBe(100);
    });
  });
});

describe("lib/finance/creditsManager (com Supabase)", () => {
  beforeEach(() => {
    mockIsSupabaseConfigured.mockReturnValue(true);
  });

  describe("getCreditsBalance", () => {
    it("retorna credits_balance do user quando existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: { id: "u1", credits_balance: 80 } },
        })
      );
      const balance = await getCreditsBalance("a@b.com", 0);
      expect(balance).toBe(80);
    });
    it("insere user e retorna balanceFromCookie quando user não existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: null },
          insertUser: { data: { id: "u2", credits_balance: 100 } },
        })
      );
      const balance = await getCreditsBalance("a@b.com", 100);
      expect(balance).toBe(100);
    });
  });

  describe("debitCredits", () => {
    it("debita e retorna newBalance quando user existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: { id: "u1", credits_balance: 50 } },
        })
      );
      const r = await debitCredits("a@b.com", 13, "darshan_call", {
        relatedUsageId: "usage-1",
      });
      expect(r.newBalance).toBe(37);
      expect(r.ledgerId).toBe("ledger1");
    });
    it("cria user e debita quando user não existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: null },
          insertUser: { data: { id: "u-new", credits_balance: 0 } },
        })
      );
      const r = await debitCredits("a@b.com", 10, "darshan_call", {
        currentBalanceFromCookie: 20,
      });
      expect(r.newBalance).toBe(0);
    });
    it("retorna fallback quando insert user falha (inserted null)", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: null },
          insertUser: { data: null },
        })
      );
      const r = await debitCredits("a@b.com", 13, "darshan_call", {
        currentBalanceFromCookie: 50,
      });
      expect(r.newBalance).toBe(37);
    });
    it("retorna fallback quando update user retorna erro", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: { id: "u1", credits_balance: 50 } },
          updateUser: { error: new Error("db error") },
        })
      );
      const r = await debitCredits("a@b.com", 13, "darshan_call", {
        currentBalanceFromCookie: 50,
      });
      expect(r.newBalance).toBe(37);
    });
  });

  describe("addCredits", () => {
    it("adiciona créditos quando user existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: { id: "u1", credits_balance: 10 } },
        })
      );
      const r = await addCredits("a@b.com", 50, "purchase", {});
      expect(r.newBalance).toBe(60);
    });
    it("cria user e adiciona quando user não existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: null },
          insertUser: { data: { id: "u-new", credits_balance: 100 } },
        })
      );
      const r = await addCredits("a@b.com", 100, "purchase", {
        currentBalanceFromCookie: 0,
      });
      expect(r.newBalance).toBe(200);
    });
    it("retorna fallback quando insert user falha", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: null },
          insertUser: { data: null },
        })
      );
      const r = await addCredits("a@b.com", 50, "purchase", {
        currentBalanceFromCookie: 10,
      });
      expect(r.newBalance).toBe(60);
    });
  });

  describe("recordPayment", () => {
    it("retorna id do payment quando user existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: { id: "u1", credits_balance: 0 } },
          insertPayment: { data: { id: "pay-123" } },
        })
      );
      const id = await recordPayment(
        "a@b.com",
        "stripe",
        39.9,
        100,
        "completed",
        "cs_abc"
      );
      expect(id).toBe("pay-123");
    });
    it("cria user e retorna id quando user não existe", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: null },
          insertUser: { data: { id: "u-new" } },
          insertPayment: { data: { id: "pay-456" } },
        })
      );
      const id = await recordPayment(
        "a@b.com",
        "stripe",
        19.9,
        50,
        "completed"
      );
      expect(id).toBe("pay-456");
    });
    it("retorna null quando insert payment falha", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: { id: "u1" } },
          insertPayment: { data: null },
        })
      );
      const id = await recordPayment(
        "a@b.com",
        "stripe",
        39.9,
        100,
        "completed"
      );
      expect(id).toBeNull();
    });
  });

  describe("addCreditsForPurchase", () => {
    it("registra payment e adiciona créditos", async () => {
      mockGetSupabase.mockReturnValue(
        createMockSupabaseClient({
          selectUser: { data: { id: "u1", credits_balance: 0 } },
          insertPayment: { data: { id: "pay-1" } },
          insertUser: { data: { id: "u1", credits_balance: 100 } },
        })
      );
      const r = await addCreditsForPurchase(
        "a@b.com",
        100,
        39.9,
        "stripe",
        "cs_xyz",
        0
      );
      expect(r.newBalance).toBe(100);
    });
  });
});
