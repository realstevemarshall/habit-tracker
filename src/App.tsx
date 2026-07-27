import { useState } from 'react';
import { EXERCISES, type ExerciseId } from './data/constants';
import { useAppData } from './hooks/useAppData';
import { todayKey } from './utils/dates';
import { Dashboard } from './components/Dashboard';
import { DailyHabits } from './components/DailyHabits';
import { ExerciseTab } from './components/ExerciseTab';
import { QuarterlyFasts } from './components/QuarterlyFasts';
import { WeeklyFast } from './components/WeeklyFast';

export default function App() {
  const { data, updateData } = useAppData();
  const [activeExercise, setActiveExercise] = useState<ExerciseId>('pushups');
  const [habitDate, setHabitDate] = useState(todayKey());

  const activeConfig = EXERCISES.find(
    (exercise) => exercise.id === activeExercise,
  )!;

  function addExerciseEntry(
    exerciseId: ExerciseId,
    date: string,
    amount: number,
  ) {
    updateData((prev) => ({
      ...prev,
      exercises: {
        ...prev.exercises,
        [exerciseId]: [...prev.exercises[exerciseId], { date, amount }],
      },
    }));
  }

  function toggleHabit(date: string, habitId: string, checked: boolean) {
    updateData((prev) => ({
      ...prev,
      habits: {
        ...prev.habits,
        [date]: {
          ...(prev.habits[date] ?? {}),
          [habitId]: checked,
        },
      },
    }));
  }

  function toggleWeeklyFast(weekKey: string, completed: boolean) {
    updateData((prev) => ({
      ...prev,
      weeklyFast: {
        ...prev.weeklyFast,
        [weekKey]: completed,
      },
    }));
  }

  function updateQuarterlyFast(
    id: string,
    record: (typeof data.quarterlyFasts)[string],
  ) {
    updateData((prev) => ({
      ...prev,
      quarterlyFasts: {
        ...prev.quarterlyFasts,
        [id]: record,
      },
    }));
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Habit & Exercise Tracker
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Year of Discipline
          </h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Dashboard data={data} />

        <section>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EXERCISES.map((exercise) => {
              const active = exercise.id === activeExercise;

              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => setActiveExercise(exercise.id)}
                  className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-medium transition-colors sm:text-base ${
                    active
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-border bg-surface text-muted hover:border-accent/20 hover:text-text'
                  }`}
                >
                  {exercise.shortLabel}
                </button>
              );
            })}
          </div>

          <ExerciseTab
            exercise={activeConfig}
            entries={data.exercises[activeExercise]}
            onAdd={(date, amount) =>
              addExerciseEntry(activeExercise, date, amount)
            }
          />
        </section>

        <DailyHabits
          habits={data.habits}
          selectedDate={habitDate}
          onDateChange={setHabitDate}
          onToggle={toggleHabit}
        />

        <WeeklyFast
          weeklyFast={data.weeklyFast}
          onToggle={toggleWeeklyFast}
        />

        <QuarterlyFasts
          quarterlyFasts={data.quarterlyFasts}
          onUpdate={updateQuarterlyFast}
        />
      </main>
    </div>
  );
}
