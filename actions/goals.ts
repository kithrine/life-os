"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  calculateGoalProgress,
  countCompletedMilestones,
  type GoalItem,
  resolveMilestoneCompletion,
} from "@/lib/goals";

type GoalInput = {
  id?: string;
  title: string;
  category: string;
};

type MilestoneInput = {
  id?: string;
  goalId?: string;
  title: string;
};

async function requireProfileId() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!profile) throw new Error("Profile not found");
  return profile.id;
}

function revalidateGoals() {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

function cleanText(value: string | undefined, field: string) {
  const text = value?.trim() ?? "";
  if (!text) throw new Error(`${field} is required`);
  return text;
}

async function requireOwnedGoal(goalId: string, profileId: string) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: profileId },
    select: { id: true },
  });

  if (!goal) throw new Error("Goal not found");
  return goal;
}

async function requireOwnedMilestone(milestoneId: string, profileId: string) {
  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, goal: { userId: profileId } },
    select: { id: true, goalId: true, completed: true },
  });

  if (!milestone) throw new Error("Milestone not found");
  return milestone;
}

async function updateGoalProgress(goalId: string) {
  const milestones = await prisma.milestone.findMany({
    where: { goalId },
    select: { completed: true },
  });
  const progress = calculateGoalProgress(milestones);

  await prisma.goal.update({
    where: { id: goalId },
    data: { progress },
  });

  return progress;
}

export async function getGoals(): Promise<GoalItem[]> {
  const profileId = await requireProfileId();

  const goals = await prisma.goal.findMany({
    where: { userId: profileId },
    orderBy: { createdAt: "desc" },
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
    },
  });

  return goals.map((goal) => {
    const progress = calculateGoalProgress(goal.milestones);

    return {
      id: goal.id,
      title: goal.title,
      category: goal.category,
      progress,
      completedMilestones: countCompletedMilestones(goal.milestones),
      totalMilestones: goal.milestones.length,
      milestones: goal.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        completed: milestone.completed,
      })),
    };
  });
}

export async function createGoal(input: GoalInput): Promise<void> {
  const profileId = await requireProfileId();

  await prisma.goal.create({
    data: {
      userId: profileId,
      title: cleanText(input.title, "Goal title"),
      category: cleanText(input.category, "Category"),
      progress: 0,
    },
  });

  revalidateGoals();
}

export async function updateGoal(input: GoalInput & { id: string }): Promise<void> {
  const profileId = await requireProfileId();
  await requireOwnedGoal(input.id, profileId);

  await prisma.goal.update({
    where: { id: input.id },
    data: {
      title: cleanText(input.title, "Goal title"),
      category: cleanText(input.category, "Category"),
    },
  });

  revalidateGoals();
}

export async function deleteGoal(id: string): Promise<void> {
  const profileId = await requireProfileId();
  await requireOwnedGoal(id, profileId);

  await prisma.goal.delete({ where: { id } });
  revalidateGoals();
}

export async function createMilestone(input: MilestoneInput & { goalId: string }): Promise<void> {
  const profileId = await requireProfileId();
  await requireOwnedGoal(input.goalId, profileId);

  await prisma.milestone.create({
    data: {
      goalId: input.goalId,
      title: cleanText(input.title, "Milestone title"),
    },
  });

  await updateGoalProgress(input.goalId);
  revalidateGoals();
}

export async function updateMilestone(input: MilestoneInput & { id: string }): Promise<void> {
  const profileId = await requireProfileId();
  const milestone = await requireOwnedMilestone(input.id, profileId);

  await prisma.milestone.update({
    where: { id: input.id },
    data: { title: cleanText(input.title, "Milestone title") },
  });

  await updateGoalProgress(milestone.goalId);
  revalidateGoals();
}

export async function toggleMilestoneCompletion(
  id: string,
  completed?: boolean
): Promise<void> {
  const profileId = await requireProfileId();
  const milestone = await requireOwnedMilestone(id, profileId);
  const nextCompleted = resolveMilestoneCompletion(milestone.completed, completed);

  await prisma.milestone.update({
    where: { id },
    data: { completed: nextCompleted },
  });

  await updateGoalProgress(milestone.goalId);
  revalidateGoals();
}

export async function deleteMilestone(id: string): Promise<void> {
  const profileId = await requireProfileId();
  const milestone = await requireOwnedMilestone(id, profileId);

  await prisma.milestone.delete({ where: { id } });
  await updateGoalProgress(milestone.goalId);
  revalidateGoals();
}
