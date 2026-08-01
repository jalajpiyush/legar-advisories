import OpenAI from "openai";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "model";
  content: string;
}

const systemPrompt = `You are Legal Advisories, a professional legal research assistant. Provide clear, careful, and well-structured legal information. Default to Indian law unless the user asks about another jurisdiction. Distinguish general legal information from legal advice, identify important assumptions, and recommend consulting a qualified lawyer when the situation is fact-specific or high risk. Never invent statutes, cases, or citations.`;

export default async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const body = await request.json() as { messages?: ChatMessage[] };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "At least one chat message is required." }, { status: 400 });
    }

    const messages = body.messages
      .filter(message => message && typeof message.content === "string")
      .slice(-30)
      .map(message => ({
        role: message.role === "assistant" || message.role === "model" ? "assistant" as const : "user" as const,
        content: message.content.trim().slice(0, 20000),
      }))
      .filter(message => message.content.length > 0);

    if (messages.length === 0) {
      return Response.json({ error: "No valid chat messages were provided." }, { status: 400 });
    }

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_completion_tokens: 1200,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return Response.json({ error: "The AI returned an empty response." }, { status: 502 });
    }

    return Response.json({ reply, message: { content: reply } });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status)
      : 500;

    if (status === 429) {
      return Response.json({ error: "The AI service is busy. Please wait a moment and try again." }, { status: 429 });
    }

    console.error("Chat function failed", error);
    return Response.json({ error: "The chat service is temporarily unavailable." }, { status: 500 });
  }
};

export const config = {
  path: "/api/chat",
};
