import { getRAGContext } from './rag';

// Utility function to get context for specific topics
export async function getContextForTopic(topic: string): Promise<string> {
  const ragResult = await getRAGContext(topic);
  return ragResult.context;
}

// Function to add new knowledge items (for future expansion)
export async function addKnowledgeItem(
  content: string, 
  category: 'proverb' | 'scripture' | 'teaching' | 'prayer' | 'guidance',
  reference?: string
): Promise<void> {
  // This would integrate with a persistent database in production
  console.log(`Adding knowledge item: ${content} (${category})${reference ? ` - ${reference}` : ''}`);
}

// Function to get random wisdom for general guidance
export async function getRandomWisdom(): Promise<string> {
  const topics = [
    'faith',
    'love',
    'hope',
    'peace',
    'forgiveness',
    'prayer',
    'wisdom',
    'guidance',
    'strength',
    'comfort'
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const ragResult = await getRAGContext(randomTopic);
  
  return ragResult.context.split('\n\n')[0] || 'Trust in the Lord with all your heart.';
}

// Function to validate if a response aligns with Christian teachings
export function validateResponse(response: string): boolean {
  // Basic validation - in production, this could be more sophisticated
  const negativeKeywords = ['hate', 'violence', 'discrimination', 'harm'];
  const hasNegativeContent = negativeKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  
  return !hasNegativeContent;
}
