"use client";

import { motion } from "framer-motion";

type Props = {
  isRevealing?: boolean;
  onClick?: () => void;
  clickable?: boolean;
};

export default function CrystalOrb({ isRevealing = false, onClick, clickable = false }: Props) {
  const Wrapper = clickable ? "button" : "div";
  return (
    <motion.div
      className={`flex justify-center items-center mt-8 sm:mt-14 ${isRevealing ? "mb-4 sm:mb-6" : "mb-8 sm:mb-14"}`}
      initial={false}
      animate={{
        y: isRevealing ? -20 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Wrapper
        type={clickable ? "button" : undefined}
        onClick={clickable ? onClick : undefined}
        className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white/[0.11] backdrop-blur-xl border border-white/15 shadow-[0_0_72px_rgba(255,255,255,0.11)] animate-[pulse_4s_ease-in-out_infinite] p-0 ${clickable ? "cursor-pointer transition-colors focus:outline-none" : ""}`}
        aria-hidden={!clickable}
        aria-label={clickable ? "Receber luz ou nova pergunta" : undefined}
      />
    </motion.div>
  );
}
