import { getGoals } from "@/actions/goals";
import { GoalsDashboard } from "@/components/goals/goals-dashboard";

export default async function GoalsPage() {
  try {
    const goals = await getGoals();
    return <GoalsDashboard goals={goals} />;
  } catch {
    return <GoalsDashboard goals={[]} loadError="Goals data is unavailable right now." />;
  }
}
