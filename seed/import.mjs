// Imports seed/KJV.sql into the Bible database in a single transaction.
// Usage: node --env-file=.env.local seed/import.mjs
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const EXPECTED_PROJECT_REF = "mjkpntrutmudvdmhswdn";
const url = process.env.BIBLE_DATABASE_URL;

if (!url) {
  console.error("BIBLE_DATABASE_URL is not set (add it to .env.local).");
  process.exit(1);
}
if (!url.includes(EXPECTED_PROJECT_REF)) {
  console.error(`BIBLE_DATABASE_URL does not point at project ${EXPECTED_PROJECT_REF}; refusing to run.`);
  process.exit(1);
}

// The dump drops and recreates its tables, so RLS, policies and indexes must be
// reapplied in the same transaction or a rerun leaves the tables writable.
const HARDEN = `
  alter table public."translations" enable row level security;
  alter table public."KJV_books" enable row level security;
  alter table public."KJV_verses" enable row level security;

  create policy "Public read access" on public."translations" for select to anon, authenticated using (true);
  create policy "Public read access" on public."KJV_books" for select to anon, authenticated using (true);
  create policy "Public read access" on public."KJV_verses" for select to anon, authenticated using (true);

  create unique index "KJV_verses_book_chapter_verse_idx" on public."KJV_verses" ("book_id", "chapter", "verse");

  -- Embeddings are lost on reimport; regenerate with seed/embed.mjs.
  alter table public."KJV_verses" add column embedding extensions.vector(512);
  create index "KJV_verses_embedding_hnsw_idx" on public."KJV_verses" using hnsw (embedding extensions.vector_cosine_ops);
`;

const dump = await readFile(new URL("./KJV.sql", import.meta.url), "utf8");
const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });

try {
  await sql.begin(async (tx) => {
    await tx.unsafe(dump);
    await tx.unsafe(HARDEN);
  });
  const [counts] = await sql`
    select
      (select count(*) from "translations")::int as translations,
      (select count(*) from "KJV_books")::int as books,
      (select count(*) from "KJV_verses")::int as verses`;
  console.log("Import complete:", counts);
} catch (err) {
  console.error("Import failed, transaction rolled back:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
