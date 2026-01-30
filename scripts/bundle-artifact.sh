#!/usr/bin/env bash
# Gera o artefato de deploy: build Next.js + empacota em tar.gz
# Uso: ./scripts/bundle-artifact.sh [--version 1.2.3]
# Saída: dist/darshan-<version>-<timestamp>.tar.gz

set -e
cd "$(dirname "$0")/.."

VERSION="0.0.0"
for i in "$@"; do
  if [ "$i" = "--version" ] && [ -n "${2:-}" ]; then
    VERSION="$2"
    break
  fi
done

if [ "$VERSION" = "0.0.0" ]; then
  if command -v node >/dev/null 2>&1; then
    VERSION=$(node -e "console.log(require('./package.json').version)")
  else
    VERSION="0.1.0"
  fi
fi

TIMESTAMP=$(date +%Y%m%d-%H%M)
ARTIFACT_NAME="darshan-${VERSION}-${TIMESTAMP}"
DIST_DIR="dist"
TARBALL="${ARTIFACT_NAME}.tar.gz"

echo "Versão: $VERSION | Artefato: $TARBALL"

npm run build

mkdir -p "$DIST_DIR" "$DIST_DIR/$ARTIFACT_NAME"
cp -r build "$DIST_DIR/$ARTIFACT_NAME/"
[ -f package.json ] && cp package.json "$DIST_DIR/$ARTIFACT_NAME/"
[ -f package-lock.json ] && cp package-lock.json "$DIST_DIR/$ARTIFACT_NAME/"
[ -f .env.example ] && cp .env.example "$DIST_DIR/$ARTIFACT_NAME/"
echo -e "${VERSION}\n${TIMESTAMP}" > "$DIST_DIR/$ARTIFACT_NAME/VERSION"

(cd "$DIST_DIR" && tar czf "$TARBALL" "$ARTIFACT_NAME" && rm -rf "$ARTIFACT_NAME")

echo "Artefato gerado: $DIST_DIR/$TARBALL"
