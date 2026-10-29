// Generates embeddings for verses that don't have one yet, then builds the vector
// index. Safe to rerun. Usage: node --env-file=.env.local seed/embed.mjs
import postgres from "postgres";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const EXPECTED_PROJECT_REF = "mjkpntrutmudvdmhswdn";
// Must match lib/rag.ts and the vector(512) column in the database.
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 512;
const BATCH_SIZE = 1000;

const url = process.env.BIBLE_DATABASE_URL;
if (!url || !url.includes(EXPECTED_PROJECT_REF)) {
  console.error(`BIBLE_DATABASE_URL must be set and point at project ${EXPECTED_PROJECT_REF}.`);
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set.");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });

try {
  let done = 0;
  for (;;) {
    const verses = await sql`
      select id, text from public.verses
      where embedding is null
      order by id
      limit ${BATCH_SIZE}`;
    if (verses.length === 0) break;

    const { embeddings } = await embedMany({
      model: openai.embedding(EMBEDDING_MODEL),
      values: verses.map((v) => v.text),
      providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
    });

    const rows = verses.map((v, i) => ({ id: v.id, embedding: JSON.stringify(embeddings[i]) }));
    await sql`
      update public.verses v
      set embedding = d.embedding::extensions.vector
      from jsonb_to_recordset(${sql.json(rows)}) as d(id int, embedding text)
      where v.id = d.id`;

    done += verses.length;
    console.log(`Embedded ${done} verses`);
  }

  // Built after the embeddings exist (much faster than indexing row by row); can take a minute.
  await sql.begin(async (tx) => {
    await tx.unsafe("set local statement_timeout = 0");
    await tx.unsafe(`create index if not exists verses_embedding_hnsw_idx
      on public.verses using hnsw (embedding extensions.vector_cosine_ops)`);
  });

  const [{ remaining }] = await sql`select count(*)::int as remaining from public.verses where embedding is null`;
  console.log(`Done. Verses without embeddings: ${remaining}. Vector index ready.`);
} catch (err) {
  console.error("Embedding failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
