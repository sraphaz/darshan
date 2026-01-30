/**
 * Gerenciamento de créditos: saldo e ledger auditável.
 * Se Supabase estiver configurado, usa tabelas users e credit_ledger.
 * Caso contrário, retorna valores para o caller manter cookie.
 */

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
export type LedgerReason = "purchase" | "darshan_call" | "personal_map" | "admin_adjust";

export interface DebitResult {
  newBalance: number;
  ledgerId?: string;
}

/**
 * Obtém ou cria user por email e retorna o saldo de créditos.
 * Se não houver Supabase, retorna balanceFromCookie (passado pelo caller).
 */
export async function getCreditsBalance(
  userEmail: string,
  balanceFromCookie: number
): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return balanceFromCookie;

  const { data: user } = await supabase
    .from("users")
    .select("id, credits_balance")
    .eq("email", userEmail)
    .single();

  if (user) return user.credits_balance ?? 0;

  const { data: inserted } = await supabase
    .from("users")
    .insert({
      email: userEmail,
      credits_balance: balanceFromCookie,
      plan: "free",
    })
    .select("credits_balance")
    .single();

  return inserted?.credits_balance ?? balanceFromCookie;
}

/**
 * Debita créditos e registra no ledger.
 * Se Supabase: atualiza users.credits_balance e insere credit_ledger.
 * Retorna novo saldo; caller deve atualizar cookie se usar cookie.
 */
export async function debitCredits(
  userEmail: string,
  amount: number,
  reason: LedgerReason,
  options: {
    relatedUsageId?: string;
    relatedPaymentId?: string;
    currentBalanceFromCookie?: number;
  } = {}
): Promise<DebitResult> {
  const supabase = getSupabase();
  const { relatedUsageId, relatedPaymentId, currentBalanceFromCookie = 0 } = options;

  if (!supabase || !isSupabaseConfigured()) {
    const newBalance = Math.max(0, currentBalanceFromCookie - amount);
    return { newBalance };
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, credits_balance")
    .eq("email", userEmail)
    .single();

  let userId: string;
  let currentBalance: number;

  if (user) {
    userId = user.id;
    currentBalance = user.credits_balance ?? 0;
  } else {
    const { data: inserted } = await supabase
      .from("users")
      .insert({
        email: userEmail,
        credits_balance: 0,
        plan: "free",
      })
      .select("id, credits_balance")
      .single();
    if (!inserted) {
      return { newBalance: Math.max(0, currentBalanceFromCookie - amount) };
    }
    userId = inserted.id;
    currentBalance = inserted.credits_balance ?? 0;
  }

  const newBalance = Math.max(0, currentBalance - amount);

  const { error: updateError } = await supabase
    .from("users")
    .update({ credits_balance: newBalance })
    .eq("id", userId);

  if (updateError) {
    return { newBalance: Math.max(0, currentBalanceFromCookie - amount) };
  }

  const ledgerRow: Record<string, unknown> = {
    user_id: userId,
    change_amount: -amount,
    reason,
    related_usage_id: relatedUsageId ?? null,
    related_payment_id: relatedPaymentId ?? null,
  };

  const { data: ledger } = await supabase
    .from("credit_ledger")
    .insert(ledgerRow)
    .select("id")
    .single();

  return { newBalance, ledgerId: ledger?.id };
}

/**
 * Adiciona créditos (compra ou ajuste admin) e registra no ledger.
 */
export async function addCredits(
  userEmail: string,
  amount: number,
  reason: LedgerReason,
  options: {
    relatedPaymentId?: string;
    currentBalanceFromCookie?: number;
  } = {}
): Promise<DebitResult> {
  const supabase = getSupabase();
  const { relatedPaymentId, currentBalanceFromCookie = 0 } = options;

  if (!supabase || !isSupabaseConfigured()) {
    return { newBalance: currentBalanceFromCookie + amount };
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, credits_balance")
    .eq("email", userEmail)
    .single();

  let userId: string;
  let currentBalance: number;

  if (user) {
    userId = user.id;
    currentBalance = user.credits_balance ?? 0;
  } else {
    const { data: inserted } = await supabase
      .from("users")
      .insert({
        email: userEmail,
        credits_balance: amount,
        plan: "free",
      })
      .select("id, credits_balance")
      .single();
    if (!inserted) return { newBalance: currentBalanceFromCookie + amount };
    userId = inserted.id;
    currentBalance = inserted.credits_balance ?? 0;
  }

  const newBalance = currentBalance + amount;

  await supabase.from("users").update({ credits_balance: newBalance }).eq("id", userId);

  await supabase.from("credit_ledger").insert({
    user_id: userId,
    change_amount: amount,
    reason,
    related_payment_id: relatedPaymentId ?? null,
  });

  return { newBalance };
}

export type PaymentProvider = "stripe" | "mercadopago";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

/**
 * Registra um pagamento na tabela payments (Supabase).
 * Retorna o id do registro ou null se Supabase não estiver configurado / erro.
 */
export async function recordPayment(
  userEmail: string,
  provider: PaymentProvider,
  amountBrl: number,
  creditsAdded: number,
  status: PaymentStatus,
  externalId?: string
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .single();

  let userId: string;
  if (user) {
    userId = user.id;
  } else {
    const { data: inserted } = await supabase
      .from("users")
      .insert({ email: userEmail, credits_balance: 0, plan: "free" })
      .select("id")
      .single();
    if (!inserted) return null;
    userId = inserted.id;
  }

  const { data: payment } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      provider,
      amount_brl: amountBrl,
      credits_added: creditsAdded,
      status,
      external_id: externalId ?? null,
    })
    .select("id")
    .single();

  return payment?.id ?? null;
}

/**
 * Compra: registra pagamento (quando Supabase) e adiciona créditos + ledger.
 * Usar no fulfill do checkout após confirmar pagamento.
 */
export async function addCreditsForPurchase(
  userEmail: string,
  creditsAdded: number,
  amountBrl: number,
  provider: PaymentProvider,
  externalId: string | undefined,
  currentBalanceFromCookie: number
): Promise<DebitResult> {
  const paymentId = await recordPayment(
    userEmail,
    provider,
    amountBrl,
    creditsAdded,
    "completed",
    externalId
  );
  return addCredits(userEmail, creditsAdded, "purchase", {
    relatedPaymentId: paymentId ?? undefined,
    currentBalanceFromCookie,
  });
}
