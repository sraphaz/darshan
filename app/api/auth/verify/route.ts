import { NextResponse } from "next/server";
import { verifyOtp, isDevCode } from "@/lib/otpStore";
import { sessionCookieHeader } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code : "";
  if (!email || !code) {
    return NextResponse.json(
      { ok: false, error: "E-mail e código são obrigatórios." },
      { status: 400 }
    );
  }
  const valid = verifyOtp(email, code) || isDevCode(email, code);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Código inválido ou expirado." },
      { status: 401 }
    );
  }
  audit("login_email", email);
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", sessionCookieHeader({ email }));
  return res;
}
