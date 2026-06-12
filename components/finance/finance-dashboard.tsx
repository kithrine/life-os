"use client";

import { FormEvent, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Landmark,
  LineChart,
  Pencil,
  PiggyBank,
  Plus,
  PlusCircle,
  ReceiptText,
  Target,
  Trash2,
  WalletCards,
} from "lucide-react";
import {
  contributeSavingsGoal,
  createBudget,
  createFinancialAccount,
  createSavingsGoal,
  createTransaction,
  deleteBudget,
  deleteFinancialAccount,
  deleteSavingsGoal,
  deleteTransaction,
  updateBudget,
  updateFinancialAccount,
  updateSavingsGoal,
  updateTransaction,
} from "@/actions/finance";
import { cn } from "@/lib/utils";
import type {
  FinanceAccount,
  FinanceBudget,
  FinanceDashboardData,
  FinanceSavingsGoal,
  FinanceTransaction,
} from "./types";

type ActiveForm = "transaction" | "account" | "budget" | "savings";

const ACCOUNT_TYPES = ["checking", "savings", "investment", "credit", "cash", "loan"];
const TRANSACTION_TYPES = ["expense", "income", "transfer", "adjustment"];
const CATEGORIES = [
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Shopping",
  "Health",
  "Income",
  "Savings",
  "Other",
];

const todayInput = () => new Date().toISOString().slice(0, 10);

const emptyAccountForm = {
  name: "",
  type: "checking",
  institution: "",
  balance: "",
  currency: "USD",
};

const emptyTransactionForm = {
  accountId: "",
  date: todayInput(),
  merchant: "",
  category: "Food",
  amount: "",
  type: "expense",
  note: "",
};

const emptyBudgetForm = {
  category: "Food",
  limitAmount: "",
};

const emptySavingsForm = {
  title: "",
  targetAmount: "",
  currentAmount: "",
};

