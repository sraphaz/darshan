import { NextResponse } from "next/server";
import { getPayment, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { addCreditsForPurchase } from "@/lib/finance";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

type WebhookBody = {
  type?: string;
  data?: { id?: string };
};

/**
 * POST /api/webhooks/mercadopago
 * Recebe notificações do Mercado Pago (payment). Busca o pagamento, verifica se está
 * aprovado e se ainda não foi processado; em seguida adiciona créditos ao usuário.
 * Responde 200 rapidamente para evitar retentativas desnecessárias.
 */
export async function POST(req: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let body: WebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.type !== "payment" || typeof body.data?.id !== "string") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const paymentId = String(body.data.id).trim();
  if (!paymentId) return NextResponse.json({ received: true }, { status: 200 });

  const payment = await getPayment(paymentId);
  if (!payment) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (payment.status !== "approved") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("provider", "mercadopago")
      .eq("external_id", paymentId)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  const externalRef = payment.external_reference ?? "";
  const match = externalRef.match(/^darshan:(.+):(\d+)$/);
  const emailFromRef = match?.[1] ?? "";
  const creditsFromRef = match?.[2] ? parseInt(match[2], 10) : 0;
  const credits =
    creditsFromRef > 0 ? creditsFromRef : parseInt(String(payment.metadata?.credits ?? "0"), 10);

  if (!emailFromRef || !Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const amountBrl = Number(payment.transaction_amount) ?? 0;
  const currentBalance = 0;

  try {
    await addCreditsForPurchase(
      emailFromRef,
      credits,
      amountBrl,
      "mercadopago",
      String(payment.id),
      currentBalance
    );
    audit("credits_add", emailFromRef, {
      amount: credits,
      source: "mercadopago_webhook",
      payment_id: paymentId,
    });
  } catch (err) {
    console.error("[webhooks/mercadopago]", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
