import {
  HABITS,
  HABIT_COMPLETION_TARGET,
  HABIT_DAYS_IN_YEAR,
  HABIT_YEARLY_GOAL,
  type AppData,
} from '../data/constants';
import {
  formatDisplayDate,
  formatNumber,
  getDayHabitCompletionPercent,
  getHabitCheckedCount,
  getYearToDateHabitCompletionPercent,
  isHabitOnTrack,
  todayKey,
} from '../utils/dates';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
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
  const today = todayKey();
  const todayCompletion = getDayHabitCompletionPercent(
    habits,
    today,
    HABITS.length,
  );
  const ytdCompletion = getYearToDateHabitCompletionPercent(
    habits,
    HABITS.length,
  );
  const todayOnTrack = todayCompletion >= HABIT_COMPLETION_TARGET;
  const ytdOnTrack = ytdCompletion >= HABIT_COMPLETION_TARGET;

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

      <ul key={selectedDate} className="grid gap-3">
        {HABITS.map((habit) => {
          const checked = dayHabits[habit.id] === true;
          const checkedCount = getHabitCheckedCount(habits, habit.id);
          const habitOnTrack = isHabitOnTrack(habits, habit.id);

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
                <span className="hidden text-xs tabular-nums text-muted sm:inline">
                  {checkedCount} of {HABIT_DAYS_IN_YEAR} (goal{' '}
                  {HABIT_YEARLY_GOAL})
                </span>
                <StatusBadge onTrack={habitOnTrack} />
                <Tooltip content={habit.description} />
              </label>
              <p className="mt-1 px-1 text-xs tabular-nums text-muted sm:hidden">
                {checkedCount} of {HABIT_DAYS_IN_YEAR} (goal {HABIT_YEARLY_GOAL})
                ·{' '}
                <span className={habitOnTrack ? 'text-accent' : 'text-muted'}>
                  {habitOnTrack ? 'On track' : 'Off track'}
                </span>
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Today&apos;s completion</h3>
            <StatusBadge onTrack={todayOnTrack} />
          </div>
          <p className="mb-2 text-2xl font-semibold tabular-nums">
            {formatNumber(todayCompletion, 1)}%
            <span className="ml-2 text-sm font-normal text-muted">
              target {HABIT_COMPLETION_TARGET}%
            </span>
          </p>
          <ProgressBar
            percent={todayCompletion}
            onTrack={todayOnTrack}
          />
        </article>

        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Year-to-date completion</h3>
            <StatusBadge onTrack={ytdOnTrack} />
          </div>
          <p className="mb-2 text-2xl font-semibold tabular-nums">
            {formatNumber(ytdCompletion, 1)}%
            <span className="ml-2 text-sm font-normal text-muted">
              target {HABIT_COMPLETION_TARGET}%
            </span>
          </p>
          <ProgressBar percent={ytdCompletion} onTrack={ytdOnTrack} />
        </article>
      </div>
    </section>
  );
}
