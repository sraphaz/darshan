"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

type ConfigFieldMode = "replace" | "complement";

type AppConfig = {
  masterPromptOverride?: string | null;
  masterPromptMode?: ConfigFieldMode | null;
  revelationInstructionOverride?: string | null;
  revelationInstructionMode?: ConfigFieldMode | null;
  mockMessagesOverride?: string[] | null;
  mockMessagesMode?: ConfigFieldMode | null;
  readingInstructionOverride?: string | null;
  readingInstructionMode?: ConfigFieldMode | null;
  creditsPerRevelation?: number | null;
  creditsPerReading?: number | null;
  pricePerCreditCents?: number | null;
  updatedAt?: string | null;
};

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: { sitekey: string; callback?: (token: string) => void }) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

const RECAPTCHA_SITE_KEY = typeof process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY === "string"
  ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY.trim()
  : "";

export default function ConfigPage() {
  const [secretCode, setSecretCode] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaWidgetId = useRef<number | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [configKey, setConfigKey] = useState("");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const headers = () => ({ "X-Config-Key": configKey });

  const resetRecaptcha = useCallback(() => {
    setRecaptchaToken("");
    if (typeof window !== "undefined" && window.grecaptcha && recaptchaWidgetId.current !== null) {
      window.grecaptcha.reset(recaptchaWidgetId.current);
    }
  }, []);

  /** Valida reCAPTCHA e código secreto; se corretos, desbloqueia a página e carrega a config. */
  const unlock = useCallback(async () => {
    const code = secretCode.trim();
    if (!code) {
      setError("Digite o código secreto.");
      return;
    }
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError("Complete o reCAPTCHA (marque \"Não sou um robô\" e, se aparecer, as imagens).");
      return;
    }
    setError("");
    try {
      const res = RECAPTCHA_SITE_KEY
        ? await fetch("/api/config/unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secretCode: code, recaptchaToken }),
          })
        : await fetch("/api/config", { headers: { "X-Config-Key": code } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Código inválido.");
        resetRecaptcha();
        return;
      }
      const data = await res.json();
      setConfigKey(code);
      setConfig(data);
      setUnlocked(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      resetRecaptcha();
    }
  }, [secretCode, recaptchaToken, resetRecaptcha]);

  const save = useCallback(async () => {
    if (!configKey.trim() || !config) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers() },
        body: JSON.stringify({
          masterPromptOverride: config.masterPromptOverride ?? null,
          masterPromptMode: config.masterPromptMode ?? "complement",
          revelationInstructionOverride: config.revelationInstructionOverride ?? null,
          revelationInstructionMode: config.revelationInstructionMode ?? "complement",
          mockMessagesOverride: config.mockMessagesOverride ?? null,
          mockMessagesMode: config.mockMessagesMode ?? "complement",
          readingInstructionOverride: config.readingInstructionOverride ?? null,
          readingInstructionMode: config.readingInstructionMode ?? "complement",
          creditsPerRevelation: config.creditsPerRevelation ?? null,
          creditsPerReading: config.creditsPerReading ?? null,
          pricePerCreditCents: config.pricePerCreditCents ?? null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Erro ao salvar.");
        return;
      }
      const data = await res.json();
      setConfig(data);
    } catch {
      setError("Erro ao salvar. Verifique a conexão.");
    } finally {
      setSaving(false);
    }
  }, [configKey, config]);

  const mockMessagesText =
    Array.isArray(config?.mockMessagesOverride) && config.mockMessagesOverride.length > 0
      ? config.mockMessagesOverride.join("\n\n")
      : "";

  const setMockMessagesText = (text: string) => {
    const list = text
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setConfig((c) => (c ? { ...c, mockMessagesOverride: list.length ? list : null } : null));
  };

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    window.onRecaptchaLoad = () => {
      setTimeout(() => {
        if (recaptchaContainerRef.current && typeof window !== "undefined" && window.grecaptcha) {
          try {
            recaptchaWidgetId.current = window.grecaptcha.render(recaptchaContainerRef.current, {
              sitekey: RECAPTCHA_SITE_KEY,
              callback: (token: string) => setRecaptchaToken(token),
            });
          } catch (e) {
            console.error("[config] reCAPTCHA render error:", e);
          }
        }
      }, 0);
    };
    return () => {
      window.onRecaptchaLoad = undefined;
    };
  }, []);

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#050506] text-[#F5F5F7] p-6 max-w-md mx-auto flex flex-col justify-center">
        {RECAPTCHA_SITE_KEY && (
          <Script
            src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit"
            strategy="lazyOnLoad"
          />
        )}
        <div className="mb-6">
          <Link
            href="/"
            className="text-[#B8B8C0] hover:text-[#F5F5F7] text-sm transition-colors"
          >
            ← Voltar
          </Link>
        </div>
        <section className="space-y-4">
          <p className="text-[#B8B8C0] text-sm">
            Digite o código secreto para acessar a página de configuração.
          </p>
          {RECAPTCHA_SITE_KEY && (
            <div className="flex justify-start [&_.grecaptcha-badge]:self-center">
              <div ref={recaptchaContainerRef} id="recaptcha-config-container" />
            </div>
          )}
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[#B8B8C0] text-xs mb-1">Código secreto</label>
              <input
                type="password"
                placeholder="Código secreto"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlock()}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20"
              />
            </div>
            <button
              type="button"
              onClick={unlock}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded text-[#F5F5F7] text-sm transition-colors"
            >
              Entrar
            </button>
          </div>
          {error && <p className="text-amber-400/90 text-sm">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050506] text-[#F5F5F7] p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-[#B8B8C0] hover:text-[#F5F5F7] text-sm transition-colors"
          >
            ← Voltar
          </Link>
          <Link
            href="/monitor"
            className="text-[#B8B8C0] hover:text-[#F5F5F7] text-sm transition-colors"
          >
            Monitor
          </Link>
        </div>
        <h1 className="text-lg font-medium tracking-wide text-[#F5F5F7]">
          Configuração — sementes da IA
        </h1>
      </div>

      <section className="space-y-6">
          {error && <p className="text-amber-400/90 text-sm">{error}</p>}
          {config?.updatedAt && (
            <p className="text-[#B8B8C0] text-xs">Última atualização: {config.updatedAt}</p>
          )}

          <div>
            <label className="block text-sm text-[#B8B8C0] mb-1">
              Master Prompt — <code className="bg-white/10 px-1 rounded">docs/MASTER_PROMPT.md</code>
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="masterPromptMode"
                  checked={(config?.masterPromptMode ?? "complement") === "complement"}
                  onChange={() => setConfig((c) => (c ? { ...c, masterPromptMode: "complement" } : null))}
                  className="rounded-full border-white/20"
                />
                Complemento (adiciona ao padrão)
              </label>
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="masterPromptMode"
                  checked={(config?.masterPromptMode ?? "complement") === "replace"}
                  onChange={() => setConfig((c) => (c ? { ...c, masterPromptMode: "replace" } : null))}
                  className="rounded-full border-white/20"
                />
                Substituição (substitui o padrão)
              </label>
            </div>
            <textarea
              value={config?.masterPromptOverride ?? ""}
              onChange={(e) =>
                setConfig((c) =>
                  c ? { ...c, masterPromptOverride: e.target.value || null } : null
                )
              }
              placeholder="Deixe vazio para usar o arquivo MASTER_PROMPT.md"
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20 resize-y font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-[#B8B8C0] mb-1">
              Instrução de revelação (enviada à IA na revelação única)
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="revelationMode"
                  checked={(config?.revelationInstructionMode ?? "complement") === "complement"}
                  onChange={() => setConfig((c) => (c ? { ...c, revelationInstructionMode: "complement" } : null))}
                  className="rounded-full border-white/20"
                />
                Complemento
              </label>
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="revelationMode"
                  checked={(config?.revelationInstructionMode ?? "complement") === "replace"}
                  onChange={() => setConfig((c) => (c ? { ...c, revelationInstructionMode: "replace" } : null))}
                  className="rounded-full border-white/20"
                />
                Substituição
              </label>
            </div>
            <textarea
              value={config?.revelationInstructionOverride ?? ""}
              onChange={(e) =>
                setConfig((c) =>
                  c ? { ...c, revelationInstructionOverride: e.target.value || null } : null
                )
              }
              placeholder="Deixe vazio para usar o texto padrão da aplicação"
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20 resize-y font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-[#B8B8C0] mb-1">
              Mensagens mock (fallback do oráculo offline) — uma mensagem por bloco
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="mockMode"
                  checked={(config?.mockMessagesMode ?? "complement") === "complement"}
                  onChange={() => setConfig((c) => (c ? { ...c, mockMessagesMode: "complement" } : null))}
                  className="rounded-full border-white/20"
                />
                Complemento
              </label>
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="mockMode"
                  checked={(config?.mockMessagesMode ?? "complement") === "replace"}
                  onChange={() => setConfig((c) => (c ? { ...c, mockMessagesMode: "replace" } : null))}
                  className="rounded-full border-white/20"
                />
                Substituição
              </label>
            </div>
            <textarea
              value={mockMessagesText}
              onChange={(e) => setMockMessagesText(e.target.value)}
              placeholder="Uma mensagem por bloco (blocos separados por linha em branco). Deixe vazio para usar as mensagens padrão."
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20 resize-y font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-[#B8B8C0] mb-1">
              Leitura (resumo completo: Sol, Lua, planetas, Nakshatras, numerologia)
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="readingMode"
                  checked={(config?.readingInstructionMode ?? "complement") === "complement"}
                  onChange={() => setConfig((c) => (c ? { ...c, readingInstructionMode: "complement" } : null))}
                  className="rounded-full border-white/20"
                />
                Complemento (adiciona ao prompt da leitura)
              </label>
              <label className="flex items-center gap-2 text-sm text-[#B8B8C0] cursor-pointer">
                <input
                  type="radio"
                  name="readingMode"
                  checked={(config?.readingInstructionMode ?? "complement") === "replace"}
                  onChange={() => setConfig((c) => (c ? { ...c, readingInstructionMode: "replace" } : null))}
                  className="rounded-full border-white/20"
                />
                Substituição
              </label>
            </div>
            <textarea
              value={config?.readingInstructionOverride ?? ""}
              onChange={(e) =>
                setConfig((c) =>
                  c ? { ...c, readingInstructionOverride: e.target.value || null } : null
                )
              }
              placeholder="Deixe vazio para usar o prompt padrão da leitura. Complemento: adiciona ao texto que alimenta a IA."
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20 resize-y font-mono text-sm"
            />
          </div>

          <div className="border-t border-white/10 pt-6 mt-6">
            <h2 className="text-[#F5F5F7] font-medium text-sm mb-4">Preços e créditos</h2>
            <p className="text-[#B8B8C0] text-xs mb-4">
              Custos dos serviços em créditos e valor por crédito (centavos). Deixe vazio para usar o padrão.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-[#B8B8C0] mb-1">Créditos por revelação (IA)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={config?.creditsPerRevelation ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
                    setConfig((c) => (c ? { ...c, creditsPerRevelation: Number.isFinite(v) ? v : null } : null));
                  }}
                  placeholder="1"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8B8C0] mb-1">Créditos por leitura</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={config?.creditsPerReading ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
                    setConfig((c) => (c ? { ...c, creditsPerReading: Number.isFinite(v) ? v : null } : null));
                  }}
                  placeholder="9"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8B8C0] mb-1">Valor por crédito (centavos)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={config?.pricePerCreditCents ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
                    setConfig((c) => (c ? { ...c, pricePerCreditCents: Number.isFinite(v) ? v : null } : null));
                  }}
                  placeholder="69"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20 text-sm"
                />
                <p className="text-[#808088] text-[11px] mt-1">Ex.: 69 = R$ 0,69 por crédito</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-white/15 hover:bg-white/20 disabled:opacity-50 rounded text-[#F5F5F7] text-sm transition-colors"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setUnlocked(false);
                setConfigKey("");
                setConfig(null);
                setSecretCode("");
                setError("");
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-[#B8B8C0] text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        </section>
    </main>
  );
}
