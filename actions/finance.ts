"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { FinanceDashboardData } from "@/components/finance/types";

const MONTHLY_PERIOD = "monthly";
const BREAKDOWN_COLORS = [
  "#4f46e5",
  "#10b981",
  "#f97316",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#64748b",
];

type AccountInput = {
  id?: string;
  name: string;
  type: string;
  institution?: string;
  balance: number | string;
  currency?: string;
};

type TransactionInput = {
  id?: string;
  accountId?: string;
  date: string;
  merchant: string;
  category: string;
  amount: number | string;
  type: string;
  note?: string;
};

type BudgetInput = {
  id?: string;
  category: string;
  limitAmount: number | string;
  month: string;
};

type SavingsGoalInput = {
  id?: string;
  title: string;
  targetAmount: number | string;
  currentAmount: number | string;
};

type SavingsGoalContributionInput = {
  id: string;
  amount: number | string;
};

async function requireProfileId(): Promise<string> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!profile) throw new Error("Profile not found");

  return profile.id;
}

function revalidateFinance() {
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

function cleanText(value: string | undefined, field: string): string {
  const text = value?.trim() ?? "";
  if (!text) throw new Error(`${field} is required`);
  return text;
}

function optionalText(value: string | undefined): string | null {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function money(value: number | string, field: string): number {
  const parsed =
    typeof value === "number" ? value : Number(value.toString().replace(/[$,]/g, ""));
  if (!Number.isFinite(parsed)) throw new Error(`${field} must be a number`);
  return parsed;
}

function positiveMoney(value: number | string, field: string): number {
  const parsed = money(value, field);
  if (parsed < 0) throw new Error(`${field} must be positive`);
  return parsed;
}

function contributionMoney(value: number | string, field: string): number {
  const parsed = positiveMoney(value, field);
  if (parsed <= 0) throw new Error(`${field} must be greater than zero`);
  return parsed;
}

function signedTransactionAmount(value: number | string, type: string): number {
  const parsed = Math.abs(money(value, "Amount"));
  const normalizedType = type.trim().toLowerCase();
  if (normalizedType === "expense") return -parsed;
  if (normalizedType === "income") return parsed;
  return money(value, "Amount");
}

function dateFromInput(value: string): Date {
  if (!value) throw new Error("Date is required");
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error("Date is invalid");
  return date;
}

function monthStart(value?: string): Date {
  const now = new Date();
  if (!value) return new Date(now.getFullYear(), now.getMonth(), 1);

  const [yearRaw, monthRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(year, month - 1, 1);
}

function nextMonthStart(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth() + 1, 1);
}

function monthKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(value: Date): string {
  return value.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function finiteNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function finitePercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

function normalizedCategory(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function transactionKind(transaction: { amount: number; type: string | null }) {
  const type = transaction.type?.trim().toLowerCase();
  if (type === "expense" || type === "income" || type === "transfer" || type === "adjustment") {
    return type;
  }

  const amount = finiteNumber(transaction.amount);
  if (amount < 0) return "expense";
  if (amount > 0) return "income";
  return "adjustment";
}

function isExpense(transaction: { amount: number; type: string }) {
  return transactionKind(transaction) === "expense";
}

function isIncome(transaction: { amount: number; type: string }) {
  return transactionKind(transaction) === "income";
}

function accountLiability(account: { type: string; balance: number }) {
  const liabilityTypes = new Set(["credit", "loan"]);
  const type = account.type.trim().toLowerCase();
  const balance = finiteNumber(account.balance);
  if (liabilityTypes.has(type)) return Math.abs(balance);
  return balance < 0 ? Math.abs(balance) : 0;
}

function accountAsset(account: { type: string; balance: number }) {
  const liabilityTypes = new Set(["credit", "loan"]);
  const type = account.type.trim().toLowerCase();
  if (liabilityTypes.has(type)) return 0;
  const balance = finiteNumber(account.balance);
  return balance > 0 ? balance : 0;
}

function buildInsight({
  accounts,
  transactionCount,
  cashflow,
  savingsRate,
  budgetUsage,
}: {
  accounts: number;
  transactionCount: number;
  cashflow: number;
  savingsRate: number | null;
  budgetUsage: FinanceDashboardData["budgetUsage"];
}): FinanceDashboardData["insight"] {
  if (accounts === 0 && transactionCount === 0) {
    return {
      tone: "neutral",
      label: "Setup",
      message: "Add an account and a transaction to unlock cashflow, budget, and spending analysis.",
    };
  }

  const overBudget = budgetUsage.find((budget) => budget.status === "over");
  if (overBudget) {
    return {
      tone: "warning",
      label: "Budget pressure",
      message: `${overBudget.category} is over budget for this month. Review recent category spending before adding new discretionary expenses.`,
    };
  }

  if (cashflow < 0) {
    return {
      tone: "warning",
      label: "Cashflow",
      message: "Monthly spending is higher than income for the selected month.",
    };
  }

  if (savingsRate !== null && savingsRate >= 20) {
    return {
      tone: "positive",
      label: "Savings rate",
      message: "Your selected-month savings rate is above 20%. Keep budget limits current so this remains visible.",
    };
  }

  return {
    tone: "neutral",
    label: "Next step",
    message: "Add budgets for your highest spending categories to compare actual spend against monthly limits.",
  };
}

async function ownedAccountId(accountId: string | undefined, profileId: string) {
  const id = accountId?.trim();
  if (!id) return null;

  const account = await prisma.financialAccount.findFirst({
    where: { id, userId: profileId },
    select: { id: true },
  });
  if (!account) throw new Error("Account not found");
  return account.id;
}

export async function getFinanceDashboard(month?: string): Promise<FinanceDashboardData> {
  const profileId = await requireProfileId();
  const selectedMonth = monthStart(month);
  const selectedMonthEnd = nextMonthStart(selectedMonth);
  const seriesStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 5, 1);

  const [
    accounts,
    monthTransactions,
    recentTransactions,
    budgets,
    savingsGoals,
    seriesTransactions,
  ] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId: profileId, isArchived: false },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.transaction.findMany({
      where: {
        userId: profileId,
        date: { gte: selectedMonth, lt: selectedMonthEnd },
      },
      orderBy: { date: "desc" },
      include: { account: { select: { name: true } } },
    }),
    prisma.transaction.findMany({
      where: { userId: profileId },
      orderBy: { date: "desc" },
      take: 12,
      include: { account: { select: { name: true } } },
    }),
    prisma.budget.findMany({
      where: { userId: profileId, period: MONTHLY_PERIOD, month: selectedMonth },
      orderBy: { category: "asc" },
    }),
    prisma.savingsGoal.findMany({
      where: { userId: profileId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transaction.findMany({
      where: {
        userId: profileId,
        date: { gte: seriesStart, lt: selectedMonthEnd },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const expenses = monthTransactions.filter(isExpense);
  const incomeTransactions = monthTransactions.filter(isIncome);
  const monthlySpending = expenses.reduce((sum, tx) => sum + Math.abs(finiteNumber(tx.amount)), 0);
  const monthlyIncome = incomeTransactions.reduce(
    (sum, tx) => sum + Math.max(finiteNumber(tx.amount), 0),
    0
  );
  const cashflow = monthlyIncome - monthlySpending;
  const savingsRate = monthlyIncome > 0 ? finitePercent((cashflow / monthlyIncome) * 100) : null;

  const breakdownTotals = new Map<string, number>();
  for (const tx of expenses) {
    const category = tx.category?.trim() || "Uncategorized";
    breakdownTotals.set(
      category,
      (breakdownTotals.get(category) ?? 0) + Math.abs(finiteNumber(tx.amount))
    );
  }

  const spendingBreakdown = Array.from(breakdownTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount], index) => ({
      category,
      amount,
      color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
    }));

  const expenseTotalsByCategory = new Map<string, number>();
  for (const tx of expenses) {
    const category = normalizedCategory(tx.category);
    if (!category) continue;
    expenseTotalsByCategory.set(
      category,
      (expenseTotalsByCategory.get(category) ?? 0) + Math.abs(finiteNumber(tx.amount))
    );
  }

  const budgetUsage = budgets.map((budget) => {
    const limitAmount = Math.max(finiteNumber(budget.limitAmount), 0);
    const spent = expenseTotalsByCategory.get(normalizedCategory(budget.category)) ?? 0;
    const percent = limitAmount > 0 ? finitePercent((spent / limitAmount) * 100) : spent > 0 ? 100 : 0;
    const remaining = limitAmount - spent;
    const status: FinanceDashboardData["budgetUsage"][number]["status"] =
      spent === 0 ? "empty" : percent >= 100 ? "over" : percent >= 80 ? "watch" : "on-track";

    return {
      id: budget.id,
      category: budget.category,
      limitAmount,
      spent,
      remaining,
      percent,
      status,
    };
  });

  const derivedAssets = accounts.reduce((sum, account) => sum + accountAsset(account), 0);
  const derivedLiabilities = accounts.reduce((sum, account) => sum + accountLiability(account), 0);
  const assets = derivedAssets;
  const liabilities = derivedLiabilities;
  const netWorth = assets - liabilities;

  const monthStarts = Array.from({ length: 6 }, (_, index) => {
    return new Date(seriesStart.getFullYear(), seriesStart.getMonth() + index, 1);
  });

  const spendingSeries = monthStarts.map((start) => {
    const end = nextMonthStart(start);
    return seriesTransactions
      .filter((tx) => tx.date >= start && tx.date < end && isExpense(tx))
      .reduce((sum, tx) => sum + Math.abs(finiteNumber(tx.amount)), 0);
  });

  const cashflowSeries = monthStarts.map((start) => {
    const end = nextMonthStart(start);
    const inMonth = seriesTransactions.filter((tx) => tx.date >= start && tx.date < end);
    const monthIncome = inMonth
      .filter(isIncome)
      .reduce((sum, tx) => sum + Math.max(finiteNumber(tx.amount), 0), 0);
    const monthExpenses = inMonth
      .filter(isExpense)
      .reduce((sum, tx) => sum + Math.abs(finiteNumber(tx.amount)), 0);
    return monthIncome - monthExpenses;
  });

  const savingsRateSeries = monthStarts.map((start) => {
    const end = nextMonthStart(start);
    const inMonth = seriesTransactions.filter((tx) => tx.date >= start && tx.date < end);
    const monthIncome = inMonth
      .filter(isIncome)
      .reduce((sum, tx) => sum + Math.max(finiteNumber(tx.amount), 0), 0);
    const monthExpenses = inMonth
      .filter(isExpense)
      .reduce((sum, tx) => sum + Math.abs(finiteNumber(tx.amount)), 0);
    return monthIncome > 0
      ? finitePercent(((monthIncome - monthExpenses) / monthIncome) * 100)
      : 0;
  });

  const netWorthSeries = accounts.length ? [netWorth] : [];

  return {
    selectedMonth: monthKey(selectedMonth),
    monthLabel: monthLabel(selectedMonth),
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      institution: account.institution,
      balance: finiteNumber(account.balance),
      currency: account.currency,
    })),
    recentTransactions: recentTransactions.map((transaction) => ({
      id: transaction.id,
      accountId: transaction.accountId,
      accountName: transaction.account?.name ?? null,
      date: transaction.date.toISOString(),
      merchant: transaction.merchant,
      category: transaction.category,
      amount: finiteNumber(transaction.amount),
      type: transaction.type,
      note: transaction.note,
    })),
    budgets: budgets.map((budget) => ({
      id: budget.id,
      category: budget.category,
      limitAmount: Math.max(finiteNumber(budget.limitAmount), 0),
      month: monthKey(budget.month),
    })),
    savingsGoals: savingsGoals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      currentAmount: Math.max(finiteNumber(goal.currentAmount), 0),
      targetAmount: Math.max(finiteNumber(goal.targetAmount), 0),
    })),
    metrics: {
      netWorth: {
        value: netWorth,
        assets,
        liabilities,
        series: netWorthSeries,
      },
      monthlySpending: {
        value: monthlySpending,
        transactionCount: expenses.length,
        series: spendingSeries,
      },
      savingsRate: {
        value: savingsRate ?? 0,
        percent: savingsRate,
        series: savingsRateSeries,
      },
      cashflow: {
        value: cashflow,
        income: monthlyIncome,
        spending: monthlySpending,
        series: cashflowSeries,
      },
    },
    spendingBreakdown,
    budgetUsage,
    insight: buildInsight({
      accounts: accounts.length,
      transactionCount: monthTransactions.length,
      cashflow,
      savingsRate,
      budgetUsage,
    }),
  };
}

