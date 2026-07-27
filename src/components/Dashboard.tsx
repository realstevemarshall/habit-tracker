import {
  EXERCISES,
  HABITS,
  type AppData,
} from '../data/constants';
import {
  daysRemainingUntilBirthday,
  formatNumber,
  getEntriesForTrackingYear,
  getHabitCompletionRate,
  getProgressPercent,
  getTotalForEntries,
  getWeeklyFastCount,
  isOnTrack,
} from '../utils/dates';
import { ProgressBar } from './ProgressBar';

interface DashboardProps {
  data: AppData;
}

export function Dashboard({ data }: DashboardProps) {
  const habitRate = getHabitCompletionRate(data.habits, HABITS.length);
  const weeklyFastCount = getWeeklyFastCount(data.weeklyFast);
  const quarterlyCompleted = Object.values(data.quarterlyFasts).filter(
    (fast) => fast.completed,
  ).length;
  const daysLeft = daysRemainingUntilBirthday();

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted">
            Tracking year: Jul 24, 2026 – Jul 23, 2027
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm">
          <span className="text-muted">Days until 50th birthday</span>
          <p className="text-2xl font-semibold text-accent">{daysLeft}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXERCISES.map((exercise) => {
          const entries = getEntriesForTrackingYear(
            data.exercises[exercise.id],
          );
          const total = getTotalForEntries(entries);
          const percent = getProgressPercent(total, exercise.yearlyTarget);
          const onTrack = isOnTrack(total, exercise.yearlyTarget);

          return (
            <article
              key={exercise.id}
              className="rounded-xl border border-border bg-surface-raised p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-medium">{exercise.shortLabel}</h3>
                <span
                  className={`text-xs font-medium ${
                    onTrack ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {onTrack ? 'On track' : 'Behind pace'}
                </span>
              </div>
              <p className="mb-1 text-2xl font-semibold tabular-nums">
                {formatNumber(total)}
                <span className="ml-1 text-sm font-normal text-muted">
                  / {formatNumber(exercise.yearlyTarget)}
                </span>
              </p>
              <ProgressBar percent={percent} onTrack={onTrack} />
              <p className="mt-2 text-xs text-muted">
                {formatNumber(percent, 1)}% of yearly goal
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-sm text-muted">Habit completion</h3>
          <p className="text-2xl font-semibold tabular-nums">
            {formatNumber(habitRate, 1)}%
          </p>
          <ProgressBar percent={habitRate} onTrack={habitRate >= 70} />
        </article>

        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-sm text-muted">Weekly fast days</h3>
          <p className="text-2xl font-semibold tabular-nums">
            {weeklyFastCount}
            <span className="ml-1 text-sm font-normal text-muted">/ 52</span>
          </p>
          <ProgressBar
            percent={getProgressPercent(weeklyFastCount, 52)}
            onTrack={weeklyFastCount >= 1}
          />
        </article>

        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-sm text-muted">96-hour fasts</h3>
          <p className="text-2xl font-semibold tabular-nums">
            {quarterlyCompleted}
            <span className="ml-1 text-sm font-normal text-muted">/ 4</span>
          </p>
          <ProgressBar
            percent={getProgressPercent(quarterlyCompleted, 4)}
            onTrack={quarterlyCompleted > 0}
          />
        </article>
      </div>
    </section>
  );
}
