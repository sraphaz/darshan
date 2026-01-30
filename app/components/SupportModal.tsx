"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  creditsPerRevelation: number;
};

export default function SupportModal({ isOpen, onClose, creditsPerRevelation }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-sm max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto pointer-events-auto bg-deep-night/95 border border-white/15 rounded-xl shadow-2xl py-4 px-4 sm:py-6 sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-white/40 text-xs tracking-wide font-light">?</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-moon-grey/70 hover:text-white/50 transition p-1 text-sm font-light"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>

              <p className="text-mist/90 text-sm font-light leading-relaxed tracking-wide mb-6">
                As informações que você recebe aqui não são determinísticas. O mapa, o oráculo e a IA oferecem leituras interpretativas — sugestões de sentido, não previsões fixas. O que importa é o que ressoa em você.
              </p>

              <div className="border-t border-white/10 pt-4 space-y-4">
                <div>
                  <p className="text-moon-grey/70 text-xs font-light mb-1">Créditos e consumo</p>
                  <p className="text-moon-grey/80 text-xs font-light leading-relaxed">
                    Cada revelação com IA consome <strong className="text-mist/80">{creditsPerRevelation} créditos</strong>. O valor cobre o custo do uso da IA e uma margem para o app. O modo “AI desligada” usa o oráculo offline e não consome créditos.
                  </p>
                </div>
                <div>
                  <p className="text-moon-grey/70 text-xs font-light mb-1">Como adicionar créditos</p>
                  <p className="text-moon-grey/80 text-xs font-light leading-relaxed">
                    Toque no ícone de créditos no topo da tela. Escolha a quantidade de créditos. Pagamento seguro: cartão, Google Pay ou Stripe Link (Stripe); ou PIX/cartão (Mercado Pago).
                  </p>
                </div>
                <div>
                  <p className="text-moon-grey/70 text-xs font-light mb-1">Login sem senha</p>
                  <p className="text-moon-grey/80 text-xs font-light leading-relaxed">
                    Seu acesso é pelo e-mail (código de uso único) ou com conta Google. Não guardamos senha. Em breve: login por biometria.
                  </p>
                </div>
                <div>
                  <p className="text-moon-grey/70 text-xs font-light mb-1">Contato</p>
                  <p className="text-moon-grey/80 text-xs font-light leading-relaxed">
                    Dúvidas ou problemas: envie um e-mail para suporte indicado nas configurações do app ou na página de divulgação.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
