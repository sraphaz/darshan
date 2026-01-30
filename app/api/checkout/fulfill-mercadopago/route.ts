import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import { getCreditsFromCookie, creditsCookieHeader } from "@/lib/credits";
import { getPayment, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { addCreditsForPurchase } from "@/lib/finance";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/fulfill-mercadopago
 * Body: { payment_id: string }
 * Verifica o pagamento no Mercado Pago e adiciona créditos ao usuário.
 */
export async function POST(req: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "Pagamento não configurado.", balance: null },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session?.email) {
    return NextResponse.json(
      { error: "Faça login para receber os créditos.", balance: null },
      { status: 401 }
    );
  }

  let body: { payment_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido.", balance: null }, { status: 400 });
  }

  const paymentId = typeof body.payment_id === "string" ? body.payment_id.trim() : "";
  if (!paymentId) {
    return NextResponse.json(
      { error: "ID do pagamento inválido.", balance: null },
      { status: 400 }
    );
  }

  const payment = await getPayment(paymentId);
  if (!payment) {
    return NextResponse.json(
      { error: "Pagamento não encontrado.", balance: null },
      { status: 400 }
    );
  }

  if (payment.status !== "approved") {
    return NextResponse.json(
      { error: "Pagamento ainda não aprovado.", balance: null },
      { status: 400 }
    );
  }

  const externalRef = payment.external_reference ?? "";
  const match = externalRef.match(/^darshan:(.+):(\d+)$/);
  const emailFromRef = match?.[1] ?? "";
  const creditsFromRef = match?.[2] ? parseInt(match[2], 10) : 0;
  const credits = creditsFromRef > 0 ? creditsFromRef : parseInt(String(payment.metadata?.credits ?? "0"), 10);

  if (emailFromRef !== session.email) {
    return NextResponse.json(
      { error: "Pagamento não corresponde ao usuário logado.", balance: null },
      { status: 403 }
    );
  }

  if (!Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json(
      { error: "Pacote de créditos inválido.", balance: null },
      { status: 400 }
    );
  }

  const current = getCreditsFromCookie(cookieHeader);
  const amountBrl = Number(payment.transaction_amount) ?? 0;

  const result = await addCreditsForPurchase(
    session.email,
    credits,
    amountBrl,
    "mercadopago",
    String(payment.id),
    current
  );
  const newBalance = result.newBalance;

  audit("credits_add", session.email, {
    amount: credits,
    balanceBefore: current,
    balanceAfter: newBalance,
    source: "mercadopago_checkout",
  });

  const res = NextResponse.json({ ok: true, balance: newBalance });
  res.headers.set("Set-Cookie", creditsCookieHeader(newBalance));
  return res;
}
