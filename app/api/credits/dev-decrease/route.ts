import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import {
  getCreditsFromCookie,
  creditsCookieHeader,
  CREDITS_PER_AI_REQUEST,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

/**
 * POST /api/credits/dev-decrease
 * Apenas em NODE_ENV=development: diminui créditos em 1 revelação (para testar fluxo).
 */
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, error: "Disponível apenas em desenvolvimento." },
      { status: 403 }
    );
  }
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autenticado.", balance: 0 }, { status: 401 });
  }
  const current = getCreditsFromCookie(cookieHeader);
  const newBalance = Math.max(0, current - CREDITS_PER_AI_REQUEST);
  const res = NextResponse.json({ ok: true, balance: newBalance });
  res.headers.set("Set-Cookie", creditsCookieHeader(newBalance));
  return res;
}
