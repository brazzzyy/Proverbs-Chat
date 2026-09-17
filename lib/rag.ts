interface KnowledgeItem {
  id: string;
  content: string;
  category: 'proverb' | 'scripture' | 'teaching' | 'prayer' | 'guidance';
  reference?: string;
}

const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'proverb-1',
    content: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    category: 'proverb',
    reference: 'Proverbs 3:5-6'
  },
  {
    id: 'proverb-2',
    content: 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.',
    category: 'proverb',
    reference: 'Proverbs 9:10'
  },
  {
    id: 'proverb-3',
    content: 'A gentle answer turns away wrath, but a harsh word stirs up anger.',
    category: 'proverb',
    reference: 'Proverbs 15:1'
  },
  {
    id: 'proverb-4',
    content: 'Pride goes before destruction, a haughty spirit before a fall.',
    category: 'proverb',
    reference: 'Proverbs 16:18'
  },
  {
    id: 'proverb-5',
    content: 'As iron sharpens iron, so one person sharpens another.',
    category: 'proverb',
    reference: 'Proverbs 27:17'
  },
  {
    id: 'scripture-1',
    content: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    category: 'scripture',
    reference: 'John 3:16'
  },
  {
    id: 'scripture-2',
    content: 'I can do all this through him who gives me strength.',
    category: 'scripture',
    reference: 'Philippians 4:13'
  },
  {
    id: 'scripture-3',
    content: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    category: 'scripture',
    reference: 'Romans 8:28'
  },
  {
    id: 'scripture-4',
    content: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."',
    category: 'scripture',
    reference: 'John 14:6'
  },
  {
    id: 'scripture-5',
    content: 'Cast all your anxiety on him because he cares for you.',
    category: 'scripture',
    reference: '1 Peter 5:7'
  },
  {
    id: 'teaching-1',
    content: 'The Golden Rule: Do to others as you would have them do to you. This is the essence of Christian love and service.',
    category: 'teaching',
    reference: 'Matthew 7:12'
  },
  {
    id: 'teaching-2',
    content: 'Love your enemies and pray for those who persecute you. This radical love demonstrates the transformative power of Christ.',
    category: 'teaching',
    reference: 'Matthew 5:44'
  },
  {
    id: 'teaching-3',
    content: 'Forgiveness is central to Christian faith. As Christ forgave us, we must forgive others, releasing bitterness and finding peace.',
    category: 'teaching',
    reference: 'Ephesians 4:32'
  },
  {
    id: 'teaching-4',
    content: 'Faith without works is dead. True faith is demonstrated through loving action and service to others.',
    category: 'teaching',
    reference: 'James 2:17'
  },
  {
    id: 'teaching-5',
    content: 'The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    category: 'teaching',
    reference: 'Galatians 5:22-23'
  },
  {
    id: 'prayer-1',
    content: 'Pray without ceasing. Prayer is our direct line of communication with God, bringing peace and guidance.',
    category: 'prayer',
    reference: '1 Thessalonians 5:17'
  },
  {
    id: 'prayer-2',
    content: 'The Lord\'s Prayer teaches us to seek God\'s will, ask for daily needs, seek forgiveness, and protection from temptation.',
    category: 'prayer',
    reference: 'Matthew 6:9-13'
  },
  {
    id: 'prayer-3',
    content: 'When you pray, go into your room, close the door and pray to your Father, who is unseen. Then your Father will reward you.',
    category: 'prayer',
    reference: 'Matthew 6:6'
  },
  {
    id: 'guidance-1',
    content: 'Seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    category: 'guidance',
    reference: 'Matthew 6:33'
  },
  {
    id: 'guidance-2',
    content: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    category: 'guidance',
    reference: 'Philippians 4:6'
  },
  {
    id: 'guidance-3',
    content: 'Be still and know that I am God. In quiet moments, we can hear God\'s voice and feel His presence.',
    category: 'guidance',
    reference: 'Psalm 46:10'
  },
  {
    id: 'guidance-4',
    content: 'Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.',
    category: 'guidance',
    reference: 'Matthew 5:16'
  },
  {
    id: 'guidance-5',
    content: 'Love the Lord your God with all your heart and with all your soul and with all your mind. This is the first and greatest commandment.',
    category: 'guidance',
    reference: 'Matthew 22:37-38'
  }
];

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how',
  'i', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to',
  'what', 'when', 'with', 'you', 'your', 'do', 'does', 'me', 'my'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreItem(query: string, item: KnowledgeItem): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const haystack = `${item.content} ${item.reference ?? ''} ${item.category}`;
  const haystackTokens = new Set(tokenize(haystack));
  const haystackLower = haystack.toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (haystackTokens.has(token)) score += 2;
    else if (haystackLower.includes(token)) score += 1;
  }

  return score;
}

function search(query: string, limit: number): KnowledgeItem[] {
  return knowledgeItems
    .map(item => ({ item, score: scoreItem(query, item) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.item);
}

export async function retrieveRelevantContext(query: string, limit: number = 3): Promise<string> {
  const relevantItems = search(query, limit);

  if (relevantItems.length === 0) {
    return '';
  }

  return relevantItems.map(item => {
    let formatted = item.content;
    if (item.reference) {
      formatted += ` (${item.reference})`;
    }
    return formatted;
  }).join('\n\n');
}

export async function getRAGContext(query: string): Promise<{
  context: string;
  references: string[];
  categories: string[];
}> {
  const relevantItems = search(query, 5);

  return {
    context: relevantItems.map(item => item.content).join('\n\n'),
    references: relevantItems
      .filter(item => item.reference)
      .map(item => item.reference!),
    categories: [...new Set(relevantItems.map(item => item.category))],
  };
}
