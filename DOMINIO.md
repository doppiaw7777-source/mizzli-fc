# Collegare mizzlifc.it a Render

Il dominio **mizzlifc.it** è registrato su **Register.it** e il servizio Render è già pronto.

## Stato attuale

| Elemento | Stato |
|----------|-------|
| App Render | https://mizzli-fc.onrender.com |
| Dominio su Render | `mizzlifc.it` + `www.mizzlifc.it` (in attesa verifica) |
| DNS Register.it | Punta ancora al parking (195.110.124.133) |
| `NEXT_PUBLIC_APP_URL` | `https://mizzlifc.it` |

## Cosa devi fare su Register.it

1. Accedi a [register.it](https://www.register.it) con le credenziali del dominio
2. Vai su **Area Clienti → Domini → mizzlifc.it → Gestione DNS**
3. Apri **Gestione DNS avanzata** (se disponibile)
4. **Elimina** i record esistenti che puntano al parking:
   - Record **A** per `@` → `195.110.124.133`
   - Record **CNAME** per `www` → `mizzlifc.it` (se presente)
5. **Aggiungi** questi record:

| Tipo | Host / Nome | Valore | TTL |
|------|-------------|--------|-----|
| **A** | `@` (o vuoto) | `216.24.57.1` | 3600 |
| **CNAME** | `www` | `mizzli-fc.onrender.com` | 3600 |

> Register.it **non supporta** record ALIAS/ANAME sull'apex: per il dominio radice (`mizzlifc.it`) usa sempre il record **A** con IP `216.24.57.1`.

6. **Non aggiungere** record AAAA (IPv6) — Render usa solo IPv4
7. Salva e attendi la propagazione (di solito 15–60 minuti, fino a 24h)

## Verifica

Dalla root del progetto:

```bash
bash scripts/check-dns.sh
```

Quando lo script segnala tutto OK, su Render:

1. Apri [Dashboard → mizzli-fc → Settings → Custom Domains](https://dashboard.render.com/web/srv-da7n3ihsrm7s739li7r0)
2. Clicca **Verify** accanto a `mizzlifc.it`
3. Render emetterà automaticamente il certificato HTTPS (Let's Encrypt)

## Risultato atteso

- https://mizzlifc.it → app MIZZLI FC
- https://www.mizzlifc.it → reindirizza a https://mizzlifc.it

## Problemi comuni

| Problema | Soluzione |
|----------|-----------|
| "Domain not verified" | Attendi propagazione DNS, poi riprova Verify |
| Sito mostra pagina Register.it | Il record A non è ancora aggiornato |
| Errore SSL | DNS non verificato o record AAAA ancora presente |
| www non funziona | Il CNAME deve puntare a `mizzli-fc.onrender.com`, non a `mizzlifc.it` |
