import { NextResponse } from "next/server";
import { getConfig, setConfig, type AppConfig, type ConfigFieldMode } from "@/lib/configStore";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function getSecretFromRequest(req: Request): string | null {
  const key = req.headers.get("x-config-key");
  if (key) return key;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

function checkAuth(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.CONFIG_SECRET;
  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "Configuração desativada. Defina CONFIG_SECRET em .env.local e reinicie o servidor.",
    };
  }
  const provided = getSecretFromRequest(req);
  if (provided !== secret) {
    return { ok: false, status: 401, error: "Código inválido." };
  }
  return { ok: true };
}

/**
 * GET /api/config — retorna a configuração atual (requer CONFIG_SECRET no header).
 */
export async function GET(req: Request) {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const config = getConfig();
  return NextResponse.json(config);
}

/**
 * PUT /api/config — atualiza configuração (merge parcial). Requer CONFIG_SECRET.
 */
export async function PUT(req: Request) {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  let body: Partial<AppConfig>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
  }
  const mode = (v: unknown): ConfigFieldMode =>
    v === "replace" || v === "complement" ? v : "complement";
  const partial: Partial<AppConfig> = {};
  if (body.masterPromptOverride !== undefined) {
    partial.masterPromptOverride =
      typeof body.masterPromptOverride === "string" ? body.masterPromptOverride : null;
  }
  if (body.masterPromptMode !== undefined) partial.masterPromptMode = mode(body.masterPromptMode);
  if (body.revelationInstructionOverride !== undefined) {
    partial.revelationInstructionOverride =
      typeof body.revelationInstructionOverride === "string" ? body.revelationInstructionOverride : null;
  }
  if (body.revelationInstructionMode !== undefined) partial.revelationInstructionMode = mode(body.revelationInstructionMode);
  if (body.mockMessagesOverride !== undefined) {
    partial.mockMessagesOverride = Array.isArray(body.mockMessagesOverride)
      ? body.mockMessagesOverride.filter((x): x is string => typeof x === "string")
      : null;
  }
  if (body.mockMessagesMode !== undefined) partial.mockMessagesMode = mode(body.mockMessagesMode);
  if (body.readingInstructionOverride !== undefined) {
    partial.readingInstructionOverride =
      typeof body.readingInstructionOverride === "string" ? body.readingInstructionOverride : null;
  }
  if (body.readingInstructionMode !== undefined) partial.readingInstructionMode = mode(body.readingInstructionMode);
  if (body.creditsPerRevelation !== undefined) {
    const n = Number(body.creditsPerRevelation);
    partial.creditsPerRevelation = Number.isFinite(n) && n >= 0 ? n : null;
  }
  if (body.creditsPerReading !== undefined) {
    const n = Number(body.creditsPerReading);
    partial.creditsPerReading = Number.isFinite(n) && n >= 0 ? n : null;
  }
  if (body.pricePerCreditCents !== undefined) {
    const n = Number(body.pricePerCreditCents);
    partial.pricePerCreditCents = Number.isFinite(n) && n >= 0 ? n : null;
  }
  const updated = setConfig(partial);
  audit("config_update", "admin", { keys: Object.keys(partial) });
  return NextResponse.json(updated);
}
