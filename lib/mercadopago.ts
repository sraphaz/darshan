/**
 * Mercado Pago — Checkout Pro via API REST.
 * Configure MERCADOPAGO_ACCESS_TOKEN em .env.local.
 */

const MP_API = "https://api.mercadopago.com";

export function isMercadoPagoConfigured(): boolean {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  return typeof token === "string" && token.trim().length > 0;
}

function getAccessToken(): string | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  return typeof token === "string" && token.trim().length > 0 ? token.trim() : null;
}

export type CreatePreferenceBody = {
  items: Array<{ title: string; quantity: number; unit_price: number; currency_id?: string }>;
  payer?: { email?: string };
  back_urls?: { success: string; failure: string; pending: string };
  auto_return?: "approved" | "all";
  notification_url?: string;
  external_reference?: string;
  metadata?: Record<string, string>;
};

export type PreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

/** Cria preferência de pagamento (Checkout Pro). Retorna init_point (URL de redirecionamento). */
export async function createPreference(body: CreatePreferenceBody): Promise<PreferenceResponse | null> {
  const token = getAccessToken();
  if (!token) return null;
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json() as Promise<PreferenceResponse>;
}

export type PaymentResponse = {
  id: number;
  status: string;
  status_detail?: string;
  transaction_amount?: number;
  metadata?: { credits?: string; email?: string };
  external_reference?: string;
};

/** Busca pagamento por ID. */
export async function getPayment(paymentId: string): Promise<PaymentResponse | null> {
  const token = getAccessToken();
  if (!token) return null;
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<PaymentResponse>;
}
