import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import { clearSessionCookieHeader } from "@/lib/auth";
import { clearCreditsCookieHeader } from "@/lib/credits";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const session = getSessionFromCookie(cookieStore.toString());
  if (session?.email) {
    audit("logout", session.email);
  }
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", clearSessionCookieHeader());
  res.headers.append("Set-Cookie", clearCreditsCookieHeader());
  return res;
}
