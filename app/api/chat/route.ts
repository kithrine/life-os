import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getLifeOSContextForClerkUser } from "@/lib/ai-coach/context";
import { buildAiCoachSystemPrompt } from "@/lib/ai-coach/prompt";

export const runtime = "nodejs";

type ChatRequestBody = {
  messages?: UIMessage[];
};

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY is not configured.", { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as ChatRequestBody | null;
  if (!body || !Array.isArray(body.messages)) {
    return new Response("Invalid chat request.", { status: 400 });
  }

  const lifeOSContext = await getLifeOSContextForClerkUser(clerkUserId);
  const result = streamText({
    model: openai.responses(process.env.OPENAI_MODEL ?? "gpt-5.5"),
    system: buildAiCoachSystemPrompt(lifeOSContext),
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse();
}
