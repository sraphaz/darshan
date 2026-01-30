import { NextResponse } from "next/server";
import { getConfig } from "@/lib/configStore";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/config/unlock
 * Body: { secretCode: string, recaptchaToken: string }
 * Verifica o reCAPTCHA com o Google e, se o código secreto estiver correto, retorna a config.
 */
export async function POST(req: Request) {
  const secret = process.env.CONFIG_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Configuração desativada. Defina CONFIG_SECRET." },
      { status: 503 }
    );
  }

  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!recaptchaSecret) {
    return NextResponse.json(
      { error: "reCAPTCHA não configurado. Defina RECAPTCHA_SECRET_KEY." },
      { status: 503 }
    );
  }

  let body: { secretCode?: string; recaptchaToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
  }

  const token = typeof body.recaptchaToken === "string" ? body.recaptchaToken.trim() : "";
  if (!token) {
    return NextResponse.json(
      { error: "Complete o reCAPTCHA." },
      { status: 400 }
    );
  }

  const secretCode = typeof body.secretCode === "string" ? body.secretCode.trim() : "";
  if (!secretCode) {
    return NextResponse.json(
      { error: "Digite o código secreto." },
      { status: 400 }
    );
  }

  let verifyRes: Response;
  try {
    verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: token,
      }),
    });
  } catch (e) {
    console.error("[config/unlock] reCAPTCHA verify failed:", e);
    return NextResponse.json(
      { error: "Não foi possível verificar o reCAPTCHA. Tente novamente." },
      { status: 502 }
    );
  }

  let verifyData: { success?: boolean; "error-codes"?: string[] };
  try {
    verifyData = await verifyRes.json();
  } catch {
    return NextResponse.json(
      { error: "Resposta inválida do reCAPTCHA." },
      { status: 502 }
    );
  }

  if (!verifyData.success) {
    return NextResponse.json(
      { error: "reCAPTCHA inválido ou expirado. Tente novamente." },
      { status: 400 }
    );
  }

  if (secretCode !== secret) {
    return NextResponse.json(
      { error: "Código inválido." },
      { status: 401 }
    );
  }

  audit("config_unlock", "admin");
  const config = getConfig();
  return NextResponse.json(config);
}
