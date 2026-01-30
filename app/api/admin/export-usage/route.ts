import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/adminAuth";
import { usageToCsv, type UsageExportRow } from "@/lib/finance";

export const dynamic = "force-dynamic";

/** Preço médio por crédito em BRL (para revenue_estimate). */
const AVG_REVENUE_PER_CREDIT_BRL = 0.40;

/**
 * GET /api/admin/export-usage?range=month&key=CONFIG_SECRET
 * Query: range = day | week | month (default month)
 * Retorna CSV: user_id, provider, total_calls, total_tokens, total_cost_brl, credits_spent, revenue_estimate
 */
export async function GET(req: Request) {
  const auth = checkAdminAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Exportação requer SUPABASE_URL e SUPABASE_SERVICE_KEY." },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "month";
  const since = getSinceDate(range);

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não disponível." }, { status: 503 });
  }

  const { data: logs, error: logError } = await supabase
    .from("ai_usage_log")
    .select("user_id, provider, input_tokens, output_tokens, total_tokens, cost_brl, credits_spent")
    .gte("created_at", since.toISOString());

  if (logError) {
    return NextResponse.json({ error: "Falha ao buscar uso." }, { status: 500 });
  }

  const rows = (logs ?? []).reduce((acc, row) => {
    const key = `${row.user_id}:${row.provider}`;
    const existing = acc.get(key);
    const costBrl = Number(row.cost_brl ?? 0);
    const creditsSpent = Number(row.credits_spent ?? 0);
    const totalTokens = Number(row.total_tokens ?? 0) || Number(row.input_tokens ?? 0) + Number(row.output_tokens ?? 0);
    if (existing) {
      existing.total_calls += 1;
      existing.total_tokens += totalTokens;
      existing.total_cost_brl += costBrl;
      existing.credits_spent += creditsSpent;
    } else {
      acc.set(key, {
        user_id: row.user_id,
        provider: row.provider,
        total_calls: 1,
        total_tokens: totalTokens,
        total_cost_brl: costBrl,
        credits_spent: creditsSpent,
        revenue_estimate: 0,
      });
    }
    return acc;
  }, new Map<string, UsageExportRow & { revenue_estimate: number }>());

  const { data: users } = await supabase.from("users").select("id, email");
  const idToEmail = new Map((users ?? []).map((u) => [u.id, u.email]));

  const exportRows: UsageExportRow[] = Array.from(rows.values()).map((r) => ({
    user_id: idToEmail.get(r.user_id) ?? r.user_id,
    provider: r.provider,
    total_calls: r.total_calls,
    total_tokens: r.total_tokens,
    total_cost_brl: Math.round(r.total_cost_brl * 100) / 100,
    credits_spent: r.credits_spent,
    revenue_estimate: Math.round(r.credits_spent * AVG_REVENUE_PER_CREDIT_BRL * 100) / 100,
  }));

  const csv = usageToCsv(exportRows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="darshan-usage-${range}-${Date.now()}.csv"`,
    },
  });
}

function getSinceDate(range: string): Date {
  const now = new Date();
  switch (range) {
    case "day":
      now.setDate(now.getDate() - 1);
      break;
    case "week":
      now.setDate(now.getDate() - 7);
      break;
    default:
      now.setMonth(now.getMonth() - 1);
      break;
  }
  return now;
}
