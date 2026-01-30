"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { UserProfile } from "@/lib/userProfile";

/** Ícone minimalista de copiar (dois retângulos). */
function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="1.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

/** Ícone minimalista de check (copiado). */
function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

/** Remove prefixos/sufixos de JSON que às vezes vêm na resposta da IA (ex.: => {"message": ... }). */
function cleanReadingMessage(raw: string): string {
  let s = raw.trim().replace(/^=>\s*/i, "").trim();
  try {
    const parsed = JSON.parse(s) as { message?: string };
    if (typeof parsed.message === "string") return parsed.message.trim();
  } catch {
    // Tentar extrair o valor de "message" manualmente
    const idx = s.search(/"message"\s*:\s*"/i);
    if (idx !== -1) {
      const start = s.indexOf('"', idx + 10) + 1;
      let end = start;
      for (let i = start; i < s.length; i++) {
        if (s[i] === "\\" && s[i + 1] === '"') { i++; continue; }
        if (s[i] === '"') { end = i; break; }
      }
      const extracted = s.slice(start, end).replace(/\\"/g, '"').replace(/\\n/g, "\n");
      if (extracted.length > 0) return extracted;
    }
  }
  return s.replace(/\}\s*$/, "").trim();
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  credits: number;
  /** Créditos por leitura (configurável na página secreta). */
  creditsPerReading: number;
  /** Quando true, envia offline: true e a leitura é gerada sem IA e sem custo. */
  offlineMode?: boolean;
  onBalanceUpdate: (newBalance: number) => void;
  onOpenCredits: () => void;
};

export default function PersonalMapModal({
  isOpen,
  onClose,
  profile,
  credits,
  creditsPerReading,
  offlineMode = false,
  onBalanceUpdate,
  onOpenCredits,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [confirmNewReading, setConfirmNewReading] = useState(false);

  const hasEnoughCredits = credits >= creditsPerReading;
  const canGenerate =
    (offlineMode || hasEnoughCredits) && profile && (profile.fullName?.trim() || profile.birthDate?.trim());

  async function handleGenerate() {
    if (!canGenerate) {
      if (!hasEnoughCredits) onOpenCredits();
      return;
    }
    setConfirmNewReading(false);
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/map/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile: {
            fullName: profile.fullName ?? undefined,
            birthDate: profile.birthDate ?? undefined,
            birthPlace: profile.birthPlace ?? undefined,
            birthTime: profile.birthTime ?? undefined,
          },
          offline: offlineMode,
        }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setError("Faça login para adquirir sua leitura.");
        return;
      }
      if (res.status === 402) {
        setError(`A leitura custa ${creditsPerReading} créditos. Adicione créditos para continuar.`);
        if (typeof data.balance === "number") onBalanceUpdate(data.balance);
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível gerar a leitura. Tente novamente.");
        return;
      }

      const rawMessage = typeof data.message === "string" ? data.message : "";
      setResult(cleanReadingMessage(rawMessage) || rawMessage);
      if (typeof data.balance === "number") onBalanceUpdate(data.balance);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setError("");
    setResult(null);
    setConfirmNewReading(false);
    onClose();
  }

  function handleNewReadingClick() {
    if (offlineMode) {
      handleGenerate();
      return;
    }
    if (!hasEnoughCredits) {
      onOpenCredits();
      return;
    }
    setConfirmNewReading(true);
  }

  function handleConfirmNewReading() {
    handleGenerate();
  }

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={handleClose}
        aria-hidden
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-lg max-h-[85dvh] sm:max-h-[90vh] overflow-hidden flex flex-col bg-[#060608] border border-white/10 rounded-xl shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 shrink-0">
            <h2 className="text-mist font-light text-lg">Leitura</h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-moon-grey hover:text-white/50 transition p-2 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
            {!result ? (
              <>
                <div className="mb-4">
                  <p className="text-white/70 text-sm leading-relaxed">
                    Resumo completo considerando Sol regente, Lua, planetas, Nakshatras e numerologia — com exemplos e detalhes práticos. Você pode gerar quantas vezes quiser; cada vez será um novo resultado.
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
                    {!confirmNewReading ? (
                      <>
                        <div className="flex items-center gap-1 flex-wrap">
                          {!offlineMode && (
                            <span className="text-[#606068] text-[11px]">{creditsPerReading} créditos</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (offlineMode) {
                                handleGenerate();
                                return;
                              }
                              if (!hasEnoughCredits) {
                                onOpenCredits();
                                return;
                              }
                              setConfirmNewReading(true);
                            }}
                            disabled={loading || !canGenerate}
                            className="px-3 py-2 rounded-lg bg-black/40 text-[#b0b0b8] font-light text-sm border border-white/5 hover:bg-black/50 hover:border-white/10 disabled:opacity-50 disabled:pointer-events-none transition"
                          >
                            {loading ? "Gerando…" : "Criar"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-[#a0a0aa] text-sm leading-relaxed">
                          Esta operação vai consumir {creditsPerReading} créditos de seu saldo. Confirmar?
                        </p>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setConfirmNewReading(false)}
                            className="min-h-[40px] px-4 py-2 rounded-lg bg-black/30 text-[#a0a0aa] font-light text-sm border border-white/5 hover:bg-black/40 transition"
                          >
                            Não
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmNewReading}
                            disabled={loading}
                            className="min-h-[40px] px-4 py-2 rounded-lg bg-black/40 text-[#c8c8d4] font-light text-sm border border-white/10 hover:bg-black/50 disabled:opacity-50 transition"
                          >
                            {loading ? "Gerando…" : "Sim"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {error && (
                  <p className="text-red-300/90 text-sm mb-4" role="alert">
                    {error}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-[#c8c8d4] text-[15px] leading-[1.65] whitespace-pre-wrap font-normal antialiased selection:bg-white/20" id="reading-text">
                    {result}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-4 flex-wrap">
                    <div className="flex-1 min-w-0" aria-hidden />
                    <div className="flex items-center justify-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(result).then(() => setCopyDone(true), () => {});
                          setTimeout(() => setCopyDone(false), 2000);
                        }}
                        className="p-2 rounded-lg bg-white/5 text-[#c8c8d4] border border-white/10 hover:bg-white/10 transition"
                        title="Copiar texto"
                        aria-label="Copiar texto"
                      >
                        {copyDone ? (
                          <IconCheck className="w-4 h-4 text-emerald-400/90" />
                        ) : (
                          <IconCopy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap justify-end flex-1 min-w-0">
                      {!offlineMode && (
                        <span className="text-[#606068] text-[11px]">{creditsPerReading} créditos</span>
                      )}
                      {!confirmNewReading ? (
                        <button
                          type="button"
                          onClick={handleNewReadingClick}
                          disabled={loading || (!offlineMode && !hasEnoughCredits)}
                          className="px-3 py-2 rounded-lg bg-black/40 text-[#b0b0b8] font-light text-sm border border-white/5 hover:bg-black/50 hover:border-white/10 disabled:opacity-50 disabled:pointer-events-none transition"
                        >
                          {loading ? "Gerando…" : "Recriar"}
                        </button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <p className="text-[#a0a0aa] text-sm leading-relaxed">
                            Esta operação vai consumir {creditsPerReading} créditos de seu saldo. Confirmar?
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setConfirmNewReading(false)}
                              className="min-h-[40px] px-4 py-2 rounded-lg bg-black/30 text-[#a0a0aa] font-light text-sm border border-white/5 hover:bg-black/40 transition"
                            >
                              Não
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmNewReading}
                              disabled={loading}
                              className="min-h-[40px] px-4 py-2 rounded-lg bg-black/40 text-[#c8c8d4] font-light text-sm border border-white/10 hover:bg-black/50 disabled:opacity-50 transition"
                            >
                              {loading ? "Gerando…" : "Sim"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {error && (
                  <p className="text-red-300/90 text-sm mb-4" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
