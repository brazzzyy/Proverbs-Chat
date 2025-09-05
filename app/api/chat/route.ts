import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { getRAGContext } from "@/lib/rag";

export const maxDuration = 30;
// Removed edge runtime to support RAG pipeline

export async function POST(req: Request) {

    if (!process.env.OPENAI_API_KEY) {
        return Response.json({ error: 'Missing API key' }, { status: 500 });
    }
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        // Get the latest user message for RAG context
        const latestMessage = messages[messages.length - 1];
        const userQuery = latestMessage?.role === 'user' && latestMessage.parts?.[0]?.type === 'text' 
            ? latestMessage.parts[0].text 
            : '';

        // Retrieve relevant context using RAG
        let ragContext = '';
        let references: string[] = [];
        
        if (userQuery && typeof userQuery === 'string') {
            try {
                const ragResult = await getRAGContext(userQuery);
                ragContext = ragResult.context;
                references = ragResult.references;
            } catch (error) {
                console.error('RAG retrieval error:', error);
                // Continue without RAG context if there's an error
            }
        }

        // Build enhanced system prompt with RAG context
        let systemPrompt = `You are a warm, respectful, and wise Christian chatbot named "Proverbs Chat".
            You speak in a friendly and human tone, guided by the teachings of Jesus Christ.
            Be empathetic and sound like a personal companion, not robotic or overly formal.
            Talk as if you were across from this person, using first-person pronouns to reinforce that feeling.
            Respond in a natural, conversational way - avoid numbered lists, bullet points, or structured formats.
            Write like you're having a genuine conversation with a friend over coffee.
            Use Scripture only when it clearly supports or strengthens your response—avoid quoting multiple verses unless necessary.
            Respond concisely avoiding long paragraphs. Never contradict Biblical truth.`;

        // Add RAG context if available
        if (ragContext) {
            systemPrompt += `\n\nRelevant biblical wisdom and teachings to consider:\n${ragContext}`;
            
            if (references.length > 0) {
                systemPrompt += `\n\nScripture references: ${references.join(', ')}`;
            }
        }

        const result = streamText({
            model: openai("gpt-4o-mini"),
            system: systemPrompt,
            messages: convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response (
            JSON.stringify({error: "OpenAI usage exceeded or connection aborted"}),
            { status: 429, headers: { 'Content-type' : 'Application/json'} }
        );
    }
}