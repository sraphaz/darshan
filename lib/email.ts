/**
 * Conector de e-mail — envio de código de verificação (Resend).
 * Em produção defina RESEND_API_KEY e RESEND_FROM.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export type SendResult = { ok: boolean; error?: string };

/**
 * Envia o código de verificação por e-mail via Resend.
 * Retorna { ok: true } se enviado; { ok: false, error } em caso de falha.
 * Se RESEND_API_KEY não estiver definido, retorna { ok: false } e não envia.
 */
export async function sendVerificationCode(to: string, code: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Darshan <onboarding@resend.dev>";

  if (!apiKey?.trim()) {
    return { ok: false, error: "RESEND_API_KEY não configurado." };
  }

  const subject = "Seu código Darshan";
  const html = `
    <p>Seu código de acesso é: <strong>${code}</strong></p>
    <p>Use este código na tela de entrada do Darshan. O código expira em alguns minutos.</p>
    <p>Se você não solicitou este código, ignore este e-mail.</p>
  `.trim();

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from.trim(),
        to: [to.trim()],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = (data as { message?: string }).message || res.statusText;
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
