import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { CREDIT_PACKAGES } from "@/lib/credits";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/create
 * Body: { packageId: "13" | "21" | "34" | "55" | "89" }
 * Cria sessão Stripe Checkout (cartão, Google Pay e Stripe Link).
 * Google Pay aparece automaticamente quando "Wallets" está ativo no Dashboard do Stripe.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Pagamento não configurado. Defina STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session?.email) {
    return NextResponse.json(
      { error: "Faça login para comprar créditos." },
      { status: 401 }
    );
  }

  let body: { packageId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const packageId = typeof body.packageId === "string" ? body.packageId.trim() : "";
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return NextResponse.json(
      { error: "Pacote inválido. Use 13, 21, 34, 55 ou 89." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Pagamento indisponível." },
      { status: 503 }
    );
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "link"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: pkg.label,
              description: "Créditos para revelações com IA no Darshan.",
            },
            unit_amount: pkg.priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      client_reference_id: session.email,
      metadata: {
        packageId: pkg.id,
        credits: String(pkg.amount),
      },
    });

    const url = checkoutSession.url;
    if (!url) {
      return NextResponse.json(
        { error: "Não foi possível criar a sessão de pagamento." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout/create]", message);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento. Tente novamente." },
      { status: 500 }
    );
  }
}
