import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/adminAuth";
import { paymentsToCsv, type PaymentExportRow } from "@/lib/finance";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export-payments?key=CONFIG_SECRET
 * Retorna CSV: user_id, amount_brl, credits_added, status, created_at
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

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não disponível." }, { status: 503 });
  }

  const { data: payments, error } = await supabase
    .from("payments")
    .select("user_id, amount_brl, credits_added, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Falha ao buscar pagamentos." }, { status: 500 });
  }

  const { data: users } = await supabase.from("users").select("id, email");
  const idToEmail = new Map((users ?? []).map((u) => [u.id, u.email]));

  const rows: PaymentExportRow[] = (payments ?? []).map((p) => ({
    user_id: idToEmail.get(p.user_id) ?? p.user_id,
    amount_brl: Number(p.amount_brl ?? 0),
    credits_added: Number(p.credits_added ?? 0),
    status: String(p.status ?? "pending"),
    created_at: new Date(p.created_at).toISOString(),
  }));

  const csv = paymentsToCsv(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="darshan-payments-${Date.now()}.csv"`,
    },
  });
}
