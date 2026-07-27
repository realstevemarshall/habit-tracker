import { HABITS, type AppData } from '../data/constants';
import { formatDisplayDate } from '../utils/dates';
import { Tooltip } from './Tooltip';

interface DailyHabitsProps {
  habits: AppData['habits'];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onToggle: (date: string, habitId: string, checked: boolean) => void;
}

export function DailyHabits({
  habits,
  selectedDate,
  onDateChange,
  onToggle,
}: DailyHabitsProps) {
  const dayHabits = habits[selectedDate] ?? {};
  const completedCount = HABITS.filter((habit) => dayHabits[habit.id]).length;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Daily Habits</h2>
          <p className="text-sm text-muted">
            {completedCount} of {HABITS.length} complete for{' '}
            {formatDisplayDate(selectedDate)}
          </p>
        </div>
        <label className="flex flex-col gap-2 sm:min-w-48">
          <span className="text-sm text-muted">Habit date</span>
          <input
            type="date"
            value={selectedDate}
            min="2026-07-24"
            max="2027-07-23"
            onChange={(event) => onDateChange(event.target.value)}
            className="min-h-11 rounded-xl border border-border bg-surface-raised px-3 outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          />
        </label>
      </div>

      <ul className="grid gap-3">
        {HABITS.map((habit) => {
          const checked = Boolean(dayHabits[habit.id]);

          return (
            <li key={habit.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 transition-colors hover:border-accent/30">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    onToggle(selectedDate, habit.id, event.target.checked)
                  }
                  className="h-5 w-5 shrink-0 rounded border-border bg-background accent-accent"
                />
                <span className="flex-1 text-sm leading-snug sm:text-base">
                  {habit.label}
                </span>
                <Tooltip content={habit.description} />
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
