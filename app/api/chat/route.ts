import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { getLifeOSContextForClerkUser } from "@/lib/ai-coach/context";
import { buildAiCoachSystemPrompt } from "@/lib/ai-coach/prompt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ChatRequestBody = {
  messages?: UIMessage[];
};

async function requireProfileId(clerkUserId: string) {
  const profile = await prisma.userProfile.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId },
    select: { id: true },
  });

  return profile.id;
}

function signedTransactionAmount(amount: number, type: "expense" | "income") {
  const absoluteAmount = Math.abs(amount);
  return type === "expense" ? -absoluteAmount : absoluteAmount;
}

function normalizeAccountName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactAccountName(value: string) {
  return normalizeAccountName(value).replace(/\s+/g, "");
}

function accountMatchScore(accountName: string, requestedName: string) {
  const account = normalizeAccountName(accountName);
  const requested = normalizeAccountName(requestedName);
  if (!account || !requested) return 0;

  if (account === requested) return 100;

  const compactAccount = compactAccountName(accountName);
  const compactRequested = compactAccountName(requestedName);
  if (compactAccount === compactRequested) return 90;
  if (compactAccount.includes(compactRequested)) return 80;
  if (compactRequested.includes(compactAccount)) return 70;

  const accountTerms = account.split(/\s+/);
  const requestedTerms = requested.split(/\s+/);
  const matchedTerms = requestedTerms.filter((term) =>
    accountTerms.some((accountTerm) => accountTerm.includes(term) || term.includes(accountTerm))
  );

  return matchedTerms.length === requestedTerms.length ? 60 + matchedTerms.length : 0;
}

async function resolveAccountByName(profileId: string, accountName?: string) {
  const requestedName = accountName?.trim();
  if (!requestedName) return null;

  const accounts = await prisma.financialAccount.findMany({
    where: { userId: profileId },
    select: { id: true, name: true },
  });

  const [bestMatch] = accounts
    .map((account) => ({
      account,
      score: accountMatchScore(account.name, requestedName),
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  return bestMatch?.account ?? null;
}

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
    providerOptions: {
      openai: {
        parallelToolCalls: true,
      } satisfies OpenAILanguageModelResponsesOptions,
    },
    system: buildAiCoachSystemPrompt(lifeOSContext),
    messages: await convertToModelMessages(body.messages),
    tools: {
      addTransaction: tool({
        description:
          "Add an expense or income transaction to the user's LifeOS finance database.",
        inputSchema: z.object({
          merchant: z.string().min(1).describe("Merchant, payer, or transaction source."),
          amount: z.number().positive().describe("Positive transaction amount."),
          category: z.string().min(1).describe("Transaction category."),
          type: z.enum(["expense", "income"]).describe("Whether this is an expense or income."),
          accountName: z
            .string()
            .min(1)
            .optional()
            .describe("Optional name of the financial account the user used."),
        }),
        execute: async ({ merchant, amount, category, type, accountName }) => {
          const profileId = await requireProfileId(clerkUserId);
          const account = await resolveAccountByName(profileId, accountName);
          const transaction = await prisma.transaction.create({
            data: {
              userId: profileId,
              accountId: account?.id ?? null,
              date: new Date(),
              merchant: merchant.trim(),
              amount: signedTransactionAmount(amount, type),
              category: category.trim(),
              type,
            },
            select: {
              id: true,
              merchant: true,
              amount: true,
              category: true,
              type: true,
              date: true,
            },
          });

          revalidatePath("/finance");
          revalidatePath("/dashboard");

          return {
            success: true,
            transaction: {
              ...transaction,
              amount: Math.abs(transaction.amount),
              date: transaction.date.toISOString(),
              accountName: account?.name ?? null,
              accountMatched: Boolean(account),
            },
          };
        },
      }),
      addGoal: tool({
        description: "Add a new LifeOS goal for the user.",
        inputSchema: z.object({
          title: z.string().min(1).describe("Goal title."),
          category: z.string().min(1).describe("Goal category."),
        }),
        execute: async ({ title, category }) => {
          const profileId = await requireProfileId(clerkUserId);
          const goal = await prisma.goal.create({
            data: {
              userId: profileId,
              title: title.trim(),
              category: category.trim(),
              progress: 0,
            },
            select: {
              id: true,
              title: true,
              category: true,
              progress: true,
            },
          });

          revalidatePath("/goals");
          revalidatePath("/dashboard");

          return { success: true, goal };
        },
      }),
      addHabit: tool({
        description: "Add a new LifeOS health habit for the user.",
        inputSchema: z.object({
          title: z.string().min(1).describe("Habit title."),
        }),
        execute: async ({ title }) => {
          const profileId = await requireProfileId(clerkUserId);
          const habit = await prisma.habit.create({
            data: {
              userId: profileId,
              title: title.trim(),
            },
            select: {
              id: true,
              title: true,
              streak: true,
              lastCompleted: true,
            },
          });

          revalidatePath("/health");
          revalidatePath("/dashboard");

          return {
            success: true,
            habit: {
              ...habit,
              lastCompleted: habit.lastCompleted?.toISOString() ?? null,
            },
          };
        },
      }),
      logMood: tool({
        description: "Log or update today's LifeOS mood entry for the user.",
        inputSchema: z.object({
          value: z
            .number()
            .int()
            .min(1)
            .max(5)
            .describe("Mood value from 1 to 5."),
          note: z.string().min(1).optional().describe("Optional mood note."),
        }),
        execute: async ({ value, note }) => {
          const profileId = await requireProfileId(clerkUserId);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const moodEntry = await prisma.moodEntry.upsert({
            where: { userId_date: { userId: profileId, date: today } },
            update: {
              mood: value,
              note: note?.trim(),
            },
            create: {
              userId: profileId,
              mood: value,
              note: note?.trim(),
              date: today,
            },
            select: {
              id: true,
              mood: true,
              note: true,
              date: true,
            },
          });

          revalidatePath("/health");
          revalidatePath("/dashboard");

          return {
            success: true,
            moodEntry: {
              ...moodEntry,
              date: moodEntry.date.toISOString(),
            },
          };
        },
      }),
      addSkill: tool({
        description: "Add a new LifeOS career skill for the user.",
        inputSchema: z.object({
          name: z.string().min(1).describe("Skill name."),
          level: z
            .enum(["beginner", "intermediate", "advanced"])
            .describe("Current skill level."),
        }),
        execute: async ({ name, level }) => {
          const profileId = await requireProfileId(clerkUserId);
          const skill = await prisma.skill.create({
            data: {
              userId: profileId,
              name: name.trim(),
              level,
            },
            select: {
              id: true,
              name: true,
              level: true,
            },
          });

          revalidatePath("/career");
          revalidatePath("/dashboard");

          return { success: true, skill };
        },
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
