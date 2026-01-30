"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CrystalOrb from "./components/CrystalOrb";
import DarshanMessage from "./components/DarshanMessage";
import TimeHeader, { TimeHeaderSunrise, TimeHeaderSunsetMoon } from "./components/TimeHeader";
import ProfileIcon from "./components/ProfileIcon";
import PersonalMapIcon from "./components/PersonalMapIcon";
import ProfilePanel from "./components/ProfilePanel";
import LoginModal from "./components/LoginModal";
import SupportModal from "./components/SupportModal";
import CreditsModal from "./components/CreditsModal";
import PersonalMapModal from "./components/PersonalMapModal";
import Tooltip from "./components/Tooltip";
import { getTimePulse } from "../lib/timepulse";
import {
  loadUserProfile,
  saveUserProfile,
  clearUserProfile,
  hasProfileData,
  type UserProfile,
} from "../lib/userProfile";
import { CREDITS_PER_AI_REQUEST, CREDITS_PER_PERSONAL_MAP } from "../lib/credits";

type RevelationTurn = {
  userMessage?: string;
  darshanMessage: string;
};

const FALLBACK_MESSAGE = "O tempo pede pausa. Respire e tente novamente quando se sentir pronto.";
const MOCK_STORAGE_KEY = "darshan_mock_mode";

function loadMockMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MOCK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveMockMode(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

function Home() {
  const [history, setHistory] = useState<RevelationTurn[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [profileOpen, setProfileOpen] = useState(false);
  const [inputRevealed, setInputRevealed] = useState(false);
  const [revelationComplete, setRevelationComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const [session, setSession] = useState<{ email: string } | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [personalMapOpen, setPersonalMapOpen] = useState(false);
  const [creditsPerRevelation, setCreditsPerRevelation] = useState(CREDITS_PER_AI_REQUEST);
  const [creditsPerReading, setCreditsPerReading] = useState(CREDITS_PER_PERSONAL_MAP);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "google_not_configured") {
      setAuthError("Login com Google não está configurado. Use o código por e-mail.");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (error) {
      setAuthError("Algo deu errado ao entrar. Tente novamente ou use o código por e-mail.");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    const provider = searchParams.get("provider");
    const paymentId = searchParams.get("payment_id");
    if (checkout !== "success") return;

    let cancelled = false;
    if (provider === "mercadopago" && paymentId) {
      (async () => {
        try {
          const res = await fetch("/api/checkout/fulfill-mercadopago", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ payment_id: paymentId }),
          });
          const data = await res.json();
          if (!cancelled && res.ok && typeof data.balance === "number") {
            setCredits(data.balance);
          }
        } catch {
          // ignore
        } finally {
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", window.location.pathname);
          }
        }
      })();
      return () => { cancelled = true; };
    }

    if (sessionId) {
      (async () => {
        try {
          const res = await fetch("/api/checkout/fulfill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (!cancelled && res.ok && typeof data.balance === "number") {
            setCredits(data.balance);
          }
        } catch {
          // ignore
        } finally {
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", window.location.pathname);
          }
        }
      })();
      return () => { cancelled = true; };
    }
  }, [searchParams]);
  useEffect(() => {
    function updateTime() {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    }
    updateTime();
    const id = setInterval(updateTime, 60_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => setMockMode(loadMockMode()), []);
  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 2800);
    return () => clearTimeout(t);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = await res.json();
      setSession(data.session ?? null);
    } catch {
      setSession(null);
    }
  }, []);

  const refreshCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/credits", { credentials: "include" });
      const data = await res.json();
      setCredits(typeof data.balance === "number" ? data.balance : 0);
    } catch {
      setCredits(0);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/credits/cost", { credentials: "include" });
        const data = await res.json();
        if (!cancelled && res.ok) {
          if (typeof data.creditsPerRevelation === "number") setCreditsPerRevelation(data.creditsPerRevelation);
          if (typeof data.creditsPerReading === "number") setCreditsPerReading(data.creditsPerReading);
        }
      } catch {
        // keep defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDevDecreaseCredits = useCallback(async (e: React.MouseEvent) => {
    if (process.env.NODE_ENV !== "development") return;
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/credits/dev-decrease", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok && typeof data.balance === "number") setCredits(data.balance);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshSession().then(() => refreshCredits());
  }, [refreshSession, refreshCredits]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/darshan/check")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAiReady(data.ok === true);
      })
      .catch(() => {
        if (!cancelled) setAiReady(false);
      });
    return () => { cancelled = true; };
  }, []);

  const pulse = getTimePulse();
  const isStart = history.length === 0;
  const hasCreditsForAi = credits >= creditsPerRevelation;
  const canUseAi = aiReady === true && session !== null && hasCreditsForAi;
  const canInteract = canUseAi || mockMode;
  const isRevealing = canInteract && currentMessage !== null && !revelationComplete;

  useEffect(() => {
    if (credits < creditsPerRevelation && !mockMode) {
      setMockMode(true);
      saveMockMode(true);
    }
  }, [credits, mockMode]);

  function toggleMockMode() {
    setMockMode((prev) => {
      if (!prev) {
        saveMockMode(true);
        return true;
      }
      if (!session || !hasCreditsForAi) {
        return true;
      }
      saveMockMode(false);
      return false;
    });
  }

  const handleSaveProfile = useCallback((next: UserProfile) => {
    setProfile(next);
    saveUserProfile(next);
  }, []);

  async function requestRevelation(userMessage: string, currentHistory: RevelationTurn[]) {
    setLoading(true);
    setCurrentMessage(null);
    setRevelationComplete(false);
    try {
      const res = await fetch("/api/darshan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          revelation: true,
          mock: mockMode,
          userMessage: userMessage || undefined,
          userProfile: hasProfileData(profile) ? profile : undefined,
          history: currentHistory,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setLoginOpen(true);
        setCurrentMessage(null);
        return;
      }
      if (res.status === 402) {
        setCurrentMessage("Créditos insuficientes. Adicione créditos para usar a IA.");
        setRevelationComplete(true);
        return;
      }
      const message = typeof data.message === "string" ? data.message : "";
      setCurrentMessage(message || FALLBACK_MESSAGE);
      setHistory((prev) => [
        ...prev,
        { userMessage: userMessage || undefined, darshanMessage: message || FALLBACK_MESSAGE },
      ]);
      setUserInput("");
      if (typeof data.balance === "number") setCredits(data.balance);
    } catch {
      setCurrentMessage(FALLBACK_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  function handleReceberLuz() {
    if (!mockMode && !session) {
      setLoginOpen(true);
      return;
    }
    if (!mockMode && !hasCreditsForAi) {
      setCurrentMessage("Créditos insuficientes. Adicione créditos para usar a IA.");
      setRevelationComplete(true);
      return;
    }
    requestRevelation(userInput, []);
  }

  const handleRevelationComplete = useCallback(() => {
    setRevelationComplete(true);
  }, []);

  function handleNovaPergunta() {
    const input = userInput.trim();
    setUserInput("");
    setRevelationComplete(false);
    setCurrentMessage(null);
    if (!mockMode && !session) {
      setLoginOpen(true);
      return;
    }
    if (!mockMode && !hasCreditsForAi) {
      setCurrentMessage("Créditos insuficientes. Adicione créditos para usar a IA.");
      setRevelationComplete(true);
      return;
    }
    requestRevelation(input, history);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setSession(null);
    setCredits(0);
  }

  async function handleDeleteAccount() {
    await handleLogout();
    clearUserProfile();
    setProfile({});
  }

  function handleAddCredits() {
    if (!session) {
      setLoginOpen(true);
      return;
    }
    setCreditsModalOpen(true);
  }

  function openProfileOrLogin() {
    if (session) setProfileOpen(true);
    else setLoginOpen(true);
  }

  const showInputArea = canInteract && !loading && (isStart || inputRevealed || revelationComplete);
  const showReceberLuz = canInteract && isStart && !loading;
  const showNovaPergunta = canInteract && !loading && revelationComplete && currentMessage !== null;
  const showChecking = aiReady === null && !mockMode;
  const showConfigError = aiReady === false && !mockMode;

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-void text-mist px-6 pt-8 pb-10 relative">
      <AnimatePresence mode="wait">
        {!introDone ? (
          <motion.div
            key="intro"
            className="fixed inset-0 flex items-center justify-center z-20 bg-void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-[36px] font-light tracking-[0.35em] text-mist">
              DARSHAN
            </h1>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {authError && (
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md z-50 px-4 py-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-200 text-sm text-center flex items-center gap-2 shadow-lg">
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-amber-300 hover:text-amber-200/80 p-2 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}
      {introDone && (
        <>
          <header className="fixed top-0 left-0 right-0 z-40 grid grid-cols-3 items-start gap-2 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col items-start gap-1 min-w-0">
              <div className="flex items-center gap-4">
                {session && (
                  <div
                    className="flex items-center gap-1.5 group/credits"
                    onContextMenu={handleDevDecreaseCredits}
                  >
                    <Tooltip text="Adicionar créditos" groupName="credits">
                      <button
                        type="button"
                        onClick={handleAddCredits}
                        className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white/55 transition border-0 bg-transparent outline-none focus:outline-none"
                        aria-label="Adicionar créditos"
                      >
                        + Créditos
                      </button>
                    </Tooltip>
                    <Tooltip
                      text={
                        process.env.NODE_ENV === "development"
                          ? "Saldo de créditos. Modo dev: clique direito aqui para diminuir (1 revelação)."
                          : "Saldo de créditos para IA"
                      }
                      groupName="saldo"
                    >
                      <span className="text-white/40 text-xs">{credits}</span>
                    </Tooltip>
                  </div>
                )}
                <TimeHeaderSunrise sunrise={pulse.sunrise} />
              </div>
              <Tooltip
                text={mockMode ? "Clique para usar IA" : "Clique para modo mock"}
                groupName="mock"
              >
                <button
                  type="button"
                  onClick={toggleMockMode}
                  className={`mt-2 text-[10px] uppercase tracking-widest transition focus:outline-none text-left rounded px-1.5 py-0.5 ${
                    mockMode
                      ? "text-white/40 hover:text-white/50"
                      : "text-white/55 ring-1 ring-white/25 hover:text-white/60"
                  }`}
                  aria-label={mockMode ? "AI desligada. Clique para ligar IA." : "AI ligada. Clique para modo mock."}
                >
                  {mockMode ? "AI desligada" : "AI ligada"}
                </button>
              </Tooltip>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 pointer-events-none min-w-0">
              <p className="text-white/50 text-sm tracking-wide">Luz do Tempo</p>
              {currentTime ? (
                <p className="text-white/40 text-xs tabular-nums">{currentTime}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1 min-w-0">
              <TimeHeaderSunsetMoon sunset={pulse.sunset} moonPhase={pulse.moonPhase} />
            </div>
          </header>
          <Tooltip
            text="Suporte e dúvidas"
            groupName="support"
            align="right"
            wrapperClassName="fixed bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="w-full h-full rounded-full border border-white/20 text-white/50 hover:text-white/55 transition flex items-center justify-center text-base font-light touch-manipulation"
              aria-label="Suporte e dúvidas"
            >
              ?
            </button>
          </Tooltip>
          <AnimatePresence mode="wait">
            {!isRevealing && (
              <ProfileIcon
                key="profile"
                onClick={openProfileOrLogin}
                hasData={mounted && session !== null ? hasProfileData(profile) : false}
              />
            )}
            {!isRevealing && mounted && session !== null && hasProfileData(profile) && aiReady === true && (
              <PersonalMapIcon key="personalMap" onClick={() => setPersonalMapOpen(true)} />
            )}
          </AnimatePresence>
          <ProfilePanel
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            profile={profile}
            onSave={handleSaveProfile}
            onDeleteAccount={handleDeleteAccount}
          />
          <LoginModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
            onSuccess={() => {
              refreshSession();
              refreshCredits();
            }}
          />
          <SupportModal
            isOpen={supportOpen}
            onClose={() => setSupportOpen(false)}
            creditsPerRevelation={creditsPerRevelation}
          />
          <CreditsModal
            isOpen={creditsModalOpen}
            onClose={() => setCreditsModalOpen(false)}
            onPurchased={(newBalance) => setCredits(newBalance)}
            creditsPerRevelation={creditsPerRevelation}
            creditsPerReading={creditsPerReading}
          />
          <PersonalMapModal
            isOpen={personalMapOpen}
            onClose={() => setPersonalMapOpen(false)}
            profile={profile}
            credits={credits}
            creditsPerReading={creditsPerReading}
            offlineMode={mockMode}
            onBalanceUpdate={(newBalance) => setCredits(newBalance)}
            onOpenCredits={() => { setPersonalMapOpen(false); setCreditsModalOpen(true); }}
          />
        </>
      )}

      <motion.div
        className={`flex flex-col items-center w-full px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-10 min-h-screen ${isRevealing ? "max-w-2xl flex-1 justify-center" : "max-w-md"}`}
        initial={false}
        animate={{ opacity: introDone ? 1 : 0, pointerEvents: introDone ? "auto" : "none" }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {introDone && (
          <CrystalOrb
            isRevealing={isRevealing}
            clickable={showReceberLuz || showNovaPergunta}
            onClick={() => {
              if (showNovaPergunta) handleNovaPergunta();
              else if (showReceberLuz) handleReceberLuz();
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {showChecking && (
            <motion.p
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-white/60 text-sm"
            >
              Verificando conexão com IA...
            </motion.p>
          )}

          {showConfigError && (
            <motion.div
              key="config-error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 max-w-md text-center"
            >
              <p className="text-moon-grey/90 text-sm mb-2">
                Conexão com IA indisponível.
              </p>
              <p className="text-moon-grey/60 text-xs">
                Configure uma chave em <code className="bg-white/5 px-1 rounded">.env.local</code>: OPENAI_API_KEY, GOOGLE_AI_API_KEY ou ANTHROPIC_API_KEY. Uso gratuito: Gemini em aistudio.google.com/apikey
              </p>
            </motion.div>
          )}

          {!session && !mockMode && aiReady === true && (
            <motion.p
              key="login-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-white/50 text-xs"
            >
              Entre para usar a IA. Modo offline disponível sem login.
            </motion.p>
          )}

          {canInteract && loading && (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-white/60 text-sm"
            >
              Aguarde...
            </motion.p>
          )}

          {isRevealing && (
            <DarshanMessage
              key={history.length}
              message={currentMessage!}
              onComplete={handleRevelationComplete}
            />
          )}

          {showInputArea && !isRevealing && (
            <motion.div
              key="input-area"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full mt-20 pt-2"
            >
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setInputRevealed(true)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  if (showNovaPergunta) handleNovaPergunta();
                  else if (showReceberLuz) handleReceberLuz();
                }}
                placeholder=""
                className="w-full bg-transparent border-0 border-b border-white/25 rounded-none px-0 py-2.5 text-sm text-mist placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-void text-mist" />}>
      <Home />
    </Suspense>
  );
}
