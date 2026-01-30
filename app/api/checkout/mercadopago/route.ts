import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import { createPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { CREDIT_PACKAGES } from "@/lib/credits";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/mercadopago
 * Body: { packageId: "13" | "21" | "34" | "55" | "89" }
 * Cria preferência Checkout Pro e retorna URL de redirecionamento (PIX, cartão, etc.).
 */
export async function POST(req: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "Pagamento não configurado. Defina MERCADOPAGO_ACCESS_TOKEN." },
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

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const preference = await createPreference({
    items: [
      {
        title: pkg.label,
        quantity: 1,
        unit_price: pkg.priceCents / 100,
        currency_id: "BRL",
      },
    ],
    payer: { email: session.email },
    back_urls: {
      success: `${origin}/?checkout=success&provider=mercadopago`,
      failure: `${origin}/?checkout=failure`,
      pending: `${origin}/?checkout=pending`,
    },
    auto_return: "approved",
    notification_url: `${origin}/api/webhooks/mercadopago`,
    external_reference: `darshan:${session.email}:${pkg.amount}`,
    metadata: {
      packageId: pkg.id,
      credits: String(pkg.amount),
      email: session.email,
    },
  });

  if (!preference?.id) {
    return NextResponse.json(
      { error: "Não foi possível criar a preferência de pagamento." },
      { status: 500 }
    );
  }

  const url = preference.init_point ?? preference.sandbox_init_point ?? null;
  if (!url) {
    return NextResponse.json(
      { error: "Não foi possível obter a URL de pagamento." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url });
}
