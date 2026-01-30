/**
 * Exportação CSV para relatórios financeiros (uso de IA e pagamentos).
 */

export interface UsageExportRow {
  user_id: string;
  provider: string;
  total_calls: number;
  total_tokens: number;
  total_cost_brl: number;
  credits_spent: number;
  revenue_estimate: number;
}

export interface PaymentExportRow {
  user_id: string;
  amount_brl: number;
  credits_added: number;
  status: string;
  created_at: string;
}

const CSV_ESCAPE = (cell: string): string => {
  if (/[",\n\r]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
};

export function usageToCsv(rows: UsageExportRow[]): string {
  const header = "user_id,provider,total_calls,total_tokens,total_cost_brl,credits_spent,revenue_estimate";
  const lines = rows.map(
    (r) =>
      [
        CSV_ESCAPE(r.user_id),
        CSV_ESCAPE(r.provider),
        r.total_calls,
        r.total_tokens,
        r.total_cost_brl.toFixed(2),
        r.credits_spent,
        r.revenue_estimate.toFixed(2),
      ].join(",")
  );
  return [header, ...lines].join("\n");
}

export function paymentsToCsv(rows: PaymentExportRow[]): string {
  const header = "user_id,amount_brl,credits_added,status,created_at";
  const lines = rows.map((r) =>
    [
      CSV_ESCAPE(r.user_id),
      r.amount_brl.toFixed(2),
      r.credits_added,
      CSV_ESCAPE(r.status),
      CSV_ESCAPE(r.created_at),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}
