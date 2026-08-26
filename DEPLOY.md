# Deploy MIZZLI FC — Cursor → GitHub → Render

Architettura target:

```
Cursor (sviluppo) → push → GitHub (main) → auto-deploy → Render (24/7)
                                                              │
                                    ┌─────────────────────────┴─────────────────────────┐
                                    ▼                                                   ▼
                            PostgreSQL (Render)                              Storage foto (Supabase)
                                    ▲
                                    │ DNS
                              miodominio.it
```

## 1. GitHub — codice master

1. Crea un repo vuoto su GitHub, es. `mizzli-fc`
2. Collega il remote e pusha:

```bash
git remote add origin https://github.com/TUO-USERNAME/mizzli-fc.git
git push -u origin cursor/render-production-be10:main
```

> Dopo il primo push, Render farà deploy automatico ad ogni push su `main`.

## 2. Render — server 24/7

### Opzione A: Blueprint (consigliata)

1. Vai su [render.com/dashboard](https://dashboard.render.com)
2. **New → Blueprint**
3. Collega il repo GitHub `mizzli-fc`
4. Render legge `render.yaml` e crea:
   - **Web Service** `mizzli-fc` (Node.js, Next.js)
   - **PostgreSQL** `mizzli-db` (piano free per test)

### Opzione B: Manuale

| Campo | Valore |
|-------|--------|
| Runtime | Node |
| Build | `npm ci && npm run build` |
| Start | `npm run start:prod` |
| Health check | `/api/health` |

Aggiungi un **PostgreSQL** dal dashboard Render e incolla `DATABASE_URL` nelle env vars del web service.

### Variabili ambiente (Render dashboard)

| Variabile | Obbligatoria | Note |
|-----------|--------------|------|
| `DATABASE_URL` | Sì | Auto da Render Postgres |
| `JWT_SECRET` | Sì | Stringa lunga casuale |
| `NEXT_PUBLIC_APP_URL` | Sì | `https://miodominio.it` |
| `SUPABASE_URL` | Per foto | Da Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Per foto | **Solo server**, mai nel client |
| `SUPABASE_STORAGE_BUCKET` | Per foto | Default: `uploads` |

Verifica: `https://TUO-SERVIZIO.onrender.com/api/health` deve rispondere:

```json
{ "ok": true, "database": "connected", "storage": "supabase" }
```

## 3. PostgreSQL — database persistente

L'app usa una tabella `app_kv` (chiave → JSON) compatibile con i vecchi file `data/*.json`.

- **Primo avvio**: se `data/*.json` esistono nel deploy, vengono importati automaticamente
- **Senza DATABASE_URL**: fallback locale su file (solo dev)

Schema: `src/lib/db/schema.sql`

## 4. Storage foto — Supabase

1. Crea progetto su [supabase.com](https://supabase.com)
2. **Storage → New bucket → `uploads` → Public**
3. Copia URL e **service role key** (Settings → API)
4. Aggiungi le env su Render

Alternativa S3/R2: imposta `S3_*` in `.env.example`.

> **Importante**: su Render il filesystem è effimero. Le foto in `public/uploads/` si perdono al redeploy. Usa sempre Supabase o S3 in produzione.

## 5. Dominio custom — mizzlifc.it

**Guida completa:** vedi [`DOMINIO.md`](./DOMINIO.md)

Su Render i domini `mizzlifc.it` e `www.mizzlifc.it` sono già aggiunti.
`NEXT_PUBLIC_APP_URL=https://mizzlifc.it` è già impostato.

### DNS su Register.it

| Tipo | Host | Valore |
|------|------|--------|
| **A** | `@` | `216.24.57.1` |
| **CNAME** | `www` | `mizzli-fc.onrender.com` |

Verifica: `bash scripts/check-dns.sh` — poi **Verify** nel dashboard Render.

Se usi **Cloudflare** (invece di Register.it DNS):
- CNAME `@` e `www` → `mizzli-fc.onrender.com`
- SSL/TLS → **Full**

## 6. Flusso di lavoro quotidiano

```
1. Lavori in Cursor (Cloud Agent o locale)
2. git commit + git push su main
3. Render rebuilda e redeploya (~3-5 min)
4. Dati in PostgreSQL + foto in Supabase restano persistenti
```

## 7. Costi indicativi

| Servizio | Piano test | Produzione |
|----------|------------|------------|
| Render Web | Starter ~$7/mo | Standard |
| Render Postgres | Free (90 giorni) | Starter ~$7/mo |
| Supabase | Free tier | Pro se serve |
| Dominio | — | ~€10-15/anno |

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `database: error` in /api/health | Verifica `DATABASE_URL`, SSL, schema |
| Foto spariscono | Configura Supabase Storage |
| OAuth Google fallisce | Aggiungi redirect URI con dominio Render/custom |
| App lenta al cold start | Piano Render free/starter va in sleep — usa Starter+ |
