import { HabitForm } from "@/components/health/habit-form"
import { HabitCard } from "@/components/health/habit-card"
import { MoodTracker } from "@/components/health/mood-tracker"
import { StreakIndicator } from "@/components/health/streak-indicator"

export default function HealthPage() {
  return (
    <main>
      <h1>Health</h1>
      <HabitForm />
      <HabitCard />
      <StreakIndicator />
      <MoodTracker />
    </main>
  )
}
