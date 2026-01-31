/**
 * GET /api/history/revelations — lista revelações (respostas do orb) do usuário logado.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import { listRevelations } from "@/lib/historyStorage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const session = getSessionFromCookie(cookieStore.toString());
  if (!session) {
    return NextResponse.json({ error: "Faça login para ver seu histórico." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);
  const list = await listRevelations(session.email, { limit, offset });
  return NextResponse.json({ items: list });
}