export async function createFinancialAccount(input: AccountInput): Promise<void> {
  const profileId = await requireProfileId();
  await prisma.financialAccount.create({
    data: {
      userId: profileId,
      name: cleanText(input.name, "Account name"),
      type: cleanText(input.type, "Account type"),
      institution: optionalText(input.institution),
      balance: money(input.balance, "Balance"),
      currency: optionalText(input.currency) ?? "USD",
    },
  });
  revalidateFinance();
}

export async function updateFinancialAccount(input: AccountInput & { id: string }): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.financialAccount.findFirst({
    where: { id: input.id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Account not found");

  await prisma.financialAccount.update({
    where: { id: input.id },
    data: {
      name: cleanText(input.name, "Account name"),
      type: cleanText(input.type, "Account type"),
      institution: optionalText(input.institution),
      balance: money(input.balance, "Balance"),
      currency: optionalText(input.currency) ?? "USD",
    },
  });
  revalidateFinance();
}

export async function deleteFinancialAccount(id: string): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.financialAccount.findFirst({
    where: { id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Account not found");

  await prisma.financialAccount.delete({ where: { id } });
  revalidateFinance();
}

export async function createTransaction(input: TransactionInput): Promise<void> {
  const profileId = await requireProfileId();
  const accountId = await ownedAccountId(input.accountId, profileId);
  const type = cleanText(input.type, "Transaction type");

  await prisma.transaction.create({
    data: {
      userId: profileId,
      accountId,
      date: dateFromInput(input.date),
      merchant: cleanText(input.merchant, "Merchant"),
      category: cleanText(input.category, "Category"),
      amount: signedTransactionAmount(input.amount, type),
      type,
      note: optionalText(input.note),
    },
  });
  revalidateFinance();
}

export async function updateTransaction(input: TransactionInput & { id: string }): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.transaction.findFirst({
    where: { id: input.id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Transaction not found");

  const accountId = await ownedAccountId(input.accountId, profileId);
  const type = cleanText(input.type, "Transaction type");

  await prisma.transaction.update({
    where: { id: input.id },
    data: {
      accountId,
      date: dateFromInput(input.date),
      merchant: cleanText(input.merchant, "Merchant"),
      category: cleanText(input.category, "Category"),
      amount: signedTransactionAmount(input.amount, type),
      type,
      note: optionalText(input.note),
    },
  });
  revalidateFinance();
}

export async function deleteTransaction(id: string): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Transaction not found");

  await prisma.transaction.delete({ where: { id } });
  revalidateFinance();
}

export async function createBudget(input: BudgetInput): Promise<void> {
  const profileId = await requireProfileId();
  const category = cleanText(input.category, "Category");
  const month = monthStart(input.month);

  await prisma.budget.upsert({
    where: {
      userId_category_period_month: {
        userId: profileId,
        category,
        period: MONTHLY_PERIOD,
        month,
      },
    },
    update: { limitAmount: positiveMoney(input.limitAmount, "Budget limit") },
    create: {
      userId: profileId,
      category,
      limitAmount: positiveMoney(input.limitAmount, "Budget limit"),
      period: MONTHLY_PERIOD,
      month,
    },
  });
  revalidateFinance();
}

export async function updateBudget(input: BudgetInput & { id: string }): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.budget.findFirst({
    where: { id: input.id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Budget not found");

  await prisma.budget.update({
    where: { id: input.id },
    data: {
      category: cleanText(input.category, "Category"),
      limitAmount: positiveMoney(input.limitAmount, "Budget limit"),
      month: monthStart(input.month),
      period: MONTHLY_PERIOD,
    },
  });
  revalidateFinance();
}

export async function deleteBudget(id: string): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.budget.findFirst({
    where: { id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Budget not found");

  await prisma.budget.delete({ where: { id } });
  revalidateFinance();
}

export async function createSavingsGoal(input: SavingsGoalInput): Promise<void> {
  const profileId = await requireProfileId();
  await prisma.savingsGoal.create({
    data: {
      userId: profileId,
      title: cleanText(input.title, "Savings goal"),
      targetAmount: positiveMoney(input.targetAmount, "Target amount"),
      currentAmount: positiveMoney(input.currentAmount, "Current amount"),
    },
  });
  revalidateFinance();
}

export async function updateSavingsGoal(input: SavingsGoalInput & { id: string }): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.savingsGoal.findFirst({
    where: { id: input.id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Savings goal not found");

  await prisma.savingsGoal.update({
    where: { id: input.id },
    data: {
      title: cleanText(input.title, "Savings goal"),
      targetAmount: positiveMoney(input.targetAmount, "Target amount"),
      currentAmount: positiveMoney(input.currentAmount, "Current amount"),
    },
  });
  revalidateFinance();
}

export async function contributeSavingsGoal(
  input: SavingsGoalContributionInput
): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.savingsGoal.findFirst({
    where: { id: input.id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Savings goal not found");

  await prisma.savingsGoal.update({
    where: { id: input.id },
    data: {
      currentAmount: {
        increment: contributionMoney(input.amount, "Contribution amount"),
      },
    },
  });
  revalidateFinance();
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const profileId = await requireProfileId();
  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId: profileId },
    select: { id: true },
  });
  if (!existing) throw new Error("Savings goal not found");

  await prisma.savingsGoal.delete({ where: { id } });
  revalidateFinance();
}
