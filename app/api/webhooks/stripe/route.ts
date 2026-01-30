import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { addCreditsForPurchase } from "@/lib/finance";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 * Recebe eventos do Stripe (ex.: checkout.session.completed).
 * Credita o usuário mesmo se ele não retornar à página de sucesso (Google Pay, fechou aba, etc.).
 * Configure STRIPE_WEBHOOK_SECRET no Stripe Dashboard (Webhooks > Add endpoint > signing secret).
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.trim() || !isStripeConfigured()) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ received: true }, { status: 200 });

  let payload: string;
  try {
    payload = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig.trim(), secret.trim());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[webhooks/stripe] Signature verification failed:", message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const sessionId = session.id ?? "";
  const email = typeof session.client_reference_id === "string" ? session.client_reference_id : "";
  const credits = parseInt(String(session.metadata?.credits ?? "0"), 10);
  const amountBrl = Number(session.amount_total ?? 0) / 100;

  if (!email || !Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("provider", "stripe")
      .eq("external_id", sessionId)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  try {
    await addCreditsForPurchase(email, credits, amountBrl, "stripe", sessionId, 0);
    audit("credits_add", email, {
      amount: credits,
      source: "stripe_webhook",
      session_id: sessionId,
    });
  } catch (err) {
    console.error("[webhooks/stripe]", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
