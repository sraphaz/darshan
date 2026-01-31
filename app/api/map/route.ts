/**
 * POST /api/map — retorna SymbolicMap completo (offline, sem IA, sem créditos).
 * Motor simbólico real: Jyotish + Numerologia + Arquétipos.
 */

import { NextResponse } from "next/server";
import { buildSymbolicMap } from "@/lib/symbolic/builder";

export const dynamic = "force-dynamic";

type ProfileInput = {
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
};

export async function POST(req: Request) {
  let body: { profile?: ProfileInput } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const profile = body.profile ?? {};
  const map = buildSymbolicMap({
    fullName: profile.fullName,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthPlace: profile.birthPlace,
  });
  return NextResponse.json({ map });
}
