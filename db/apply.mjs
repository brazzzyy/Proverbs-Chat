// Applies a SQL file to the auth database in one transaction.
// Usage: node --env-file=.env.local db/apply.mjs db/rate-limits.sql
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const file = process.argv[2];
const url = process.env.POSTGRES_URL_NON_POOLING;
if (!file || !url) {
  console.error("Usage: node --env-file=.env.local db/apply.mjs <file.sql> (needs POSTGRES_URL_NON_POOLING)");
  process.exit(1);
}

const statements = await readFile(file, "utf8");
const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.begin((tx) => tx.unsafe(statements));
  console.log(`Applied ${file}`);
} catch (err) {
  console.error(`Failed to apply ${file}, rolled back:`, err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
