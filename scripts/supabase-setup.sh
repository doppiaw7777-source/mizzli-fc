#!/usr/bin/env bash
# Crea bucket Supabase "uploads" pubblico (richiede SUPABASE_ACCESS_TOKEN + project ref)
set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
BUCKET="${SUPABASE_STORAGE_BUCKET:-uploads}"

if [[ -z "$PROJECT_REF" || -z "$TOKEN" ]]; then
  echo "Serve SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN"
  echo "Token: https://supabase.com/dashboard/account/tokens"
  echo "Project ref: Settings → General → Reference ID"
  exit 1
fi

API="https://api.supabase.com/v1/projects/${PROJECT_REF}"

echo "Creazione bucket '${BUCKET}'..."
curl -sf -X POST "${API}/storage/buckets" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"${BUCKET}\",\"name\":\"${BUCKET}\",\"public\":true}" \
  | python3 -m json.tool || echo "(bucket potrebbe esistere già)"

echo ""
echo "Recupero URL progetto..."
curl -sf "${API}" -H "Authorization: Bearer ${TOKEN}" \
  | python3 -c "import sys,json; p=json.load(sys.stdin); print('SUPABASE_URL=https://'+p.get('id','')+'.supabase.co')"

echo ""
echo "Aggiungi SUPABASE_SERVICE_ROLE_KEY da: Project Settings → API → service_role"
