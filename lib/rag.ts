import { embed, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Must match seed/embed.mjs and the vector(512) column in the Bible database.
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 512;
// Off-topic questions score around 0.2; relevant verses score roughly 0.27 and up.
const MIN_SIMILARITY = 0.25;

// A small model decides whether the message is something Scripture speaks to and,
// if so, writes what Scripture would say in KJV English. Modern questions ("anxiety")
// often miss KJV wording ("Be careful for nothing"), so we search with that text.
// It only steers the search: verse text always comes from the database.
const PLANNER_MODEL = 'gpt-5.4-nano';
const PLANNER_TIMEOUT_MS = 5000;
const PLANNER_SYSTEM_PROMPT = `You decide whether a chat message to a Christian companion chatbot should be answered with Bible verses, and if so, help search the King James Bible (1769) for them.

The message is relevant when it seeks spiritual, emotional, moral or life guidance, shares a struggle or feeling, asks about God, faith, prayer, sin, the Bible or Christian living, or is a short follow-up that continues such a topic in the conversation so far.
The message is NOT relevant when it is a greeting, thanks, farewell, small talk, an acknowledgement with nothing to look up, a question about the chatbot itself, or a trivia, factual, technical, coding, math or other request unrelated to faith and life guidance.

If relevant, write searchText: one or two short sentences in King James English expressing what Scripture would say to the person (the counsel, promise, comfort or teaching that answers them), using the words and phrasing the KJV itself uses, with no verse references. Use the conversation to understand short follow-ups.
If not relevant, set searchText to an empty string.`;
const PLAN_SCHEMA = z.object({
  relevant: z.boolean(),
  searchText: z.string(),
});

// Messages that never need verses, so we skip the model call entirely.
const SMALL_TALK = /^(hi+|hey+|hello+|howdy|yo|sup|hiya|greetings|good (morning|afternoon|evening|night)|gm|gn|thanks?( you)?( so much| a lot)?|thank u|thx|ty|bye+|goodbye|see (you|ya)|later|cya|lol+|lmao|haha+|nice|cool|great|awesome|ok(ay)?|k|kk|got it|sounds good|test(ing)?)( (there|friend|again|everyone|all|bot|proverbs( chat)?))?$/;

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface VerseMatch {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  similarity: number;
}

let bibleClient: SupabaseClient | null = null;

function getBibleClient(): SupabaseClient {
  if (!bibleClient) {
    const url = process.env.BIBLE_SUPABASE_URL;
    const key = process.env.BIBLE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error('BIBLE_SUPABASE_URL and BIBLE_SUPABASE_PUBLISHABLE_KEY must be set');
    }
    bibleClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return bibleClient;
}

function isSmallTalk(query: string): boolean {
  const normalized = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Empty, emoji-only or punctuation-only messages normalize to nothing.
  return normalized === '' || SMALL_TALK.test(normalized);
}

type SearchPlan = { relevant: false } | { relevant: true; searchText: string };

// Falls back to searching with the original message if the model call fails.
async function planSearch(query: string, history: ConversationTurn[]): Promise<SearchPlan> {
  const conversation = history
    .map(turn => `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.text.slice(0, 500)}`)
    .join('\n');

  try {
    const { object } = await generateObject({
      model: openai(PLANNER_MODEL),
      schema: PLAN_SCHEMA,
      system: PLANNER_SYSTEM_PROMPT,
      prompt: `${conversation ? `Conversation so far:\n${conversation}\n\n` : ''}Latest message:\n${query}`,
      providerOptions: { openai: { reasoningEffort: 'none' } },
      abortSignal: AbortSignal.timeout(PLANNER_TIMEOUT_MS),
    });
    const searchText = object.searchText.trim();
    return object.relevant && searchText ? { relevant: true, searchText } : { relevant: false };
  } catch (error) {
    console.error('RAG search planning failed, searching with the original message:', error);
    return { relevant: true, searchText: query };
  }
}

async function search(query: string, limit: number, history: ConversationTurn[] = []): Promise<VerseMatch[]> {
  if (isSmallTalk(query)) return [];

  const plan = await planSearch(query, history);
  if (!plan.relevant) return [];

  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: plan.searchText,
    providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
  });

  const { data, error } = await getBibleClient().rpc('match_kjv_verses', {
    query_embedding: embedding,
    match_count: limit,
    min_similarity: MIN_SIMILARITY,
  });
  if (error) throw new Error(`Verse search failed: ${error.message}`);

  return (data ?? []) as VerseMatch[];
}

function reference(match: VerseMatch): string {
  return `${match.book} ${match.chapter}:${match.verse}`;
}

function format(match: VerseMatch): string {
  return `${match.text.trim()} (${reference(match)}, KJV)`;
}

export async function retrieveRelevantContext(query: string, limit: number = 3): Promise<string> {
  const matches = await search(query, limit);
  return matches.map(format).join('\n\n');
}

export async function getRAGContext(query: string, history: ConversationTurn[] = []): Promise<{
  context: string;
  references: string[];
  categories: string[];
}> {
  const matches = await search(query, 5, history);

  return {
    context: matches.map(format).join('\n\n'),
    references: matches.map(reference),
    // Book names of the matched verses (e.g. "Psalms", "Proverbs").
    categories: [...new Set(matches.map(match => match.book))],
  };
}
