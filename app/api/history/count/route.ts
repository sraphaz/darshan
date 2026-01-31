/**
 * GET /api/history/count — contagem de revelações e leituras do usuário logado.
 * Usado para exibir o ícone de histórico quando há dados.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth";
import { getHistoryCounts } from "@/lib/historyStorage";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const session = getSessionFromCookie(cookieStore.toString());
  if (!session) {
    return NextResponse.json({ revelations: 0, readings: 0 });
  }
  const counts = await getHistoryCounts(session.email);
  return NextResponse.json(counts);
}