const emptyContributionForm = {
  amount: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedCurrency(value: number) {
  const formatted = formatCurrency(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function inputDate(isoDate: string) {
  return isoDate.slice(0, 10);
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(value, 100));
}

function Sparkline({
  values,
  color = "#4f46e5",
}: {
  values: number[];
  color?: string;
}) {
  const safeValues = values.filter((value) => Number.isFinite(value));

  if (safeValues.length === 0) {
    return (
      <svg viewBox="0 0 112 42" className="h-11 w-28" aria-hidden="true">
        <path d="M4 30 C24 20 40 36 58 26 S88 20 108 28" fill="none" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 5" />
      </svg>
    );
  }

  if (safeValues.length === 1) {
    return (
      <svg viewBox="0 0 112 42" className="h-11 w-28" aria-hidden="true">
        <line x1="10" y1="24" x2="102" y2="24" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
        <circle cx="56" cy="24" r="4" fill={color} />
      </svg>
    );
  }

  if (safeValues.length === 2) {
    const [first, second] = safeValues;
    const maxAbs = Math.max(Math.abs(first), Math.abs(second), 1);
    const slope = Math.max(-1, Math.min((second - first) / maxAbs, 1)) * 10;
    const firstY = 22 + slope / 2;
    const secondY = 22 - slope / 2;

    return (
      <svg viewBox="0 0 112 42" className="h-11 w-28" aria-hidden="true">
        <line x1="10" y1="34" x2="102" y2="34" stroke="#f3f4f6" strokeWidth="2" strokeLinecap="round" />
        <polyline
          points={`16,${firstY} 96,${secondY}`}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy={firstY} r="2.5" fill={color} />
        <circle cx="96" cy={secondY} r="2.5" fill={color} />
      </svg>
    );
  }

  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const range = max - min || 1;
  const padding = Math.max(range * 0.18, Math.max(Math.abs(max), Math.abs(min), 1) * 0.02);
  const chartMin = min - padding;
  const chartRange = range + padding * 2;
  const points = safeValues.map((value, index) => {
    const x = 6 + (index / (safeValues.length - 1)) * 100;
    const y = 34 - ((value - chartMin) / chartRange) * 26;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 112 42" className="h-11 w-28" aria-hidden="true">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`6,36 106,36`} fill="none" stroke="#f3f4f6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DonutBreakdown({
  segments,
}: {
  segments: FinanceDashboardData["spendingBreakdown"];
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);
  let offset = 0;

  return (
    <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 112 112" className="h-44 w-44 -rotate-90">
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="13" />
          {total > 0 &&
            segments.map((segment) => {
              const length = (segment.amount / total) * circumference;
              const strokeDashoffset = -offset;
              offset += length;
              return (
                <circle
                  key={segment.category}
                  cx="56"
                  cy="56"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Spending
          </span>
          <span className="text-xl font-bold text-gray-900">
            {total > 0 ? formatCurrency(total) : "$0"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {segments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            No spending transactions in this month.
          </div>
        ) : (
          segments.map((segment) => {
            const percent = total > 0 ? Math.round((segment.amount / total) * 100) : 0;
            return (
              <div key={segment.category} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="truncate text-sm font-medium text-gray-700">
                    {segment.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(segment.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{percent}%</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClass,
  iconBg,
  lineColor,
  series,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof WalletCards;
  iconClass: string;
  iconBg: string;
  lineColor: string;
  series: number[];
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg)}>
              <Icon className={cn("h-4 w-4", iconClass)} />
            </span>
            <p className="text-sm font-medium text-gray-500">{label}</p>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </div>
        <Sparkline values={series} color={lineColor} />
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
      {text}
    </div>
  );
}

export function FinanceDashboard({ data }: { data: FinanceDashboardData }) {
  const router = useRouter();
  const quickAddRef = useRef<HTMLElement>(null);
  const [isPending, startTransition] = useTransition();
  const [activeForm, setActiveForm] = useState<ActiveForm>("transaction");
  const [editing, setEditing] = useState<{ kind: ActiveForm; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [accountForm, setAccountForm] = useState(emptyAccountForm);
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);
  const [budgetForm, setBudgetForm] = useState(emptyBudgetForm);
  const [savingsForm, setSavingsForm] = useState(emptySavingsForm);
  const [contributingGoalId, setContributingGoalId] = useState<string | null>(null);
  const [contributionForm, setContributionForm] = useState(emptyContributionForm);
  const [contributionError, setContributionError] = useState<string | null>(null);

  const insightClasses = {
    neutral: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    positive: "bg-green-50 text-green-700 ring-green-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
  }[data.insight.tone];

  const metrics = [
    {
      label: "Net worth",
      value: formatCurrency(data.metrics.netWorth.value),
      detail: `${formatCurrency(data.metrics.netWorth.assets)} assets / ${formatCurrency(data.metrics.netWorth.liabilities)} debt`,
      icon: WalletCards,
      iconClass: "text-indigo-600",
      iconBg: "bg-indigo-50",
      lineColor: "#4f46e5",
      series: data.metrics.netWorth.series,
    },
    {
      label: "Monthly spending",
      value: formatCurrency(data.metrics.monthlySpending.value),
      detail: `${data.metrics.monthlySpending.transactionCount} expense transactions`,
      icon: ReceiptText,
      iconClass: "text-rose-600",
      iconBg: "bg-rose-50",
      lineColor: "#e11d48",
      series: data.metrics.monthlySpending.series,
    },
    {
      label: "Savings rate",
      value:
        data.metrics.savingsRate.percent === null
          ? "0%"
          : `${data.metrics.savingsRate.percent}%`,
      detail: "Income retained this month",
      icon: PiggyBank,
      iconClass: "text-green-600",
      iconBg: "bg-green-50",
      lineColor: "#10b981",
      series: data.metrics.savingsRate.series,
    },
    {
      label: "Cashflow",
      value: formatSignedCurrency(data.metrics.cashflow.value),
      detail: `${formatCurrency(data.metrics.cashflow.income)} in / ${formatCurrency(data.metrics.cashflow.spending)} out`,
      icon: LineChart,
      iconClass: "text-sky-600",
      iconBg: "bg-sky-50",
      lineColor: "#0284c7",
      series: data.metrics.cashflow.series,
    },
  ];

  const accountOptions = useMemo(
    () => data.accounts.map((account) => ({ id: account.id, name: account.name })),
    [data.accounts]
  );

  function clearForms() {
    setEditing(null);
    setError(null);
    setAccountForm(emptyAccountForm);
    setTransactionForm({ ...emptyTransactionForm, date: todayInput() });
    setBudgetForm(emptyBudgetForm);
    setSavingsForm(emptySavingsForm);
    setContributingGoalId(null);
    setContributionForm(emptyContributionForm);
    setContributionError(null);
  }

  function runAction(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        clearForms();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function changeMonth(month: string) {
    router.push(`/finance?month=${month}`);
  }

  function focusQuickAdd(form: ActiveForm, clearEditing = false) {
    setActiveForm(form);
    if (clearEditing) setEditing(null);
    setError(null);
    window.requestAnimationFrame(() => {
      quickAddRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function editAccount(account: FinanceAccount) {
    focusQuickAdd("account");
    setEditing({ kind: "account", id: account.id });
    setAccountForm({
      name: account.name,
      type: account.type,
      institution: account.institution ?? "",
      balance: String(account.balance),
      currency: account.currency,
    });
  }

  function editTransaction(transaction: FinanceTransaction) {
    focusQuickAdd("transaction");
    setEditing({ kind: "transaction", id: transaction.id });
    setTransactionForm({
      accountId: transaction.accountId ?? "",
      date: inputDate(transaction.date),
      merchant: transaction.merchant,
      category: transaction.category,
      amount: String(Math.abs(transaction.amount)),
      type: transaction.type,
      note: transaction.note ?? "",
    });
  }

  function editBudget(budget: FinanceBudget) {
    focusQuickAdd("budget");
    setEditing({ kind: "budget", id: budget.id });
    setBudgetForm({
      category: budget.category,
      limitAmount: String(budget.limitAmount),
    });
  }

  function editSavingsGoal(goal: FinanceSavingsGoal) {
    focusQuickAdd("savings");
    setEditing({ kind: "savings", id: goal.id });
    setSavingsForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
    });
  }

  function startContribution(goalId: string) {
    setContributingGoalId((current) => (current === goalId ? null : goalId));
    setContributionForm(emptyContributionForm);
    setContributionError(null);
  }

  function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      if (editing?.kind === "account") {
        await updateFinancialAccount({ ...accountForm, id: editing.id });
      } else {
        await createFinancialAccount(accountForm);
      }
    });
  }

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      if (editing?.kind === "transaction") {
        await updateTransaction({ ...transactionForm, id: editing.id });
      } else {
        await createTransaction(transactionForm);
      }
    });
  }

  function submitBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      const payload = { ...budgetForm, month: data.selectedMonth };
      if (editing?.kind === "budget") {
        await updateBudget({ ...payload, id: editing.id });
      } else {
        await createBudget(payload);
      }
    });
  }

  function submitSavings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      if (editing?.kind === "savings") {
        await updateSavingsGoal({ ...savingsForm, id: editing.id });
      } else {
        await createSavingsGoal(savingsForm);
      }
    });
  }

  function submitContribution(event: FormEvent<HTMLFormElement>, goalId: string) {
    event.preventDefault();
    setContributionError(null);
    startTransition(async () => {
      try {
        await contributeSavingsGoal({ id: goalId, amount: contributionForm.amount });
        setContributingGoalId(null);
        setContributionForm(emptyContributionForm);
        router.refresh();
      } catch (err) {
        setContributionError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function remove(action: () => Promise<void>) {
    runAction(action);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CircleDollarSign className="h-4 w-4" />
              Finance command center
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {data.monthLabel}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Accounts, transactions, budgets, savings goals, and net worth.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <input
                aria-label="Finance month"
                type="month"
                value={data.selectedMonth}
                onChange={(event) => changeMonth(event.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-900 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => focusQuickAdd("transaction", true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Transaction
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <SectionHeader
                  title="Spending breakdown"
                  subtitle="Expense transactions grouped by category"
                />
                <DonutBreakdown segments={data.spendingBreakdown} />
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <SectionHeader title="Account balances" subtitle="Active balances by account" />
                {data.accounts.length === 0 ? (
                  <EmptyInline text="No accounts yet. Add checking, savings, credit, cash, investment, or loan balances." />
                ) : (
                  <div className="space-y-3">
                    {data.accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                            {account.type === "credit" || account.type === "loan" ? (
                              <CreditCard className="h-4 w-4" />
                            ) : (
                              <Landmark className="h-4 w-4" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {account.name}
                            </p>
                            <p className="truncate text-xs capitalize text-gray-500">
                              {account.institution ?? account.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <p
                            className={cn(
                              "text-sm font-bold",
                              account.balance < 0 ||
                                account.type === "credit" ||
                                account.type === "loan"
                                ? "text-rose-600"
                                : "text-gray-900"
                            )}
                          >
                            {formatSignedCurrency(account.balance)}
                          </p>
                          <button
                            type="button"
                            title="Edit account"
                            onClick={() => editAccount(account)}
                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-indigo-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete account"
                            onClick={() => remove(() => deleteFinancialAccount(account.id))}
                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <SectionHeader title="Budget usage" subtitle="Monthly limits compared with actual category spending" />
              {data.budgetUsage.length === 0 ? (
                <EmptyInline text="No budgets for this month. Add category limits to track over and under spending." />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {data.budgetUsage.map((budget) => (
                    <div key={budget.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{budget.category}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatCurrency(budget.spent)} of {formatCurrency(budget.limitAmount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              budget.status === "over"
                                ? "bg-rose-100 text-rose-700"
                                : budget.status === "watch"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            )}
                          >
                            {budget.percent}%
                          </span>
                          <button
                            type="button"
                            title="Edit budget"
                            onClick={() =>
                              editBudget({
                                id: budget.id,
                                category: budget.category,
                                limitAmount: budget.limitAmount,
                                month: data.selectedMonth,
                              })
                            }
                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-indigo-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete budget"
                            onClick={() => remove(() => deleteBudget(budget.id))}
                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            budget.status === "over"
                              ? "bg-rose-500"
                              : budget.status === "watch"
                                ? "bg-amber-500"
                                : "bg-green-500"
                          )}
                          style={{ width: `${clampPercent(budget.percent)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {budget.remaining >= 0
                          ? `${formatCurrency(budget.remaining)} remaining`
                          : `${formatCurrency(Math.abs(budget.remaining))} over`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <SectionHeader title="Recent transactions" subtitle="Latest rows across all accounts" />
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Merchant</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {data.recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                          No transactions yet. Add income or expenses to populate cashflow, spending, and budgets.
                        </td>
                      </tr>
                    ) : (
                      data.recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="align-middle">
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(transaction.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-lg",
                                  transaction.amount < 0
                                    ? "bg-rose-50 text-rose-600"
                                    : "bg-green-50 text-green-600"
                                )}
                              >
                                {transaction.amount < 0 ? (
                                  <ArrowDownRight className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                )}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {transaction.merchant}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{transaction.category}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {transaction.accountName ?? "Unassigned"}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 text-right font-bold",
                              transaction.amount < 0 ? "text-rose-600" : "text-green-600"
                            )}
                          >
                            {formatSignedCurrency(transaction.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                title="Edit transaction"
                                onClick={() => editTransaction(transaction)}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-indigo-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Delete transaction"
                                onClick={() => remove(() => deleteTransaction(transaction.id))}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section
              ref={quickAddRef}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Quick add</h2>
                  <p className="text-xs text-gray-500">
                    {editing ? "Editing selected record" : "Create finance records"}
                  </p>
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={clearForms}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5">
                {[
                  {
                    key: "transaction" as const,
                    label: "Transaction",
                    icon: ReceiptText,
                    iconClass: "text-green-500",
                  },
                  {
                    key: "account" as const,
                    label: "Account",
                    icon: Banknote,
                    iconClass: "text-blue-500",
                  },
                  {
                    key: "budget" as const,
                    label: "Budget",
                    icon: Target,
                    iconClass: "text-amber-500",
                  },
                  {
                    key: "savings" as const,
                    label: "Savings Goal",
                    icon: PiggyBank,
                    iconClass: "text-pink-500",
                  },
                ].map(({ key, label, icon: Icon, iconClass }) => (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() => focusQuickAdd(key, true)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition",
                      activeForm === key
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", iconClass)} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <div className="mt-5">
                {activeForm === "transaction" && (
                  <form onSubmit={submitTransaction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Type">
                        <select
                          value={transactionForm.type}
                          onChange={(event) =>
                            setTransactionForm((form) => ({ ...form, type: event.target.value }))
                          }
                          className="finance-input capitalize"
                        >
                          {TRANSACTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Date">
                        <input
                          type="date"
                          value={transactionForm.date}
                          onChange={(event) =>
                            setTransactionForm((form) => ({ ...form, date: event.target.value }))
                          }
                          className="finance-input"
                        />
                      </Field>
                    </div>
                    <Field label="Merchant">
                      <input
                        value={transactionForm.merchant}
                        onChange={(event) =>
                          setTransactionForm((form) => ({ ...form, merchant: event.target.value }))
                        }
                        placeholder="Payroll, rent, groceries"
                        className="finance-input"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Category">
                        <select
                          value={transactionForm.category}
                          onChange={(event) =>
                            setTransactionForm((form) => ({ ...form, category: event.target.value }))
                          }
                          className="finance-input"
                        >
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Amount">
                        <input
                          inputMode="decimal"
                          value={transactionForm.amount}
                          onChange={(event) =>
                            setTransactionForm((form) => ({ ...form, amount: event.target.value }))
                          }
                          placeholder="0"
                          className="finance-input"
                        />
                      </Field>
                    </div>
                    <Field label="Account">
                      <select
                        value={transactionForm.accountId}
                        onChange={(event) =>
                          setTransactionForm((form) => ({ ...form, accountId: event.target.value }))
                        }
                        className="finance-input"
                      >
                        <option value="">Unassigned</option>
                        {accountOptions.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Note">
                      <input
                        value={transactionForm.note}
                        onChange={(event) =>
                          setTransactionForm((form) => ({ ...form, note: event.target.value }))
                        }
                        placeholder="Optional"
                        className="finance-input"
                      />
                    </Field>
                    <SubmitRow pending={isPending} editing={editing?.kind === "transaction"} />
                  </form>
                )}

                {activeForm === "account" && (
                  <form onSubmit={submitAccount} className="space-y-4">
                    <Field label="Name">
                      <input
                        value={accountForm.name}
                        onChange={(event) =>
                          setAccountForm((form) => ({ ...form, name: event.target.value }))
                        }
                        placeholder="Main checking"
                        className="finance-input"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Type">
                        <select
                          value={accountForm.type}
                          onChange={(event) =>
                            setAccountForm((form) => ({ ...form, type: event.target.value }))
                          }
                          className="finance-input capitalize"
                        >
                          {ACCOUNT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Balance">
                        <input
                          inputMode="decimal"
                          value={accountForm.balance}
                          onChange={(event) =>
                            setAccountForm((form) => ({ ...form, balance: event.target.value }))
                          }
                          placeholder="0"
                          className="finance-input"
                        />
                      </Field>
                    </div>
                    <Field label="Institution">
                      <input
                        value={accountForm.institution}
                        onChange={(event) =>
                          setAccountForm((form) => ({ ...form, institution: event.target.value }))
                        }
                        placeholder="Optional"
                        className="finance-input"
                      />
                    </Field>
                    <SubmitRow pending={isPending} editing={editing?.kind === "account"} />
                  </form>
                )}

                {activeForm === "budget" && (
                  <form onSubmit={submitBudget} className="space-y-4">
                    <Field label="Category">
                      <select
                        value={budgetForm.category}
                        onChange={(event) =>
                          setBudgetForm((form) => ({ ...form, category: event.target.value }))
                        }
                        className="finance-input"
                      >
                        {CATEGORIES.filter((category) => category !== "Income").map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Monthly limit">
                      <input
                        inputMode="decimal"
                        value={budgetForm.limitAmount}
                        onChange={(event) =>
                          setBudgetForm((form) => ({ ...form, limitAmount: event.target.value }))
                        }
                        placeholder="0"
                        className="finance-input"
                      />
                    </Field>
                    <SubmitRow pending={isPending} editing={editing?.kind === "budget"} />
                  </form>
                )}

                {activeForm === "savings" && (
                  <form onSubmit={submitSavings} className="space-y-4">
                    <Field label="Goal">
                      <input
                        value={savingsForm.title}
                        onChange={(event) =>
                          setSavingsForm((form) => ({ ...form, title: event.target.value }))
                        }
                        placeholder="Emergency fund"
                        className="finance-input"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Current">
                        <input
                          inputMode="decimal"
                          value={savingsForm.currentAmount}
                          onChange={(event) =>
                            setSavingsForm((form) => ({
                              ...form,
                              currentAmount: event.target.value,
                            }))
                          }
                          placeholder="0"
                          className="finance-input"
                        />
                      </Field>
                      <Field label="Target">
                        <input
                          inputMode="decimal"
                          value={savingsForm.targetAmount}
                          onChange={(event) =>
                            setSavingsForm((form) => ({
                              ...form,
                              targetAmount: event.target.value,
                            }))
                          }
                          placeholder="0"
                          className="finance-input"
                        />
                      </Field>
                    </div>
                    <SubmitRow pending={isPending} editing={editing?.kind === "savings"} />
                  </form>
                )}

              </div>
            </section>

            <section className={cn("rounded-2xl p-5 shadow-sm ring-1", insightClasses)}>
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <h2 className="text-sm font-bold">{data.insight.label}</h2>
              </div>
              <p className="mt-2 text-sm leading-6">{data.insight.message}</p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <SectionHeader title="Savings goals" subtitle="Progress toward named goals" />
              {data.savingsGoals.length === 0 ? (
                <EmptyInline text="No savings goals yet. Add a target to track progress." />
              ) : (
                <div className="space-y-4">
                  {data.savingsGoals.map((goal) => {
                    const percent =
                      goal.targetAmount > 0
                        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                        : 0;
                    return (
                      <div key={goal.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {goal.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-green-600">{percent}%</span>
                            <button
                              type="button"
                              title="Contribute to savings goal"
                              onClick={() => startContribution(goal.id)}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-green-600"
                            >
                              <PlusCircle className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit savings goal"
                              onClick={() => editSavingsGoal(goal)}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-indigo-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete savings goal"
                              onClick={() => remove(() => deleteSavingsGoal(goal.id))}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${clampPercent(percent)}%` }}
                          />
                        </div>
                        {contributingGoalId === goal.id && (
                          <form
                            onSubmit={(event) => submitContribution(event, goal.id)}
                            className="mt-3 rounded-xl border border-green-100 bg-green-50/70 p-3"
                          >
                            <div className="flex items-end gap-2">
                              <div className="min-w-0 flex-1">
                                <Field label="Add funds">
                                  <input
                                    inputMode="decimal"
                                    value={contributionForm.amount}
                                    onChange={(event) =>
                                      setContributionForm({ amount: event.target.value })
                                    }
                                    placeholder="0"
                                    className="finance-input bg-white"
                                  />
                                </Field>
                              </div>
                              <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                              >
                                <PlusCircle className="h-4 w-4" />
                                Add
                              </button>
                            </div>
                            {contributionError && (
                              <p className="mt-2 text-xs font-medium text-rose-600">
                                {contributionError}
                              </p>
                            )}
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </aside>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SubmitRow({ pending, editing }: { pending: boolean; editing: boolean }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {editing ? "Update" : "Add"}
      </button>
    </div>
  );
}
