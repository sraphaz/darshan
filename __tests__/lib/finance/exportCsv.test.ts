import { usageToCsv, paymentsToCsv } from "@/lib/finance/exportCsv";

describe("lib/finance/exportCsv", () => {
  describe("usageToCsv", () => {
    it("retorna header e linhas", () => {
      const rows = [
        {
          user_id: "a@b.com",
          provider: "gemini",
          total_calls: 2,
          total_tokens: 1000,
          total_cost_brl: 1.5,
          credits_spent: 26,
          revenue_estimate: 10.4,
        },
      ];
      const csv = usageToCsv(rows);
      expect(csv).toContain("user_id,provider,total_calls");
      expect(csv).toContain("a@b.com");
      expect(csv).toContain("gemini");
      expect(csv).toContain("1.50");
    });
    it("retorna só header para array vazio", () => {
      const csv = usageToCsv([]);
      expect(csv).toBe(
        "user_id,provider,total_calls,total_tokens,total_cost_brl,credits_spent,revenue_estimate"
      );
    });
    it("escapa vírgulas e aspas no user_id", () => {
      const csv = usageToCsv([
        {
          user_id: 'a"b,c@d.com',
          provider: "openai",
          total_calls: 1,
          total_tokens: 100,
          total_cost_brl: 0.5,
          credits_spent: 13,
          revenue_estimate: 5.2,
        },
      ]);
      expect(csv).toContain('"a""b,c@d.com"');
    });
  });

  describe("paymentsToCsv", () => {
    it("retorna header e linhas", () => {
      const rows = [
        {
          user_id: "u@x.com",
          amount_brl: 39.9,
          credits_added: 100,
          status: "completed",
          created_at: "2025-01-15T12:00:00.000Z",
        },
      ];
      const csv = paymentsToCsv(rows);
      expect(csv).toContain("user_id,amount_brl,credits_added,status,created_at");
      expect(csv).toContain("u@x.com");
      expect(csv).toContain("39.90");
      expect(csv).toContain("completed");
    });
    it("retorna só header para array vazio", () => {
      const csv = paymentsToCsv([]);
      expect(csv).toBe("user_id,amount_brl,credits_added,status,created_at");
    });
    it("escapa status com vírgula", () => {
      const csv = paymentsToCsv([
        {
          user_id: "u@x.com",
          amount_brl: 0,
          credits_added: 0,
          status: "pending, review",
          created_at: "2025-01-01T00:00:00.000Z",
        },
      ]);
      expect(csv).toContain('"pending, review"');
    });
    it("escapa created_at com newline", () => {
      const csv = paymentsToCsv([
        {
          user_id: "u@x.com",
          amount_brl: 10,
          credits_added: 50,
          status: "completed",
          created_at: "2025-01-01\nT00:00:00Z",
        },
      ]);
      expect(csv).toContain('"');
    });
  });
});
