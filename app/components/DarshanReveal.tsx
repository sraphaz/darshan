"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const REVEAL_DELAY_MS = 900;
const DURATION_MS = 600;

type Props = {
  steps: string[];
  onComplete?: () => void;
};

export default function DarshanReveal({ steps, onComplete }: Props) {
  useEffect(() => {
    if (!onComplete || steps.length === 0) return;
    const lastIndex = steps.length - 1;
    const totalMs = lastIndex * REVEAL_DELAY_MS + DURATION_MS;
    const t = setTimeout(onComplete, totalMs);
    return () => clearTimeout(t);
  }, [steps.length, onComplete]);

  return (
    <ul className="mt-10 space-y-4 text-center max-w-md list-none p-0 m-0">
      {steps.map((line, index) => (
        <motion.li
          key={`${index}-${line.slice(0, 20)}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: DURATION_MS / 1000,
            delay: (index * REVEAL_DELAY_MS) / 1000,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-sm opacity-80 text-[#F5F5F7]"
        >
          {line}
        </motion.li>
      ))}
    </ul>
  );
}
