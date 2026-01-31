"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FADE_DURATION_MS = 600;
const FADE_DURATION_S = FADE_DURATION_MS / 1000;
const MAX_STEPS = 7;

type Props = {
  message: string;
  onComplete?: () => void;
};

function splitIntoSteps(message: string): string[] {
  const trimmed = message.trim();
  if (!trimmed) return [];
  const raw = trimmed.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const steps = raw.length > 0 ? raw : [trimmed];
  if (steps.length <= MAX_STEPS) return steps;
  return [
    ...steps.slice(0, MAX_STEPS - 1),
    steps.slice(MAX_STEPS - 1).join("\n\n"),
  ];
}

export default function DarshanMessage({ message, onComplete }: Props) {
  const steps = splitIntoSteps(message);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const isLast = currentIndex >= steps.length - 1;

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => {
      onCompleteRef.current?.();
    }, FADE_DURATION_MS);
    return () => clearTimeout(t);
  }, [exiting]);

  function handleClick() {
    if (isLast) {
      setExiting(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (steps.length === 0) {
    onComplete?.();
    return null;
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg min-h-[140px] sm:min-h-[200px] px-3 sm:px-4 -mt-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          role="button"
          tabIndex={0}
          onClick={exiting ? undefined : handleClick}
          onKeyDown={(e) => !exiting && e.key === "Enter" && handleClick()}
          initial={{ opacity: 0, y: 12 }}
          animate={exiting ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: FADE_DURATION_S, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center w-full cursor-pointer rounded-2xl px-4 sm:px-6 py-5 sm:py-8 focus:outline-none"
          aria-label={exiting ? undefined : isLast ? "Toque para voltar" : "Toque para a próxima"}
        >
          <p className="text-mist text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-light">
            {steps[currentIndex]}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
