import { NextResponse } from "next/server";
import { CREDITS_PER_AI_REQUEST, CREDITS_PER_PERSONAL_MAP } from "@/lib/credits";
import { getConfig } from "@/lib/configStore";
import { getPlatformFeePercent } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getConfig();
  const creditsPerRevelation = config.creditsPerRevelation ?? CREDITS_PER_AI_REQUEST;
  const creditsPerReading = config.creditsPerReading ?? CREDITS_PER_PERSONAL_MAP;
  const pricePerCreditCents = config.pricePerCreditCents ?? null;
  const platformFeePercent = getPlatformFeePercent();
  return NextResponse.json({
    creditsPerRevelation,
    creditsPerReading,
    pricePerCreditCents,
    platformFeePercent,
    description: `Créditos por revelação: ${creditsPerRevelation}; por leitura: ${creditsPerReading}. Margem: ${platformFeePercent}%.`,
  });
}
