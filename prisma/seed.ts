import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  console.log("Seeding LifeOS demo users...");

  // Wipe previous seed users so the script is re-runnable
  await prisma.userProfile.deleteMany({
    where: { clerkUserId: { in: ["user_seed_alex", "user_seed_jordan", "user_seed_sam"] } },
  });

  // ─── Alex Johnson — student, career focus ─────────────────────────────────
  await prisma.userProfile.create({
    data: {
      clerkUserId: "user_seed_alex",
      name: "Alex Johnson",
      lifeStage: "student",
      currentSituation: "Finishing a CS degree while job hunting",
      biggestChallenge: "Balancing coursework with interview prep",
      careerGoals: "Land a frontend engineering role at a product company",
      financialGoals: "Save $10,000 for an emergency fund",
      healthGoals: "Run a half marathon",
      personalGrowthGoals: "Read 24 books this year",
      futureVision: "Senior engineer with a healthy, balanced life",
      goals: {
        create: [
          {
            title: "Save $10,000",
            category: "finance",
            progress: 62,
            milestones: {
              create: [
                { title: "Open high-yield savings account", completed: true },
                { title: "Reach $5,000", completed: true },
                { title: "Reach $10,000", completed: false },
              ],
            },
          },
          {
            title: "Run a Half Marathon",
            category: "health",
            progress: 75,
            milestones: {
              create: [
                { title: "Run 5k without stopping", completed: true },
                { title: "Run 10k race", completed: true },
                { title: "Complete 18k training run", completed: false },
              ],
            },
          },
          {
            title: "Read 24 Books",
            category: "personal",
            progress: 58,
            milestones: {
              create: [
                { title: "Read 12 books", completed: true },
                { title: "Read 24 books", completed: false },
              ],
            },
          },
        ],
      },
      habits: {
        create: [
          { title: "Morning Meditation", streak: 12, lastCompleted: daysAgo(0) },
          { title: "Workout", streak: 8, lastCompleted: daysAgo(0) },
          { title: "Drink Water", streak: 6, lastCompleted: daysAgo(1) },
          { title: "No Sugar", streak: 3, lastCompleted: daysAgo(0) },
        ],
      },
      savingsGoals: {
        create: [{ title: "Emergency Fund", targetAmount: 5000, currentAmount: 3800 }],
      },
      jobApplications: {
        create: [
          { company: "Vercel", role: "Frontend Engineer", status: "interviewing" },
          { company: "Linear", role: "Product Engineer", status: "applied" },
          { company: "Stripe", role: "Software Engineer", status: "applied" },
        ],
      },
      skills: {
        create: [
          { name: "React", level: "advanced" },
          { name: "TypeScript", level: "intermediate" },
          { name: "System Design", level: "intermediate" },
          { name: "Node.js", level: "intermediate" },
        ],
      },
    },
  });

  // ─── Jordan Lee — professional, finance focus ─────────────────────────────
  await prisma.userProfile.create({
    data: {
      clerkUserId: "user_seed_jordan",
      name: "Jordan Lee",
      lifeStage: "early-career",
      currentSituation: "Marketing manager looking to build wealth",
      biggestChallenge: "Keeping expenses under control",
      careerGoals: "Move into a director role within two years",
      financialGoals: "Max out retirement contributions and save for a house",
      healthGoals: "Consistent gym schedule",
      personalGrowthGoals: "Learn public speaking",
      futureVision: "Financially independent by 45",
      goals: {
        create: [
          {
            title: "House Down Payment",
            category: "finance",
            progress: 35,
            milestones: {
              create: [
                { title: "Save $20,000", completed: true },
                { title: "Save $60,000", completed: false },
              ],
            },
          },
          {
            title: "Director Promotion",
            category: "career",
            progress: 40,
            milestones: {
              create: [
                { title: "Lead a cross-team campaign", completed: true },
                { title: "Complete leadership training", completed: false },
              ],
            },
          },
          { title: "Join Toastmasters", category: "personal", progress: 20 },
        ],
      },
      habits: {
        create: [
          { title: "Track Expenses", streak: 21, lastCompleted: daysAgo(0) },
          { title: "Gym Session", streak: 5, lastCompleted: daysAgo(1) },
          { title: "Journal", streak: 14, lastCompleted: daysAgo(0) },
        ],
      },
      savingsGoals: {
        create: [
          { title: "House Down Payment", targetAmount: 60000, currentAmount: 21000 },
          { title: "Vacation Fund", targetAmount: 3000, currentAmount: 2400 },
        ],
      },
      jobApplications: {
        create: [
          { company: "HubSpot", role: "Marketing Director", status: "applied" },
          { company: "Notion", role: "Head of Growth", status: "rejected" },
        ],
      },
      skills: {
        create: [
          { name: "SEO", level: "advanced" },
          { name: "Content Strategy", level: "advanced" },
          { name: "Data Analytics", level: "intermediate" },
        ],
      },
    },
  });

  // ─── Sam Rivera — recent grad, health focus ───────────────────────────────
  await prisma.userProfile.create({
    data: {
      clerkUserId: "user_seed_sam",
      name: "Sam Rivera",
      lifeStage: "recent-grad",
      currentSituation: "First job out of college, building routines",
      biggestChallenge: "Low energy and inconsistent sleep",
      careerGoals: "Grow into a senior designer role",
      financialGoals: "Pay off student loans",
      healthGoals: "Sleep 8 hours and exercise 4x a week",
      personalGrowthGoals: "Pick up rock climbing",
      futureVision: "Healthy, creative, and debt-free",
      goals: {
        create: [
          {
            title: "Pay Off Student Loans",
            category: "finance",
            progress: 15,
            milestones: {
              create: [
                { title: "Pay off first $5,000", completed: true },
                { title: "Pay off half the balance", completed: false },
              ],
            },
          },
          { title: "Exercise 4x a Week", category: "health", progress: 80 },
          { title: "Climb a V4 Boulder", category: "personal", progress: 45 },
        ],
      },
      habits: {
        create: [
          { title: "Sleep by 11pm", streak: 4, lastCompleted: daysAgo(0) },
          { title: "Morning Stretch", streak: 9, lastCompleted: daysAgo(0) },
          { title: "Climbing Gym", streak: 2, lastCompleted: daysAgo(2) },
          { title: "Cook at Home", streak: 7, lastCompleted: daysAgo(0) },
        ],
      },
      savingsGoals: {
        create: [{ title: "Loan Payoff Fund", targetAmount: 12000, currentAmount: 1800 }],
      },
      jobApplications: {
        create: [
          { company: "Figma", role: "Product Designer", status: "applied" },
          { company: "Canva", role: "UI Designer", status: "interviewing" },
        ],
      },
      skills: {
        create: [
          { name: "Figma", level: "advanced" },
          { name: "Illustration", level: "intermediate" },
          { name: "Prototyping", level: "intermediate" },
          { name: "HTML/CSS", level: "beginner" },
        ],
      },
    },
  });

  const count = await prisma.userProfile.count({
    where: { clerkUserId: { startsWith: "user_seed_" } },
  });
  console.log(`Done. ${count} demo users seeded (Alex, Jordan, Sam).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
