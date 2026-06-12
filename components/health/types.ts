export type HealthHabit = {
  id: string;
  title: string;
  streak: number;
  lastCompleted: string | null;
  completedToday: boolean;
  /** Completion flags for the last 7 days, oldest first. */
  weekLog: boolean[];
};

export type HealthMoodEntry = {
  id: string;
  date: string;
  mood: number;
  note: string | null;
};

export type HealthWeeklyDay = {
  label: string;
  completed: number;
  total: number;
};

export type HealthMetric = {
  value: number;
  series: number[];
};

export type HealthDashboardData = {
  todayLabel: string;
  metrics: {
    healthScore: HealthMetric;
    todayCompletion: {
      percent: number | null;
      completed: number;
      total: number;
      series: number[];
    };
    bestStreak: {
      value: number;
      habitTitle: string | null;
      series: number[];
    };
    mood: {
      average: number | null;
      latest: number | null;
      series: number[];
    };
  };
  weeklyActivity: HealthWeeklyDay[];
  habits: HealthHabit[];
  recentMoods: HealthMoodEntry[];
  insight: {
    label: string;
    message: string;
    tone: "neutral" | "positive" | "warning";
  };
};
