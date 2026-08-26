#!/usr/bin/env bash
# Verifica che i DNS di mizzlifc.it puntino a Render
set -euo pipefail

RENDER_IP="216.24.57.1"
RENDER_CNAME="mizzli-fc.onrender.com"
DOMAIN="mizzlifc.it"

echo "=== DNS check per $DOMAIN ==="
echo ""

APEX=$(dig +short "$DOMAIN" A | head -1 || true)
WWW=$(dig +short "www.$DOMAIN" CNAME | sed 's/\.$//' | head -1 || true)
AAAA=$(dig +short "$DOMAIN" AAAA | head -1 || true)

ok=true

if [[ "$APEX" == "$RENDER_IP" ]]; then
  echo "✓ $DOMAIN A → $APEX"
else
  echo "✗ $DOMAIN A → ${APEX:-nessuno} (atteso: $RENDER_IP)"
  ok=false
fi

if [[ "$WWW" == "$RENDER_CNAME" ]]; then
  echo "✓ www.$DOMAIN CNAME → $WWW"
else
  echo "✗ www.$DOMAIN CNAME → ${WWW:-nessuno} (atteso: $RENDER_CNAME)"
  ok=false
fi

if [[ -n "$AAAA" ]]; then
  echo "✗ Record AAAA presente su apex ($AAAA) — rimuovilo su Register.it"
  ok=false
else
  echo "✓ Nessun record AAAA sull'apex"
fi

echo ""
if $ok; then
  echo "DNS OK. Verifica su Render:"
  echo "  https://dashboard.render.com/web/srv-da7n3ihsrm7s739li7r0"
  exit 0
else
  echo "DNS non ancora configurato. Vedi DOMINIO.md"
  exit 1
fi
