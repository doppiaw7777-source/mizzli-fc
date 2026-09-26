#!/usr/bin/env node
/**
 * Inizializza PostgreSQL (schema + import da data/*.json se il DB è vuoto).
 * Non blocca l'avvio dell'app: se il DB è temporaneamente offline
 * il sito parte comunque (fallback file/storage).
 */
const { spawnSync } = require("node:child_process");

if (!process.env.DATABASE_URL?.trim()) {
  console.log("prestart: DATABASE_URL assente, salto db-init");
  process.exit(0);
}

const result = spawnSync("npx", ["tsx", "scripts/db-init.ts"], {
  stdio: "inherit",
  env: process.env,
});

if (result.status !== 0) {
  console.error(
    "prestart: db-init fallito (status " +
      (result.status ?? "?") +
      "). Avvio comunque l'app."
  );
}
process.exit(0);
