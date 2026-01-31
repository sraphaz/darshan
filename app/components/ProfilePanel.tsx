"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/lib/userProfile";
import { toBrDate, maskBrDate, fromBrDate, maskBrTime, fromBrTime } from "@/lib/dateFormatBr";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onDeleteAccount: () => void;
};

const inputClass =
  "w-full bg-transparent border-0 border-b border-white/[0.12] rounded-none px-0 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-white/25 transition-colors";

export default function ProfilePanel({ isOpen, onClose, profile, onSave, onDeleteAccount }: Props) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [birthDateBr, setBirthDateBr] = useState("");
  const [birthPlace, setBirthPlace] = useState(profile.birthPlace ?? "");
  const [birthTimeBr, setBirthTimeBr] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFullName(profile.fullName ?? "");
      setBirthDateBr(profile.birthDate ? toBrDate(profile.birthDate) : "");
      setBirthPlace(profile.birthPlace ?? "");
      setBirthTimeBr(profile.birthTime ?? "");
    }
  }, [isOpen, profile.fullName, profile.birthDate, profile.birthPlace, profile.birthTime]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isoDate = birthDateBr ? fromBrDate(birthDateBr) : undefined;
    const time = birthTimeBr ? fromBrTime(birthTimeBr) : undefined;
    onSave({
      fullName: fullName.trim() || undefined,
      birthDate: isoDate || undefined,
      birthPlace: birthPlace.trim() || undefined,
      birthTime: time || undefined,
    });
    onClose();
  }

  function handleClear() {
    setFullName("");
    setBirthDateBr("");
    setBirthPlace("");
    setBirthTimeBr("");
    onSave({});
  }

  async function handleDeleteAccount() {
    if (!confirm("Excluir sua conta? Seus dados locais serão apagados e você precisará entrar novamente.")) return;
    onDeleteAccount();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-deep-night border-l border-white/[0.06] z-50 flex flex-col shadow-2xl"
          >
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/[0.06]">
              <h2 className="text-white/80 font-light text-lg">Dados de Entrada</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-white/45 hover:text-white/60 transition p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex-1 overflow-auto pb-8">
              <p className="text-white/50 text-sm mb-4">
                Dados opcionais para respostas mais precisas (astrologia e numerologia).
              </p>

              <label className="block text-white/45 text-xs mt-4 mb-1">Nome completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder=""
                className={inputClass}
              />

              <label className="block text-white/45 text-xs mt-4 mb-1">Data de nascimento</label>
              <input
                type="text"
                value={birthDateBr}
                onChange={(e) => setBirthDateBr(maskBrDate(e.target.value))}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className={inputClass}
              />

              <label className="block text-white/45 text-xs mt-4 mb-1">Local (cidade, país)</label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder=""
                className={inputClass}
              />

              <label className="block text-white/45 text-xs mt-4 mb-1">Horário de nascimento</label>
              <input
                type="text"
                value={birthTimeBr}
                onChange={(e) => setBirthTimeBr(maskBrTime(e.target.value))}
                placeholder="HH:mm"
                maxLength={5}
                className={inputClass}
              />

              <div className="mt-8 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-md border border-white/[0.08] text-white/50 hover:text-white/65 hover:border-white/[0.12] transition text-sm font-light"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-md bg-white/[0.06] text-white/75 hover:bg-white/[0.09] hover:text-white/90 transition text-sm font-light"
                >
                  Salvar
                </button>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="mt-3 w-full py-2.5 rounded-md border border-white/[0.06] text-white/45 hover:text-white/60 hover:border-white/[0.1] transition text-sm font-light"
              >
                Limpar dados
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="mt-6 w-full py-2.5 rounded-md border border-red-500/15 text-red-400/60 hover:text-red-400/80 hover:border-red-500/25 transition text-sm font-light"
              >
                Excluir conta
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
