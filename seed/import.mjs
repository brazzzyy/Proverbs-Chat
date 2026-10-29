// Loads a Bible translation dump into the Bible database, replacing what's there.
// Reads rows out of the dump rather than executing it, so MySQL- and Postgres-style
// dumps from scrollmapper/bible_databases both work. Owns the whole schema (tables,
// read-only RLS, search function); run seed/embed.mjs afterwards to add embeddings.
// Usage: node --env-file=.env.local seed/import.mjs
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const EXPECTED_PROJECT_REF = "mjkpntrutmudvdmhswdn";
const DUMP_FILE = "BSB.sql";
const url = process.env.BIBLE_DATABASE_URL;

if (!url) {
  console.error("BIBLE_DATABASE_URL is not set (add it to .env.local).");
  process.exit(1);
}
if (!url.includes(EXPECTED_PROJECT_REF)) {
  console.error(`BIBLE_DATABASE_URL does not point at project ${EXPECTED_PROJECT_REF}; refusing to run.`);
  process.exit(1);
}

const BOOK_ROW = /^INSERT INTO [`"]\w+_books[`"] \([`"]name[`"]\) VALUES \('((?:[^']|'')*)'\);$/;
const VERSE_ROW = /^INSERT INTO [`"]\w+_verses[`"] \([^)]*\) VALUES \((\d+), (\d+), (\d+), '((?:[^']|'')*)'\);$/;
const unquote = (s) => s.replaceAll("''", "'");

// "I John" -> "1 John", "Revelation of John" -> "Revelation"
const bookName = (name) =>
  name.replace(/^III /, "3 ").replace(/^II /, "2 ").replace(/^I /, "1 ").replace(/^Revelation of John$/, "Revelation");

const books = [];
const verses = [];
for (const line of (await readFile(new URL(`./${DUMP_FILE}`, import.meta.url), "utf8")).split("\n")) {
  const book = line.match(BOOK_ROW);
  if (book) books.push({ id: books.length + 1, name: bookName(unquote(book[1])) });
  const verse = line.match(VERSE_ROW);
  // some translations leave verses empty where they're absent from the oldest manuscripts
  if (verse && verse[4].trim()) {
    verses.push({ book_id: +verse[1], chapter: +verse[2], verse: +verse[3], text: unquote(verse[4]).trim() });
  }
}
if (books.length !== 66 || verses.length < 30000) {
  console.error(`Unexpected dump contents: ${books.length} books, ${verses.length} verses; refusing to import.`);
  process.exit(1);
}

const SCHEMA = `
  create extension if not exists vector with schema extensions;

  drop function if exists public.match_verses(extensions.vector, integer, double precision);
  drop table if exists public.verses, public.books;

  create table public.books (
    id integer primary key,
    name text not null
  );

  create table public.verses (
    id integer generated always as identity primary key,
    book_id integer not null references public.books (id),
    chapter integer not null,
    verse integer not null,
    text text not null,
    embedding extensions.vector(512),
    unique (book_id, chapter, verse)
  );

  -- Public, read-only: the app reads with the publishable key; only this script writes.
  alter table public.books enable row level security;
  alter table public.verses enable row level security;
  create policy "Public read access" on public.books for select to anon, authenticated using (true);
  create policy "Public read access" on public.verses for select to anon, authenticated using (true);

  -- Cosine similarity search. The inner query orders by distance with a limit so the
  -- HNSW index is used; the threshold is applied after.
  create function public.match_verses(
    query_embedding extensions.vector(512),
    match_count int default 5,
    min_similarity float default 0
  )
  returns table (id int, book text, chapter int, verse int, text text, similarity float)
  language sql
  stable
  set search_path = ''
  as $$
    select m.id, b.name, m.chapter, m.verse, m.text, m.similarity
    from (
      select v.id, v.book_id, v.chapter, v.verse, v.text,
             1 - (v.embedding operator(extensions.<=>) query_embedding) as similarity
      from public.verses v
      where v.embedding is not null
      order by v.embedding operator(extensions.<=>) query_embedding
      limit least(match_count, 50)
    ) m
    join public.books b on b.id = m.book_id
    where m.similarity >= min_similarity
    order by m.similarity desc;
  $$;
`;

const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });

try {
  await sql.begin(async (tx) => {
    await tx.unsafe(SCHEMA);
    await tx`insert into public.books ${tx(books, "id", "name")}`;
    for (let i = 0; i < verses.length; i += 5000) {
      const chunk = verses.slice(i, i + 5000);
      await tx`insert into public.verses ${tx(chunk, "book_id", "chapter", "verse", "text")}`;
    }
  });
  const [counts] = await sql`
    select (select count(*) from public.books)::int as books,
           (select count(*) from public.verses)::int as verses`;
  console.log(`Imported ${DUMP_FILE}:`, counts, "- now run seed/embed.mjs");
} catch (err) {
  console.error("Import failed, transaction rolled back:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
