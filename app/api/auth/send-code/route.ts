import { NextResponse } from "next/server";
import { setOtp } from "@/lib/otpStore";
import { sendVerificationCode } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "E-mail inválido." },
      { status: 400 }
    );
  }
  const code = setOtp(email);

  const sent = await sendVerificationCode(email, code);
  if (sent.ok) {
    return NextResponse.json({ ok: true, message: "Código enviado para seu e-mail." });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[darshan] OTP para", email, ":", code, "(e-mail não enviado:", sent.error, ")");
    return NextResponse.json({ ok: true, message: "Código enviado para seu e-mail." });
  }

  return NextResponse.json(
    { ok: false, error: "Não foi possível enviar o e-mail. Tente novamente ou use Google para entrar." },
    { status: 503 }
  );
}
