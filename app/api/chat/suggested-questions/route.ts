import { generateObject } from "ai";
import { z } from "zod";
import type { UIMessage } from "ai";
import { model } from "@/lib/ai-config";

const suggestedQuestionsSchema = z.object({
  questions: z
    .array(z.string().min(5).max(100))
    .length(3)
    .describe("Array of exactly 3 follow-up questions"),
});

export async function POST(req: Request) {
  const {
    messages,
    lastResponse,
  }: { messages: UIMessage[]; lastResponse: string } = await req.json();

  // Get user's original question (last user message)
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const userQuestion =
    lastUserMessage?.parts?.[0]?.type === "text"
      ? lastUserMessage.parts[0].text
      : "the database query";

  try {
    const { object } = await generateObject({
      model: model,
      schema: suggestedQuestionsSchema,
      system: `You are a helpful SQL assistant. Based on the user's question and the assistant's response,
      generate 3 natural follow-up questions that the user might want to ask next.

      Rules:
      - Questions should be relevant to the database query context
      - Questions should explore different angles (filters, aggregations, comparisons)
      - Questions should be phrased as natural language queries
      - Make them specific and actionable`,
      prompt: `User asked: "${userQuestion}"

Assistant responded: "${lastResponse.slice(0, 500)}"

Generate 3 follow-up questions the user might want to ask. Return as JSON with "questions" array.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Failed to generate suggested questions:", error);
    // Return empty questions on error instead of failing
    return Response.json({
      questions: [
        "Show me more details about this data",
        "Can you compare this with other categories?",
        "What are the trends in this data?",
      ],
    });
  }
}
