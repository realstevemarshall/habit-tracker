import type { ExerciseConfig } from '../data/constants';
import {
  formatNumber,
  isPaceGood,
  paceStatusLabel,
  type PaceInfo,
} from '../utils/dates';

interface PaceSummaryProps {
  exercise: ExerciseConfig;
  pace: PaceInfo;
  compact?: boolean;
}

/** "Need X/day from here" plus ahead/on/behind status. */
export function PaceSummary({ exercise, pace, compact = false }: PaceSummaryProps) {
  const decimals = exercise.decimals;
  const good = isPaceGood(pace.status);
  const perDayDecimals = exercise.unit === 'mi' ? 2 : 1;
  const diff = Math.abs(pace.difference);

  let detail = '';
  if (pace.status === 'done') {
    detail = 'Goal reached — anything more is a bonus.';
  } else if (pace.status === 'not-started') {
    detail = `Tracking starts soon — plan on ${formatNumber(pace.baselinePerDay, perDayDecimals)} ${exercise.unit}/day.`;
  } else if (pace.status === 'behind') {
    detail = `${formatNumber(diff, decimals)} ${exercise.unit} behind the even pace.`;
  } else if (pace.status === 'ahead') {
    detail = `${formatNumber(diff, decimals)} ${exercise.unit} ahead — today’s share is covered.`;
  } else {
    detail = 'Today’s share still to do.';
  }

  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        good ? 'border-accent/30 bg-accent/5' : 'border-warning/40 bg-warning/5'
      } ${compact ? 'text-xs' : 'text-sm'}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span>
          <span className="text-muted">Need </span>
          <span className="font-semibold tabular-nums text-text">
            {formatNumber(pace.neededPerDay, perDayDecimals)} {exercise.unit}/day
          </span>
          {!compact && (
            <span className="text-muted">
              {' '}
              for the next {pace.daysLeft} days
            </span>
          )}
        </span>
        <span
          className={`font-medium ${good ? 'text-accent' : 'text-warning'}`}
        >
          {paceStatusLabel(pace.status)}
        </span>
      </div>
      {!compact && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </div>
  );
}
