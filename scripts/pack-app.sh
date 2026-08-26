#!/usr/bin/env bash
# Builds a downloadable copy of the app without secrets or live user data.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${1:-$ROOT/public/downloads}"
OUT_FILE="$OUT_DIR/MIZZLI-FC-app.zip"
STAGE="$(mktemp -d)"
README="$STAGE/LEGGIMI.txt"

mkdir -p "$OUT_DIR" "$STAGE"

cat > "$README" <<'EOF'
MIZZLI FC — file dell'app

Questo ZIP è il progetto da tenere per il futuro (telefono, computer o chiavetta).

Cosa contiene
- Codice dell'app web
- Progetto iPhone (cartella ios)
- Icone e risorse

Cosa non contiene
- Password, chiavi Google e dati delle persone registrate
- Dipendenze Node (si reinstallano dopo)

Come riaprire l'app più avanti
1. Installa Node.js (versione 20 o successiva)
2. Estrai questo ZIP
3. Apri un terminale nella cartella estratta
4. Esegui: npm install
5. Esegui: npm run build
6. Esegui: npm run start

Per l'icona sul telefono serve che l'app sia online.
Il file iPhone (.mobileconfig) è un collegamento a schermo intero, non un'app dell'App Store.

Per l'App Store serve un Mac, Xcode e un account Apple Developer.
EOF

cd "$ROOT"
rm -f "$OUT_FILE"
zip -rq "$OUT_FILE" . \
  -x "./node_modules/*" \
  -x "./.next/*" \
  -x "./.git/*" \
  -x "./.git" \
  -x "./data/*" \
  -x "./data" \
  -x "./public/uploads/*" \
  -x "./public/uploads" \
  -x "./public/downloads/*" \
  -x "./public/downloads" \
  -x "./ios/App/Pods/*" \
  -x "./ios/App/App/public/*" \
  -x "./.env" \
  -x "./.env.*" \
  -x "./.env.local" \
  -x "./*.pem" \
  -x "./README.md" \
  -x "./APP_STORE.md" \
  -x "./tsconfig.tsbuildinfo" \
  -x "./next-env.d.ts"

(
  cd "$STAGE"
  zip -gq "$OUT_FILE" LEGGIMI.txt
)

rm -rf "$STAGE"
ls -lh "$OUT_FILE"
