import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/adminAuth";
import { isStripeConfigured } from "@/lib/stripe";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getPlatformFeePercent } from "@/lib/finance";
import { getRateLimitConfig, getDailyLimitConfig } from "@/lib/usageLimits";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/status
 * Header: X-Config-Key ou Authorization: Bearer CONFIG_SECRET ou ?key=CONFIG_SECRET
 * Retorna estado da plataforma (sem segredos): Stripe, Supabase, limites, taxa.
 */
export async function GET(req: Request) {
  const auth = checkAdminAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rateLimit = getRateLimitConfig();
  const dailyLimit = getDailyLimitConfig();

  const status = {
    stripe: isStripeConfigured(),
    supabase: isSupabaseConfigured(),
    rateLimitPerMinute: rateLimit.perMinute,
    dailyAiLimit: dailyLimit,
    platformFeePercent: getPlatformFeePercent(),
    nodeEnv: process.env.NODE_ENV ?? "development",
  };

  return NextResponse.json(status);
}
