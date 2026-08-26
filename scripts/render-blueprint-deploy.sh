#!/usr/bin/env bash
# Crea il Blueprint Render da GitHub (richiede RENDER_API_KEY)
set -euo pipefail

if [[ -z "${RENDER_API_KEY:-}" ]]; then
  echo "RENDER_API_KEY mancante. Crea su: https://dashboard.render.com/u/settings#api-keys"
  exit 1
fi

REPO="${RENDER_REPO:-https://github.com/doppiaw7777-source/mizzli-fc}"
BRANCH="${RENDER_BRANCH:-main}"
NAME="${RENDER_BLUEPRINT_NAME:-mizzli-fc-stack}"

echo "Validazione render.yaml..."
curl -sf -X POST "https://api.render.com/v1/blueprints/validate" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"repo\":\"${REPO}\",\"branch\":\"${BRANCH}\",\"path\":\"render.yaml\"}" \
  | python3 -m json.tool

echo ""
echo "Creazione Blueprint..."
curl -sf -X POST "https://api.render.com/v1/blueprints" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${NAME}\",
    \"repo\": \"${REPO}\",
    \"branch\": \"${BRANCH}\",
    \"autoSync\": true
  }" | python3 -m json.tool

echo ""
echo "Blueprint avviato. Controlla: https://dashboard.render.com/blueprints"
