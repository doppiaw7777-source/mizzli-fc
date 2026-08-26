import { ensureSchema, importJsonFilesIfEmpty } from "../src/lib/db/migrate";
import { isDatabaseEnabled, closePool } from "../src/lib/db/pool";

async function main() {
  if (!isDatabaseEnabled()) {
    console.log("DATABASE_URL assente — modalità file locale (data/*.json)");
    return;
  }

  await ensureSchema();
  const imported = await importJsonFilesIfEmpty();
  console.log(`PostgreSQL pronto${imported ? ` — importati ${imported} file JSON` : ""}`);
  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
