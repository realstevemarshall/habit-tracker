import { WEEKLY_FAST_GOAL, type AppData } from '../data/constants';
import {
  formatDisplayDate,
  getProgressPercent,
  getWeekKey,
  getWeeklyFastCount,
  todayKey,
} from '../utils/dates';
import { ProgressBar } from './ProgressBar';

interface WeeklyFastProps {
  weeklyFast: AppData['weeklyFast'];
  onToggle: (weekKey: string, completed: boolean) => void;
}

export function WeeklyFast({ weeklyFast, onToggle }: WeeklyFastProps) {
  const currentWeekKey = getWeekKey(todayKey());
  const completed = getWeeklyFastCount(weeklyFast);
  const isCurrentWeekComplete = Boolean(weeklyFast[currentWeekKey]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Weekly Fast</h2>
          <p className="text-sm text-muted">
            {completed} of {WEEKLY_FAST_GOAL} fast days by your birthday
          </p>
        </div>
        <p className="text-sm text-muted">
          Week of {formatDisplayDate(currentWeekKey)}
        </p>
      </div>

      <ProgressBar
        percent={getProgressPercent(completed, WEEKLY_FAST_GOAL)}
        onTrack={completed > 0}
      />

      <label className="mt-5 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 transition-colors hover:border-accent/30">
        <input
          type="checkbox"
          checked={isCurrentWeekComplete}
          onChange={(event) => onToggle(currentWeekKey, event.target.checked)}
          className="h-5 w-5 shrink-0 rounded border-border bg-background accent-accent"
        />
        <span className="text-sm sm:text-base">Completed my weekly fast day</span>
      </label>
    </section>
  );
}
