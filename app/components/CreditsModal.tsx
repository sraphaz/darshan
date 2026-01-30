"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CREDIT_PACKAGES,
  formatPriceBRL,
} from "../../lib/credits";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPurchased: (newBalance: number) => void;
  /** Créditos por revelação (configurável na página secreta). */
  creditsPerRevelation: number;
  /** Créditos por leitura (configurável na página secreta). */
  creditsPerReading: number;
};

export default function CreditsModal({ isOpen, onClose, onPurchased, creditsPerRevelation, creditsPerReading }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePurchase() {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === selectedId);
    if (!pkg) {
      setError("Escolha um pacote.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body = { packageId: pkg.id };
      const opts = {
        method: "POST" as const,
        headers: { "Content-Type": "application/json" },
        credentials: "include" as const,
        body: JSON.stringify(body),
      };
      let res = await fetch("/api/checkout/mercadopago", opts);
      let data: { url?: string; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        res = await fetch("/api/checkout/create", opts);
        data = await res.json().catch(() => ({}));
      }
      if (res.ok && typeof data?.url === "string") {
        window.location.href = data.url;
        return;
      }
      setError(data?.error ?? "Nenhum pagamento configurado. Configure Stripe ou Mercado Pago.");
    } catch {
      setError("Erro de conexão. Tente novamente.");
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
          <h2 className="text-mist font-light text-lg">Recarregar créditos</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-moon-grey hover:text-white/50 transition p-2 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <p className="text-moon-grey/60 text-xs mb-4">
          Revelação com IA: <strong className="text-mist/80">{creditsPerRevelation} crédito{creditsPerRevelation !== 1 ? "s" : ""}</strong>. Leitura completa: <strong className="text-mist/80">{creditsPerReading} créditos</strong>.
        </p>

        <div className="space-y-2 mb-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedId(pkg.id)}
              className={`w-full py-3 px-4 rounded-lg border text-left transition ${
                selectedId === pkg.id
                  ? "border-white/30 bg-white/10 text-mist"
                  : "border-white/10 bg-white/5 text-moon-grey hover:text-mist"
              }`}
            >
              <span className="font-medium">{pkg.label}</span>
              <span className="float-right text-mist/90">{formatPriceBRL(pkg.priceCents)}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-red-400/90 text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] py-2.5 rounded-lg border border-white/10 text-moon-grey hover:text-white/50 transition text-sm touch-manipulation"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePurchase}
            disabled={loading || !selectedId}
            className="flex-1 min-h-[44px] py-2.5 rounded-lg bg-white/10 text-mist hover:text-white/70 transition text-sm font-light disabled:opacity-50 touch-manipulation"
          >
            {loading ? "Processando…" : "Comprar"}
          </button>
        </div>

        <p className="text-moon-grey/50 text-xs mt-4">
          Pagamento seguro: Mercado Pago (PIX, cartão) ou Stripe (cartão, Google Pay). Você será redirecionado ao checkout.
        </p>
        </motion.div>
      </div>
    </>
  );
}
