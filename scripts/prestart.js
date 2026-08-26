#!/usr/bin/env node
/**
 * Inizializza PostgreSQL (schema + import da data/*.json se il DB è vuoto).
 * Eseguito automaticamente all'avvio in produzione.
 */
const { spawnSync } = require("node:child_process");

const result = spawnSync("npx", ["tsx", "scripts/db-init.ts"], {
  stdio: "inherit",
  env: process.env,
});

if (result.status !== 0 && process.env.DATABASE_URL) {
  console.error("db-init fallito");
  process.exit(result.status ?? 1);
}
