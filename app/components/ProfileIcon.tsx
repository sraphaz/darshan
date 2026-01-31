"use client";

import { motion } from "framer-motion";
import Tooltip from "./Tooltip";
import IconPlus from "./IconPlus";

type Props = {
  onClick: () => void;
  hasData?: boolean;
};

export default function ProfileIcon({ onClick, hasData }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="fixed top-14 right-3 sm:top-16 sm:right-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-moon-grey/80 hover:text-white/50 transition-colors z-50"
      aria-label="Dados (nome, data, local para respostas mais precisas)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      {hasData ? (
        <Tooltip text="Dados" groupName="profile" align="right">
          <span className="text-base">◇</span>
        </Tooltip>
      ) : (
        <Tooltip text="Dados" groupName="profile" align="right">
          <IconPlus className="w-6 h-6 min-w-6 min-h-6 text-current" />
        </Tooltip>
      )}
    </motion.button>
  );
}
