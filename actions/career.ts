"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function getOrCreateProfile(clerkUserId: string) {
  return prisma.userProfile.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId },
  });
}

export async function addSkill({
  name,
  level,
}: {
  name: string;
  level: string;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const profile = await getOrCreateProfile(clerkUserId);

  await prisma.skill.create({
    data: { userId: profile.id, name, level },
  });

  revalidatePath("/career");
  revalidatePath("/dashboard");
}

export async function deleteSkill(id: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  await prisma.skill.delete({ where: { id } });
  revalidatePath("/career");
  revalidatePath("/dashboard");
}

export async function addJobApplication({
  company,
  role,
}: {
  company: string;
  role: string;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const profile = await getOrCreateProfile(clerkUserId);

  await prisma.jobApplication.create({
    data: { userId: profile.id, company, role },
  });

  revalidatePath("/career");
  revalidatePath("/dashboard");
}

export async function updateJobStatus(id: string, status: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  await prisma.jobApplication.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/career");
  revalidatePath("/dashboard");
}

export async function deleteJobApplication(id: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  await prisma.jobApplication.delete({ where: { id } });
  revalidatePath("/career");
  revalidatePath("/dashboard");
}
