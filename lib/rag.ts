import OpenAI from 'openai';

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// knowledge base structure
interface KnowledgeItem {
  id: string;
  content: string;
  category: 'proverb' | 'scripture' | 'teaching' | 'prayer' | 'guidance';
  reference?: string;
  embedding?: number[];
}

// hard-coded knowledge base - should integrate a database later
class KnowledgeBase {
  private items: KnowledgeItem[] = [];
  private embeddings: Map<string, number[]> = new Map();

  async addItem(item: Omit<KnowledgeItem, 'embedding'>) {
    const embedding = await this.generateEmbedding(item.content);
    const fullItem: KnowledgeItem = { ...item, embedding };
    this.items.push(fullItem);
    this.embeddings.set(item.id, embedding);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  async search(query: string, limit: number = 5): Promise<KnowledgeItem[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    // calculate cosine similarity (stackoverflow implementation)
    const similarities = this.items.map(item => {
      if (!item.embedding) return { item, similarity: 0 };
      
      const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
      return { item, similarity };
    });

    // sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(result => result.item);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // initialize with biblical knowledge
  async initialize() {
    const knowledgeItems = [
      // Proverbs
      {
        id: 'proverb-1',
        content: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        category: 'proverb' as const,
        reference: 'Proverbs 3:5-6'
      },
      {
        id: 'proverb-2',
        content: 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.',
        category: 'proverb' as const,
        reference: 'Proverbs 9:10'
      },
      {
        id: 'proverb-3',
        content: 'A gentle answer turns away wrath, but a harsh word stirs up anger.',
        category: 'proverb' as const,
        reference: 'Proverbs 15:1'
      },
      {
        id: 'proverb-4',
        content: 'Pride goes before destruction, a haughty spirit before a fall.',
        category: 'proverb' as const,
        reference: 'Proverbs 16:18'
      },
      {
        id: 'proverb-5',
        content: 'As iron sharpens iron, so one person sharpens another.',
        category: 'proverb' as const,
        reference: 'Proverbs 27:17'
      },
      
      // Scripture
      {
        id: 'scripture-1',
        content: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        category: 'scripture' as const,
        reference: 'John 3:16'
      },
      {
        id: 'scripture-2',
        content: 'I can do all this through him who gives me strength.',
        category: 'scripture' as const,
        reference: 'Philippians 4:13'
      },
      {
        id: 'scripture-3',
        content: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        category: 'scripture' as const,
        reference: 'Romans 8:28'
      },
      {
        id: 'scripture-4',
        content: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."',
        category: 'scripture' as const,
        reference: 'John 14:6'
      },
      {
        id: 'scripture-5',
        content: 'Cast all your anxiety on him because he cares for you.',
        category: 'scripture' as const,
        reference: '1 Peter 5:7'
      },
      
      // Teachings
      {
        id: 'teaching-1',
        content: 'The Golden Rule: Do to others as you would have them do to you. This is the essence of Christian love and service.',
        category: 'teaching' as const,
        reference: 'Matthew 7:12'
      },
      {
        id: 'teaching-2',
        content: 'Love your enemies and pray for those who persecute you. This radical love demonstrates the transformative power of Christ.',
        category: 'teaching' as const,
        reference: 'Matthew 5:44'
      },
      {
        id: 'teaching-3',
        content: 'Forgiveness is central to Christian faith. As Christ forgave us, we must forgive others, releasing bitterness and finding peace.',
        category: 'teaching' as const,
        reference: 'Ephesians 4:32'
      },
      {
        id: 'teaching-4',
        content: 'Faith without works is dead. True faith is demonstrated through loving action and service to others.',
        category: 'teaching' as const,
        reference: 'James 2:17'
      },
      {
        id: 'teaching-5',
        content: 'The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
        category: 'teaching' as const,
        reference: 'Galatians 5:22-23'
      },
      
      // Prayer guidance
      {
        id: 'prayer-1',
        content: 'Pray without ceasing. Prayer is our direct line of communication with God, bringing peace and guidance.',
        category: 'prayer' as const,
        reference: '1 Thessalonians 5:17'
      },
      {
        id: 'prayer-2',
        content: 'The Lord\'s Prayer teaches us to seek God\'s will, ask for daily needs, seek forgiveness, and protection from temptation.',
        category: 'prayer' as const,
        reference: 'Matthew 6:9-13'
      },
      {
        id: 'prayer-3',
        content: 'When you pray, go into your room, close the door and pray to your Father, who is unseen. Then your Father will reward you.',
        category: 'prayer' as const,
        reference: 'Matthew 6:6'
      },
      
      // Guidance
      {
        id: 'guidance-1',
        content: 'Seek first his kingdom and his righteousness, and all these things will be given to you as well.',
        category: 'guidance' as const,
        reference: 'Matthew 6:33'
      },
      {
        id: 'guidance-2',
        content: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
        category: 'guidance' as const,
        reference: 'Philippians 4:6'
      },
      {
        id: 'guidance-3',
        content: 'Be still and know that I am God. In quiet moments, we can hear God\'s voice and feel His presence.',
        category: 'guidance' as const,
        reference: 'Psalm 46:10'
      },
      {
        id: 'guidance-4',
        content: 'Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.',
        category: 'guidance' as const,
        reference: 'Matthew 5:16'
      },
      {
        id: 'guidance-5',
        content: 'Love the Lord your God with all your heart and with all your soul and with all your mind. This is the first and greatest commandment.',
        category: 'guidance' as const,
        reference: 'Matthew 22:37-38'
      }
    ];

    // Add all items to knowledge base
    for (const item of knowledgeItems) {
      await this.addItem(item);
    }
  }
}

// global knowledge base instance
const knowledgeBase = new KnowledgeBase();

// initialize knowledge base on first import
let isInitialized = false;
export async function initializeKnowledgeBase() {
  if (!isInitialized) {
    await knowledgeBase.initialize();
    isInitialized = true;
  }
}

// RAG retrieval function (simplified)
export async function retrieveRelevantContext(query: string, limit: number = 3): Promise<string> {
  await initializeKnowledgeBase();
  
  const relevantItems = await knowledgeBase.search(query, limit);
  
  if (relevantItems.length === 0) {
    return '';
  }

  // format retrieved context
  const context = relevantItems.map(item => {
    let formatted = item.content;
    if (item.reference) {
      formatted += ` (${item.reference})`;
    }
    return formatted;
  }).join('\n\n');

  return context;
}

// enhanced RAG function that provides structured context
export async function getRAGContext(query: string): Promise<{
  context: string;
  references: string[];
  categories: string[];
}> {
  await initializeKnowledgeBase();
  
  const relevantItems = await knowledgeBase.search(query, 5);
  
  const context = relevantItems.map(item => item.content).join('\n\n');
  const references = relevantItems
    .filter(item => item.reference)
    .map(item => item.reference!);
  const categories = [...new Set(relevantItems.map(item => item.category))];

  return {
    context,
    references,
    categories
  };
}