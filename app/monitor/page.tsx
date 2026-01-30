"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

type LogsResponse = { app: string[]; audit: string[]; error?: string };
type StatusResponse = {
  stripe: boolean;
  supabase: boolean;
  rateLimitPerMinute: number;
  dailyAiLimit: number;
  platformFeePercent: number;
  nodeEnv: string;
};

export default function MonitorPage() {
  const [secretCode, setSecretCode] = useState("");
  const [configKey, setConfigKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"app" | "audit">("app");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const headers = () => ({ "X-Config-Key": configKey });

  const fetchData = useCallback(async () => {
    if (!configKey) return;
    try {
      const [logsRes, statusRes] = await Promise.all([
        fetch(`/api/admin/logs?source=both&lines=300`, { headers: headers() }),
        fetch("/api/admin/status", { headers: headers() }),
      ]);
      if (logsRes.ok) {
        const data = (await logsRes.json()) as LogsResponse;
        setLogs(data);
      }
      if (statusRes.ok) {
        const data = (await statusRes.json()) as StatusResponse;
        setStatus(data);
      }
    } catch {
      setError("Erro ao carregar dados.");
    }
  }, [configKey]);

  const unlock = useCallback(async () => {
    const code = secretCode.trim();
    if (!code) {
      setError("Digite o código secreto.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/config", { headers: { "X-Config-Key": code } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Código inválido.");
        setLoading(false);
        return;
      }
      setConfigKey(code);
      setUnlocked(true);
      const h = () => ({ "X-Config-Key": code });
      const [logsRes, statusRes] = await Promise.all([
        fetch("/api/admin/logs?source=both&lines=300", { headers: h() }),
        fetch("/api/admin/status", { headers: h() }),
      ]);
      if (logsRes.ok) setLogs((await logsRes.json()) as LogsResponse);
      if (statusRes.ok) setStatus((await statusRes.json()) as StatusResponse);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [secretCode]);

  useEffect(() => {
    if (!unlocked || !autoRefresh) return;
    intervalRef.current = setInterval(fetchData, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [unlocked, autoRefresh, fetchData]);

  const filterLines = (lines: string[], level: string): string[] => {
    if (!level) return lines;
    const upper = level.toUpperCase();
    return lines.filter((l) => l.includes(`[${upper}]`) || l.includes(upper));
  };

  const appLines = logs?.app ?? [];
  const auditLines = logs?.audit ?? [];
  const filteredApp = filterLevel ? filterLines(appLines, filterLevel) : appLines;
  const filteredAudit = filterLevel ? filterLines(auditLines, filterLevel) : auditLines;
  const displayApp = tab === "app" ? filteredApp : [];
  const displayAudit = tab === "audit" ? filteredAudit : [];

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#050506] text-[#F5F5F7] p-6 max-w-lg mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-[#B8B8C0] hover:text-[#F5F5F7] text-sm transition-colors">
            ← Voltar
          </Link>
        </div>
        <section className="space-y-4">
          <h1 className="text-lg font-medium tracking-wide text-[#F5F5F7]">
            Monitor — logs e observabilidade
          </h1>
          <p className="text-[#B8B8C0] text-sm">
            Use o mesmo código secreto da página de configuração para acessar.
          </p>
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[#B8B8C0] text-xs mb-1">Código secreto</label>
              <input
                type="password"
                placeholder="Código secreto"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlock()}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[#F5F5F7] placeholder:text-[#B8B8C0] focus:outline-none focus:border-white/20"
              />
            </div>
            <button
              type="button"
              onClick={unlock}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 rounded text-[#F5F5F7] text-sm transition-colors"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </div>
          {error && <p className="text-amber-400/90 text-sm">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050506] text-[#F5F5F7] p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#B8B8C0] hover:text-[#F5F5F7] text-sm transition-colors">
            ← Voltar
          </Link>
          <Link
            href="/config"
            className="text-[#B8B8C0] hover:text-[#F5F5F7] text-sm transition-colors"
          >
            Config
          </Link>
        </div>
        <h1 className="text-lg font-medium tracking-wide text-[#F5F5F7]">
          Monitor — logs e observabilidade
        </h1>
      </div>

      {error && <p className="text-amber-400/90 text-sm mb-4">{error}</p>}

      {status && (
        <section className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h2 className="text-sm font-medium text-[#B8B8C0] mb-2">Status da plataforma</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-[#B8B8C0]">Stripe:</span>{" "}
              <span className={status.stripe ? "text-emerald-400" : "text-amber-400"}>
                {status.stripe ? "ok" : "não configurado"}
              </span>
            </div>
            <div>
              <span className="text-[#B8B8C0]">Supabase:</span>{" "}
              <span className={status.supabase ? "text-emerald-400" : "text-amber-400"}>
                {status.supabase ? "ok" : "não configurado"}
              </span>
            </div>
            <div>
              <span className="text-[#B8B8C0]">Rate limit:</span>{" "}
              <span>{status.rateLimitPerMinute === 0 ? "off" : `${status.rateLimitPerMinute}/min`}</span>
            </div>
            <div>
              <span className="text-[#B8B8C0]">Limite diário IA:</span>{" "}
              <span>{status.dailyAiLimit === 0 ? "off" : status.dailyAiLimit}</span>
            </div>
            <div>
              <span className="text-[#B8B8C0]">Taxa plataforma:</span>{" "}
              <span>{status.platformFeePercent}%</span>
            </div>
            <div>
              <span className="text-[#B8B8C0]">NODE_ENV:</span>{" "}
              <span>{status.nodeEnv}</span>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("app")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              tab === "app" ? "bg-white/15 text-[#F5F5F7]" : "bg-white/5 text-[#B8B8C0] hover:bg-white/10"
            }`}
          >
            App log
          </button>
          <button
            type="button"
            onClick={() => setTab("audit")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              tab === "audit" ? "bg-white/15 text-[#F5F5F7]" : "bg-white/5 text-[#B8B8C0] hover:bg-white/10"
            }`}
          >
            Audit log
          </button>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[#F5F5F7] text-sm focus:outline-none focus:border-white/20"
          >
            <option value="">Todos os níveis</option>
            <option value="error">ERROR</option>
            <option value="warn">WARN</option>
            <option value="info">INFO</option>
            <option value="debug">DEBUG</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-[#B8B8C0]">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/20"
            />
            Atualizar a cada 30s
          </label>
          <button
            type="button"
            onClick={() => fetchData()}
            className="ml-auto px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded text-sm text-[#F5F5F7]"
          >
            Atualizar agora
          </button>
        </div>

        <div className="bg-[#0a0a0b] border border-white/10 rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-[#E0E0E5] whitespace-pre-wrap break-all">
            {tab === "app" &&
              (displayApp.length === 0
                ? (filterLevel ? "Nenhuma linha com esse nível." : "Nenhuma linha em app.log.")
                : displayApp.join("\n"))}
            {tab === "audit" &&
              (displayAudit.length === 0
                ? (filterLevel ? "Nenhuma linha com esse nível." : "Nenhuma linha em audit.log.")
                : displayAudit.join("\n"))}
          </pre>
        </div>
      </section>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setUnlocked(false);
            setConfigKey("");
            setLogs(null);
            setStatus(null);
            setError("");
          }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-[#B8B8C0] text-sm transition-colors"
        >
          Sair
        </button>
      </div>
    </main>
  );
}
