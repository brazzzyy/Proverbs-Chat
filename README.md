## Project Overview

Proverbs Chat is a Christian AI chatbot built with Next.js and OpenAI. It gives warm, conversational, biblically grounded answers to questions about Christianity, faith and life, and backs them with real Bible verses retrieved from a vector database of the Berean Standard Bible (BSB).

## See The Project

Visit: https://proverbs-chat.vercel.app/ to see the project in action!

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API routes, TypeScript, Vercel AI SDK
- **Databases**: two Supabase (Postgres) projects: one for accounts, one for the Bible with pgvector
- **AI**: OpenAI `gpt-6-luna` (chat), `gpt-5.4-nano` (search planning), `text-embedding-3-small` (embeddings)

## How It Works

### Verse retrieval (RAG)

Every verse of the BSB (31,086 verses) is stored in Postgres with a 512-dimension embedding and an HNSW index for fast similarity search. When someone sends a message, `lib/rag.ts`:

1. **Skips small talk instantly.** Greetings, thanks, "ok" and emoji-only messages never trigger a search.
2. **Plans the search.** A small model reads the message plus the last few chat turns and decides whether Scripture speaks to it. Off-topic requests like coding or trivia get no verses. Short follow-ups like "yes" or "what about my brother?" are understood from context.
3. **Searches by meaning.** For relevant messages, the model writes what Scripture would say to the person, and that text is embedded and matched against the verses. Searching with an answer-shaped sentence finds better verses than searching with the question itself.
4. **Grounds the reply.** The top matches, such as *"Be anxious for nothing…" (Philippians 4:6, BSB)*, are added to the chat model's prompt, and the model is told to quote only those verses word for word.

If any step fails, the chat still answers, just without verses.

### Chat

The chat streams replies and adapts their length: a line or two for light messages, a few short paragraphs for heavier ones. It redirects off-topic requests kindly and gives crisis resources (988 in the US) when someone mentions self-harm or danger. Only the last 20 messages are sent to the model, which keeps the cost of long conversations down.

### Accounts and security

- Email and password accounts with bcrypt-hashed passwords and signed session cookies (24-hour JWTs).
- Middleware protects the chat page and `/api/chat`.
- Logging out revokes the session server-side, so a copied cookie stops working immediately.
- Rate limits, shared across all serverless instances through Postgres:

  | Action | Limit |
  |---|---|
  | Chat | 10 messages per minute and 200 per day, per account |
  | Sign-in | 10 attempts per 15 minutes, per IP address |
  | Sign-up | 5 accounts per hour, per IP address |
- Row-level security on every table. The Bible tables are public read-only; account tables are only reachable with the server-side service-role key.

## Running Locally

Requires Node 20.6+ (for `--env-file`) and pnpm 12.

```bash
pnpm install
pnpm dev
```

Create a `.env.local` with:

| Variable | Used for |
|---|---|
| `OPENAI_API_KEY` | Chat, search planning and embeddings |
| `JWT_SECRET` | Signing session cookies (the app won't start without it) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Accounts database (server-side only) |
| `BIBLE_SUPABASE_URL`, `BIBLE_SUPABASE_PUBLISHABLE_KEY` | Reading verses from the Bible database |
| `BIBLE_DATABASE_URL` | Seed scripts only (Bible database connection string) |
| `POSTGRES_URL_NON_POOLING` | `db/apply.mjs` only (accounts database connection string) |

`BIBLE_DATABASE_URL` and `POSTGRES_URL_NON_POOLING` are only needed on your machine for setup. Don't add them to Vercel.

### Setting up the databases

**Bible database:** load the translation, then embed it. Embedding costs about $0.02 in OpenAI usage.

```bash
node --env-file=.env.local seed/import.mjs   # creates books/verses tables, RLS and the match_verses search function
node --env-file=.env.local seed/embed.mjs    # embeds every verse and builds the vector index
```

To switch translations, drop a dump from [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) into `seed/` (MySQL or Postgres format), update `DUMP_FILE` in `seed/import.mjs` and `TRANSLATION` in `lib/rag.ts`, and rerun both scripts.

**Accounts database:** it expects a `users` table (`id`, `email` unique, `password_hash`, `created_at`). Then apply the rate-limit and session tables:

```bash
node --env-file=.env.local db/apply.mjs db/rate-limits.sql
node --env-file=.env.local db/apply.mjs db/revoked-sessions.sql
```

## Project Structure

```
app/api/chat       Chat endpoint: rate limits, verse retrieval, streaming reply
app/api/login|signup|logout   Account endpoints
app/ui             Chat, sign-in and sidebar components
lib/rag.ts         Verse retrieval (small-talk filter, search planner, vector search)
lib/auth.ts        Session tokens and revocation check
lib/rate-limit.ts  Shared rate limiter
middleware.ts      Protects the chat page and API
seed/              Bible translation dump and import/embedding scripts
db/                SQL for the accounts database
```

## Future Features To Work On

- Upload a picture of a Bible verse for the AI to read and respond to
- UI features (light mode, customization)
- Saved conversation history
