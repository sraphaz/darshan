import { NextResponse } from "next/server";
import fs from "fs";
import { checkAdminAuth } from "@/lib/adminAuth";
import { getAppLogPath, getAuditLogPath } from "@/lib/logPaths";

export const dynamic = "force-dynamic";

const MAX_LINES = 500;
const MAX_FILE_BYTES = 1024 * 512; // 512 KB por arquivo

function readLastLines(filePath: string, maxLines: number): string[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const stat = fs.statSync(filePath);
    const size = Math.min(stat.size, MAX_FILE_BYTES);
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(size);
    const start = Math.max(0, stat.size - size);
    fs.readSync(fd, buffer, 0, size, start);
    fs.closeSync(fd);
    const text = buffer.toString("utf8", 0, size);
    const lines = text.split(/\n/).filter((l) => l.length > 0);
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

/**
 * GET /api/admin/logs?source=app|audit|both&lines=200
 * Header: X-Config-Key ou Authorization: Bearer CONFIG_SECRET ou ?key=CONFIG_SECRET
 * Retorna últimas N linhas de app.log e/ou audit.log.
 */
export async function GET(req: Request) {
  const auth = checkAdminAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(req.url);
  const source = url.searchParams.get("source") ?? "both";
  const linesParam = url.searchParams.get("lines");
  const lines = Math.min(MAX_LINES, Math.max(1, parseInt(linesParam ?? "200", 10) || 200));

  const result: { app: string[]; audit: string[]; error?: string } = {
    app: [],
    audit: [],
  };

  if (source === "app" || source === "both") {
    result.app = readLastLines(getAppLogPath(), lines);
  }
  if (source === "audit" || source === "both") {
    result.audit = readLastLines(getAuditLogPath(), lines);
  }

  return NextResponse.json(result);
}
