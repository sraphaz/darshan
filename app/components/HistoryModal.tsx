"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type RevelationItem = {
  id: string;
  user_id: string;
  question_text: string | null;
  response_text: string;
  created_at: string;
};

type ReadingItem = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type TabId = "respostas" | "leituras";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

type Props = {
  onClose: () => void;
};

export default function HistoryModal({ onClose }: Props) {
  const [tab, setTab] = useState<TabId>("respostas");
  const [revelations, setRevelations] = useState<RevelationItem[]>([]);
  const [readings, setReadings] = useState<ReadingItem[]>([]);
  const [loadingRevelations, setLoadingRevelations] = useState(false);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [expandedRevelationId, setExpandedRevelationId] = useState<string | null>(null);
  const [expandedReadingId, setExpandedReadingId] = useState<string | null>(null);

  const fetchRevelations = useCallback(async () => {
    setLoadingRevelations(true);
    try {
      const res = await fetch("/api/history/revelations", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRevelations(Array.isArray(data.items) ? data.items : []);
      } else {
        setRevelations([]);
      }
    } catch {
      setRevelations([]);
    } finally {
      setLoadingRevelations(false);
    }
  }, []);

  const fetchReadings = useCallback(async () => {
    setLoadingReadings(true);
    try {
      const res = await fetch("/api/history/readings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setReadings(Array.isArray(data.items) ? data.items : []);
      } else {
        setReadings([]);
      }
    } catch {
      setReadings([]);
    } finally {
      setLoadingReadings(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "respostas") fetchRevelations();
    else fetchReadings();
  }, [tab, fetchRevelations, fetchReadings]);

  const tabClass = (t: TabId) =>
    `py-2.5 px-3 text-sm font-light border-b-2 transition ${
      tab === t
        ? "border-white/30 text-white/90"
        : "border-transparent text-white/50 hover:text-white/70"
    }`;

  return (
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
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/[0.06] shrink-0">
          <h2 className="text-white/80 font-light text-lg">Histórico</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/45 hover:text-white/60 transition p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-white/[0.06] shrink-0">
          <button
            type="button"
            onClick={() => setTab("respostas")}
            className={tabClass("respostas")}
          >
            Respostas
          </button>
          <button
            type="button"
            onClick={() => setTab("leituras")}
            className={tabClass("leituras")}
          >
            Leituras
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {tab === "respostas" && (
              <motion.div
                key="respostas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {loadingRevelations && (
                  <p className="text-white/45 text-sm">Carregando...</p>
                )}
                {!loadingRevelations && revelations.length === 0 && (
                  <p className="text-white/45 text-sm">
                    Nenhuma resposta da interação com o orb ainda.
                  </p>
                )}
                {!loadingRevelations &&
                  revelations.map((r) => {
                    const expanded = expandedRevelationId === r.id;
                    return (
                      <div
                        key={r.id}
                        className="rounded-md border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedRevelationId(expanded ? null : r.id)
                          }
                          className="w-full text-left p-3"
                        >
                          <p className="text-white/50 text-xs">
                            {formatDate(r.created_at)}
                          </p>
                          {r.question_text && (
                            <p className="text-white/70 text-sm mt-1 line-clamp-2">
                              {r.question_text}
                            </p>
                          )}
                          <p
                            className={`text-white/80 text-sm mt-1 ${
                              expanded ? "" : "line-clamp-2"
                            }`}
                          >
                            {r.response_text}
                          </p>
                          <span className="text-white/40 text-xs mt-1 inline-block">
                            {expanded ? "Recolher" : "Ver mais"}
                          </span>
                        </button>
                        {expanded && (
                          <div className="px-3 pb-3 pt-0 border-t border-white/[0.06]">
                            {r.question_text && (
                              <p className="text-white/60 text-xs mb-2">
                                <span className="text-white/40">Pergunta: </span>
                                {r.question_text}
                              </p>
                            )}
                            <p className="text-white/80 text-sm whitespace-pre-wrap">
                              {r.response_text}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </motion.div>
            )}

            {tab === "leituras" && (
              <motion.div
                key="leituras"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {loadingReadings && (
                  <p className="text-white/45 text-sm">Carregando...</p>
                )}
                {!loadingReadings && readings.length === 0 && (
                  <p className="text-white/45 text-sm">
                    Nenhuma leitura completa ainda.
                  </p>
                )}
                {!loadingReadings &&
                  readings.map((r) => {
                    const expanded = expandedReadingId === r.id;
                    return (
                      <div
                        key={r.id}
                        className="rounded-md border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReadingId(expanded ? null : r.id)
                          }
                          className="w-full text-left p-3"
                        >
                          <p className="text-white/50 text-xs">
                            {formatDate(r.created_at)}
                          </p>
                          <p
                            className={`text-white/80 text-sm mt-1 ${
                              expanded ? "" : "line-clamp-3"
                            }`}
                          >
                            {r.content}
                          </p>
                          <span className="text-white/40 text-xs mt-1 inline-block">
                            {expanded ? "Recolher" : "Ver mais"}
                          </span>
                        </button>
                        {expanded && (
                          <div className="px-3 pb-3 pt-0 border-t border-white/[0.06]">
                            <p className="text-white/80 text-sm whitespace-pre-wrap">
                              {r.content}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
