import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, APICallError } from "ai";
import { getRAGContext, ConversationTurn } from "@/lib/rag";

export const maxDuration = 30;
// Removed edge runtime to support RAG pipeline

// map OpenAI failures to messages the chat UI can show the user
function describeModelError(error: unknown): string {
    if (APICallError.isInstance(error)) {
        const status = error.statusCode;
        if (status === 401 || status === 403) {
            return "Proverbs Chat isn't able to connect to its AI service right now. Please try again later.";
        }
        if (status === 404) {
            return "The AI model Proverbs Chat uses is currently unavailable. Please try again later.";
        }
        if (status === 429) {
            return error.responseBody?.includes("insufficient_quota")
                ? "Proverbs Chat has reached its usage limit for now. Please check back later."
                : "Proverbs Chat is receiving a lot of messages right now. Please wait a moment and try again.";
        }
        if (status && status >= 500) {
            return "The AI service is having trouble right now. Please try again in a moment.";
        }
    }
    if (error instanceof Error && error.name === "AbortError") {
        return "The response was interrupted. Please try again.";
    }
    return "Something went wrong reaching Proverbs Chat. Please try again in a moment.";
}

export async function POST(req: Request) {

    if (!process.env.OPENAI_API_KEY) {
        console.error('Chat API error: OPENAI_API_KEY is not set');
        return Response.json(
            { error: "Proverbs Chat isn't configured to connect to its AI service yet. Please try again later." },
            { status: 500 }
        );
    }

    let messages: UIMessage[];
    try {
        ({ messages } = await req.json());
    } catch {
        return Response.json({ error: "Your message couldn't be read. Please try sending it again." }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
        return Response.json({ error: "Please enter a message to start the conversation." }, { status: 400 });
    }

    try {

        // Get the latest user message for RAG context
        const latestMessage = messages[messages.length - 1];
        const userQuery = latestMessage?.role === 'user' && latestMessage.parts?.[0]?.type === 'text' 
            ? latestMessage.parts[0].text 
            : '';

        // retrieve relevant context using RAG
        let ragContext = '';
        let references: string[] = [];
        
        if (userQuery && typeof userQuery === 'string') {
            try {
                // recent turns let the RAG step understand short follow-ups like "yes" or "why?"
                const history = messages.slice(-7, -1).map((message): ConversationTurn => ({
                    role: message.role === 'user' ? 'user' : 'assistant',
                    text: message.parts.map(part => part.type === 'text' ? part.text : '').join(' ').trim(),
                })).filter(turn => turn.text);

                const ragResult = await getRAGContext(userQuery, history);
                ragContext = ragResult.context;
                references = ragResult.references;
            } catch (error) {
                console.error('RAG retrieval error:', error);
                // Continue without RAG context if there's an error
            }
        }

        // design the system prompt with RAG context
        let systemPrompt = `You are a warm, respectful, and wise Christian chatbot named "Proverbs Chat".
            You speak in a friendly and human tone, guided by the teachings of Jesus Christ.
            Be empathetic and sound like a personal companion, not robotic or overly formal.
            Talk as if you were across from this person, using first-person pronouns to reinforce that feeling.
            Respond in a natural, conversational way - avoid numbered lists, bullet points, or structured formats.
            Write like you're having a genuine conversation with a friend over coffee.
            Use Scripture only when it clearly supports or strengthens your response—avoid quoting multiple verses unless necessary.
            Respond concisely avoiding long paragraphs. Never contradict Biblical truth. Only respond to prompts that are 
            relevant towards what you were designed. You were created by Brady Lor.`;

        // add RAG context if available
        if (ragContext) {
            systemPrompt += `\n\nRelevant biblical wisdom and teachings to consider:\n${ragContext}`;
            
            if (references.length > 0) {
                systemPrompt += `\n\nScripture references: ${references.join(', ')}`;
            }
        }

        const result = streamText({
            model: openai("gpt-6-luna"),
            system: systemPrompt,
            messages: convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({
            // model errors surface mid-stream, not in the catch below
            onError: (error) => {
                console.error('Chat model error:', error);
                return describeModelError(error);
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return Response.json({ error: describeModelError(error) }, { status: 500 });
    }
}