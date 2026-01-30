import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import { getCreditsFromCookie, creditsCookieHeader } from "@/lib/credits";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { addCreditsForPurchase } from "@/lib/finance";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/fulfill
 * Body: { sessionId: string }
 * Verifica o pagamento Stripe e adiciona créditos ao usuário (cookie e, se configurado, Supabase).
 * Só credita se o e-mail da sessão atual coincidir com client_reference_id do Checkout.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
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

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido.", balance: null }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { error: "Sessão de pagamento inválida.", balance: null },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Pagamento indisponível.", balance: null },
      { status: 503 }
    );
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [],
    });

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Pagamento ainda não confirmado.", balance: null },
        { status: 400 }
      );
    }

    const email = checkoutSession.client_reference_id ?? "";
    if (email !== session.email) {
      return NextResponse.json(
        { error: "Sessão não corresponde ao usuário logado.", balance: null },
        { status: 403 }
      );
    }

    const credits = parseInt(String(checkoutSession.metadata?.credits ?? "0"), 10);
    if (!Number.isFinite(credits) || credits <= 0) {
      return NextResponse.json(
        { error: "Pacote de créditos inválido.", balance: null },
        { status: 400 }
      );
    }

    const current = getCreditsFromCookie(cookieHeader);
    const amountBrl = Number(checkoutSession.amount_total ?? 0) / 100;

    const result = await addCreditsForPurchase(
      session.email,
      credits,
      amountBrl,
      "stripe",
      sessionId,
      current
    );
    const newBalance = result.newBalance;

    audit("credits_add", session.email, {
      amount: credits,
      balanceBefore: current,
      balanceAfter: newBalance,
      source: "stripe_checkout",
    });

    const res = NextResponse.json({ ok: true, balance: newBalance });
    res.headers.set("Set-Cookie", creditsCookieHeader(newBalance));
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout/fulfill]", message);
    return NextResponse.json(
      { error: "Não foi possível confirmar o pagamento.", balance: null },
      { status: 500 }
    );
  }
}
