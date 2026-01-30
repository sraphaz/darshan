#!/usr/bin/env node
/**
 * Bump de versão (SemVer) em package.json e opcional tag git.
 * Uso: node scripts/bump-version.js [patch|minor|major] [--tag] [--no-git]
 * Ex.: node scripts/bump-version.js patch --tag
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkgPath = path.join(root, "package.json");

const bump = process.argv[2] || "patch";
const withTag = process.argv.includes("--tag");
const noGit = process.argv.includes("--no-git");

if (!["patch", "minor", "major"].includes(bump)) {
  console.error("Uso: node scripts/bump-version.js [patch|minor|major] [--tag] [--no-git]");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const current = pkg.version || "0.1.0";
const parts = current.split(".").map((n) => parseInt(n, 10) || 0);

if (parts.length < 3) {
  while (parts.length < 3) parts.push(0);
}

switch (bump) {
  case "major":
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
    break;
  case "minor":
    parts[1] += 1;
    parts[2] = 0;
    break;
  case "patch":
  default:
    parts[2] += 1;
    break;
}

const newVersion = parts.join(".");
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log(`Versão atualizada: ${current} → ${newVersion}`);

if (withTag && !noGit) {
  const { execSync } = require("child_process");
  try {
    execSync(`git add package.json && git commit -m "chore: bump version to ${newVersion}"`, {
      cwd: root,
      stdio: "inherit",
    });
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { cwd: root, stdio: "inherit" });
    console.log(`Tag criada: v${newVersion}`);
  } catch (e) {
    console.warn("Aviso: commit/tag não criados (git não disponível ou falha). Faça manualmente se quiser.");
  }
}
