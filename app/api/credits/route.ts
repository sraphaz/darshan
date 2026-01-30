import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import {
  getCreditsFromCookie,
  creditsCookieHeader,
} from "@/lib/credits";
import { getCreditsBalance } from "@/lib/finance";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autenticado.", balance: 0 }, { status: 401 });
  }
  const fromCookie = getCreditsFromCookie(cookieHeader);
  const balance = await getCreditsBalance(session.email, fromCookie);
  return NextResponse.json({ ok: true, balance });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const amount = typeof body.amount === "number" ? Math.floor(body.amount) : 0;
  if (amount <= 0) {
    return NextResponse.json({ ok: false, error: "Valor inválido." }, { status: 400 });
  }
  const current = getCreditsFromCookie(cookieHeader);
  const newBalance = current + amount;
  audit("credits_add", session.email, { amount, balanceBefore: current, balanceAfter: newBalance });
  const res = NextResponse.json({ ok: true, balance: newBalance });
  res.headers.set("Set-Cookie", creditsCookieHeader(newBalance));
  return res;
}
