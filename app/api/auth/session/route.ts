import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session) {
    return NextResponse.json({ ok: false, session: null });
  }
  return NextResponse.json({ ok: true, session: { email: session.email } });
}
