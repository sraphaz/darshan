"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "./Tooltip";

type Step = "email" | "code";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LoginModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar código.");
        return;
      }
      setStep("code");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Código inválido.");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-sm max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto bg-deep-night border border-white/10 rounded-xl shadow-2xl p-4 sm:p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-mist font-light text-lg">Entrar</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-moon-grey hover:text-white/50 transition p-2 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <p className="text-moon-grey/80 text-sm mb-4">
          Sem senha: informe seu e-mail e use o código que enviarmos para acessar.
        </p>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onSubmit={handleSendCode}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-transparent border-0 border-b border-white/25 rounded-none px-0 py-2.5 text-sm text-mist placeholder:text-white/40 outline-none focus:border-white/50 transition-colors mb-4"
              />
              {error && <p className="text-red-400/90 text-xs mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-white/10 text-mist hover:text-white/70 transition text-sm font-light disabled:opacity-50"
              >
                {loading ? "Enviando…" : "Enviar código"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="code"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onSubmit={handleVerify}
            >
              <p className="text-moon-grey/80 text-xs mb-2">Código enviado para {email}</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
                className="w-full bg-transparent border-0 border-b border-white/25 rounded-none px-0 py-2.5 text-sm text-mist placeholder:text-white/40 outline-none focus:border-white/50 transition-colors mb-4 tracking-widest"
              />
              {error && <p className="text-red-400/90 text-xs mb-3">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setCode(""); setError(""); }}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-moon-grey hover:text-white/50 transition text-sm"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 4}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 text-mist hover:text-white/70 transition text-sm font-light disabled:opacity-50"
                >
                  {loading ? "Verificando…" : "Entrar"}
                </button>
              </div>
              <p className="text-moon-grey/50 text-xs mt-3">
                Em desenvolvimento: use código 123456 para testar.
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-moon-grey/50 text-xs mb-2">Ou entre com</p>
          <div className="flex gap-2">
            <Tooltip text="Entrar com conta Google" groupName="google">
              <a
                href="/api/auth/google"
                className="flex-1 py-2.5 rounded-lg border border-white/20 bg-white/5 text-mist hover:text-white/60 text-sm font-light transition text-center"
              >
                Google
              </a>
            </Tooltip>
            <Tooltip text="Login por biometria (celular) em breve" groupName="biometria">
              <button
                type="button"
                disabled
                className="flex-1 py-2 rounded-lg border border-white/10 text-moon-grey/50 text-xs cursor-not-allowed"
              >
                Biometria (em breve)
              </button>
            </Tooltip>
          </div>
        </div>
        </motion.div>
      </div>
    </>
  );
}
