"use client";

import { motion } from "framer-motion";
import Tooltip from "./Tooltip";

type Props = {
  onClick: () => void;
};

/** Ícone de leitura (resumo completo) — posicionado abaixo do ícone Dados. */
export default function PersonalMapIcon({ onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="fixed top-24 right-3 sm:top-28 sm:right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-moon-grey/80 hover:text-white/50 transition-colors z-50"
      aria-label="Leitura (resumo completo por 9 créditos)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
    >
      <Tooltip text="Leitura" groupName="personalMap" align="right">
        <svg
          className="w-5 h-5 text-current"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      </Tooltip>
    </motion.button>
  );
}
