import { NextRequest, NextResponse } from 'next/server';
import { getRAGContext, initializeKnowledgeBase } from '@/lib/rag';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Initialize knowledge base if needed
    await initializeKnowledgeBase();
    
    // Get RAG context
    const ragResult = await getRAGContext(query);
    
    return NextResponse.json({
      query,
      context: ragResult.context,
      references: ragResult.references,
      categories: ragResult.categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve context' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'initialize':
        await initializeKnowledgeBase();
        return NextResponse.json({ 
          message: 'Knowledge base initialized successfully',
          timestamp: new Date().toISOString()
        });
      
      case 'search':
        if (!data.query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }
        
        const ragResult = await getRAGContext(data.query);
        return NextResponse.json({
          query: data.query,
          context: ragResult.context,
          references: ragResult.references,
          categories: ragResult.categories
        });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}
