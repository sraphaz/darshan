import { NextResponse } from "next/server";
import { getConnector } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * GET /api/darshan/check
 * Valida se há um conector de IA configurado (chave em .env.local).
 * Aceita ?mock=1 para retornar ok: true (frontend usa mock e permite interação sem API).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mockParam = url.searchParams.get("mock");
  if (mockParam === "1" || mockParam === "true") {
    return NextResponse.json({ ok: true, provider: "mock" });
  }
  const connector = getConnector();
  if (!connector) {
    return NextResponse.json(
      { ok: false, message: "Nenhum provedor de IA configurado. Defina OPENAI_API_KEY, GOOGLE_AI_API_KEY ou ANTHROPIC_API_KEY em .env.local. Ou use o toggle 'AI desligada' (mock) no topo da página." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, provider: connector.id });
}
