export type FinanceAccount = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  balance: number;
  currency: string;
};

export type FinanceTransaction = {
  id: string;
  accountId: string | null;
  accountName: string | null;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: string;
  note: string | null;
};

export type FinanceBudget = {
  id: string;
  category: string;
  limitAmount: number;
  month: string;
};

export type FinanceSavingsGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
};

export type FinanceNetWorthSnapshot = {
  id: string;
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
};

export type FinanceMetric = {
  value: number;
  series: number[];
};

export type FinanceDashboardData = {
  selectedMonth: string;
  monthLabel: string;
  accounts: FinanceAccount[];
  recentTransactions: FinanceTransaction[];
  budgets: FinanceBudget[];
  savingsGoals: FinanceSavingsGoal[];
  netWorthSnapshots: FinanceNetWorthSnapshot[];
  metrics: {
    netWorth: FinanceMetric & {
      assets: number;
      liabilities: number;
    };
    monthlySpending: FinanceMetric & {
      transactionCount: number;
    };
    savingsRate: FinanceMetric & {
      percent: number | null;
    };
    cashflow: FinanceMetric & {
      income: number;
      spending: number;
    };
  };
  spendingBreakdown: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  budgetUsage: Array<{
    id: string;
    category: string;
    limitAmount: number;
    spent: number;
    remaining: number;
    percent: number;
    status: "empty" | "on-track" | "watch" | "over";
  }>;
  insight: {
    label: string;
    message: string;
    tone: "neutral" | "positive" | "warning";
  };
};
