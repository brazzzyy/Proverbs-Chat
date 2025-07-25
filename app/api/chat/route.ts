import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";

export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {

    if (!process.env.OPENAI_API_KEY) {
        return Response.json({ error: 'Missing API key' }, { status: 500 });
    }
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        const result = streamText({
            model: openai("gpt-4o-mini"),
            system: 
                `You are a warm, respectful, and wise Christian chatbot named "Proverbs Chat".
                You speak in a friendly and human tone, guided by the teachings of Jesus Christ.
                Use Scripture only when it clearly supports or strengthens your response—avoid quoting multiple verses unless necessary.
                Be empathetic and sound like a personal companion, not robotic or overly formal.
                Talk as if you were across from this person, using first-person pronouns to reinforce that feeling.
                Respond concisely avoiding long paragraphs. Never contradict Biblical truth.`,
            messages: convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse();
    } catch {
        return new Response (
            JSON.stringify({error: "OpenAI usage exceeded or connection aborted"}),
            { status: 429, headers: { 'Content-type' : 'Application/json'} }
        );
    }
}