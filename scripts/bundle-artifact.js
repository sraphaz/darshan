#!/usr/bin/env node
/**
 * Gera o artefato de deploy: copia build/ e arquivos úteis para dist/<nome>-<versão>-<timestamp>
 * e opcionalmente empacota em zip (Windows) ou tar.gz (Unix).
 * Uso: node scripts/bundle-artifact.js [--no-archive]
 * Requer: npm run build já executado (pasta build/ existe).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const noArchive = process.argv.includes("--no-archive");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version || "0.1.0";
const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const artifactName = `darshan-${version}-${timestamp}`;
const distDir = path.join(root, "dist");
const artifactDir = path.join(distDir, artifactName);

if (!fs.existsSync(path.join(root, "build"))) {
  console.error("Pasta build/ não encontrada. Execute: npm run build");
  process.exit(1);
}

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
if (fs.existsSync(artifactDir)) {
  try { fs.rmSync(artifactDir, { recursive: true }); } catch (_) {}
}
fs.mkdirSync(artifactDir, { recursive: true });

copyRecursive(path.join(root, "build"), path.join(artifactDir, "build"));
for (const f of ["package.json", "package-lock.json", ".env.example"]) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(artifactDir, f));
}
fs.writeFileSync(path.join(artifactDir, "VERSION"), `${version}\n${timestamp}\n`);

console.log(`Artefato gerado: ${artifactDir}`);

if (!noArchive) {
  const isWin = process.platform === "win32";
  const archiveName = `${artifactName}.${isWin ? "zip" : "tar.gz"}`;
  const archivePath = path.join(distDir, archiveName);

  try {
    if (isWin) {
      execSync(
        `powershell -NoProfile -Command "Compress-Archive -Path '${artifactDir}\\*' -DestinationPath '${archivePath}' -Force"`,
        { cwd: root, stdio: "inherit" }
      );
    } else {
      execSync(`tar czf "${archivePath}" -C "${distDir}" "${artifactName}"`, { cwd: root, stdio: "inherit" });
    }
    console.log(`Arquivo: ${archivePath}`);
    try { fs.rmSync(artifactDir, { recursive: true }); } catch (_) {}
  } catch (e) {
    console.warn("Empacotamento falhou; pasta do artefato mantida em", artifactDir);
  }
}
