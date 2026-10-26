import {
  EXERCISES,
  HABITS,
  HABIT_COMPLETION_TARGET,
  QUARTERLY_FASTS,
  TRACKING_DAYS,
  WEEKLY_FAST_GOAL,
  type AppData,
} from '../data/constants';
import {
  daysRemainingUntilBirthday,
  formatNumber,
  getEntriesForTrackingPeriod,
  getHabitCompletionRate,
  getHabitStreak,
  getPaceInfo,
  getProgressPercent,
  getTotalForEntries,
  getWeeklyFastCount,
  getWorkoutStreak,
  isPaceGood,
  trackingPeriodLabel,
} from '../utils/dates';
import { PaceSummary } from './PaceSummary';
import { ProgressBar } from './ProgressBar';

interface DashboardProps {
  data: AppData;
}

function dayWord(count: number): string {
  return count === 1 ? 'day' : 'days';
}

export function Dashboard({ data }: DashboardProps) {
  const habitRate = getHabitCompletionRate(data.habits, HABITS.length);
  const weeklyFastCount = getWeeklyFastCount(data.weeklyFast);
  const quarterlyCompleted = QUARTERLY_FASTS.filter(
    (window) => data.quarterlyFasts[window.id]?.completed,
  ).length;
  const daysLeft = daysRemainingUntilBirthday();
  const workoutStreak = getWorkoutStreak(data.exercises);
  const habitStreak = getHabitStreak(data.habits, HABITS.length);
  const habitStreakMin = Math.ceil(
    (HABITS.length * HABIT_COMPLETION_TARGET) / 100,
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted">
            Tracking period: {trackingPeriodLabel()} ({TRACKING_DAYS} days)
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm">
          <span className="text-muted">Days until 50th birthday</span>
          <p className="text-2xl font-semibold text-accent">{daysLeft}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="text-sm text-muted">Workout streak</h3>
          <p className="text-3xl font-semibold tabular-nums">
            🔥 {workoutStreak.current}
            <span className="ml-1 text-sm font-normal text-muted">
              {dayWord(workoutStreak.current)}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Best: {workoutStreak.best} · days with any exercise logged
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="text-sm text-muted">Habit streak</h3>
          <p className="text-3xl font-semibold tabular-nums">
            ✅ {habitStreak.current}
            <span className="ml-1 text-sm font-normal text-muted">
              {dayWord(habitStreak.current)}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Best: {habitStreak.best} · days with {habitStreakMin}+ of{' '}
            {HABITS.length} habits done
          </p>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXERCISES.map((exercise) => {
          const entries = getEntriesForTrackingPeriod(
            data.exercises[exercise.id],
          );
          const total = getTotalForEntries(entries);
          const percent = getProgressPercent(total, exercise.goalTarget);
          const pace = getPaceInfo(total, exercise.goalTarget);
          const good = isPaceGood(pace.status);

          return (
            <article
              key={exercise.id}
              className="rounded-xl border border-border bg-surface-raised p-4"
            >
              <h3 className="mb-2 font-medium">{exercise.shortLabel}</h3>
              <p className="mb-1 text-2xl font-semibold tabular-nums">
                {formatNumber(total, exercise.decimals)}
                <span className="ml-1 text-sm font-normal text-muted">
                  / {formatNumber(exercise.goalTarget)}
                </span>
              </p>
              <ProgressBar percent={percent} onTrack={good} />
              <p className="mb-3 mt-2 text-xs text-muted">
                {formatNumber(percent, 1)}% of birthday goal
              </p>
              <PaceSummary exercise={exercise} pace={pace} compact />
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-sm text-muted">Habit completion</h3>
          <p className="text-2xl font-semibold tabular-nums">
            {formatNumber(habitRate, 1)}%
            <span className="ml-1 text-sm font-normal text-muted">
              target {HABIT_COMPLETION_TARGET}%
            </span>
          </p>
          <ProgressBar
            percent={habitRate}
            onTrack={habitRate >= HABIT_COMPLETION_TARGET}
          />
        </article>

        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-sm text-muted">Weekly fast days</h3>
          <p className="text-2xl font-semibold tabular-nums">
            {weeklyFastCount}
            <span className="ml-1 text-sm font-normal text-muted">
              / {WEEKLY_FAST_GOAL}
            </span>
          </p>
          <ProgressBar
            percent={getProgressPercent(weeklyFastCount, WEEKLY_FAST_GOAL)}
            onTrack={weeklyFastCount >= 1}
          />
        </article>

        <article className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="mb-1 text-sm text-muted">96-hour fasts</h3>
          <p className="text-2xl font-semibold tabular-nums">
            {quarterlyCompleted}
            <span className="ml-1 text-sm font-normal text-muted">
              / {QUARTERLY_FASTS.length}
            </span>
          </p>
          <ProgressBar
            percent={getProgressPercent(
              quarterlyCompleted,
              QUARTERLY_FASTS.length,
            )}
            onTrack={quarterlyCompleted > 0}
          />
        </article>
      </div>
    </section>
  );
}
