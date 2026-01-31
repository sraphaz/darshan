/**
 * POST /api/reading/career — leitura de carreira offline (mapa + narrativa + action).
 */

import { NextResponse } from "next/server";
import { getCareerReading } from "@/lib/readings/careerReading";
import type { CoreProfile } from "@/lib/core/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { profile?: CoreProfile } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const profile: CoreProfile = body.profile ?? {};
  const { map, reading, action } = await getCareerReading(profile);
  return NextResponse.json({
    map: {
      core: { providerUsed: map.core.providerUsed, moonRashi: map.core.moonRashi, nakshatra: map.core.nakshatra },
      jyotish: map.jyotish,
      numerology: map.numerology,
      humanDesign: map.humanDesign,
    },
    reading,
    action,
  });
}
