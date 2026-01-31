"use client";

import { motion } from "framer-motion";
import Tooltip from "./Tooltip";

type Props = {
  onClick: () => void;
};

/** Ícone de histórico (respostas e leituras) — aparece quando o usuário tem dados armazenados. */
export default function HistoryIcon({ onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="fixed top-[8.5rem] right-3 sm:top-36 sm:right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-moon-grey/80 hover:text-white/50 transition-colors z-50"
      aria-label="Histórico de respostas e leituras"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <Tooltip text="Histórico" groupName="history" align="right">
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
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </Tooltip>
    </motion.button>
  );
}
