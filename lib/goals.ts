export type GoalProgressMilestone = {
  completed: boolean;
};

export type GoalMilestoneItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type GoalItem = {
  id: string;
  title: string;
  category: string;
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
  milestones: GoalMilestoneItem[];
};

export function countCompletedMilestones(milestones: GoalProgressMilestone[]) {
  return milestones.filter((milestone) => milestone.completed).length;
}

export function calculateGoalProgress(milestones: GoalProgressMilestone[]) {
  if (milestones.length === 0) return 0;

  return Math.round((countCompletedMilestones(milestones) / milestones.length) * 100);
}

export function resolveMilestoneCompletion(current: boolean, next?: boolean) {
  return typeof next === "boolean" ? next : !current;
}
