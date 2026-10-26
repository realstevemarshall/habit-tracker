import { useState } from 'react';
import type { AppData, ExerciseConfig } from '../data/constants';
import {
  TRACKING_END_KEY,
  TRACKING_START_KEY,
  buildChartData,
  clampToTrackingPeriod,
  formatDisplayDate,
  formatNumber,
  getAmountForDate,
  getEntriesForTrackingPeriod,
  getPaceInfo,
  getProgressPercent,
  getTotalForEntries,
  isPaceGood,
  todayKey,
} from '../utils/dates';
import { ExerciseChart } from './ExerciseChart';
import { PaceSummary } from './PaceSummary';
import { ProgressBar } from './ProgressBar';

interface ExerciseTabProps {
  exercise: ExerciseConfig;
  entries: AppData['exercises'][keyof AppData['exercises']];
  onAdjust: (date: string, amount: number) => void;
}

export function ExerciseTab({ exercise, entries, onAdjust }: ExerciseTabProps) {
  const [selectedDate, setSelectedDate] = useState(() =>
    clampToTrackingPeriod(todayKey()),
  );
  const periodEntries = getEntriesForTrackingPeriod(entries);
  const total = getTotalForEntries(periodEntries);
  const percent = getProgressPercent(total, exercise.goalTarget);
  const pace = getPaceInfo(total, exercise.goalTarget);
  const good = isPaceGood(pace.status);
  const chartData = buildChartData(entries, exercise.goalTarget);
  const loggedForDate = getAmountForDate(entries, selectedDate);
  const fmt = (value: number) =>
    formatNumber(value, Number.isInteger(value) ? 0 : 1);

  function subtract(delta: number) {
    // Never take a day below zero.
    const amount = Math.min(delta, loggedForDate);
    if (amount > 0) onAdjust(selectedDate, -amount);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Total so far</p>
          <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
            {formatNumber(total, exercise.decimals)}
            <span className="ml-2 text-lg font-normal text-muted">
              {exercise.unit}
            </span>
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted">Goal by birthday</p>
          <p className="text-xl font-medium tabular-nums">
            {formatNumber(exercise.goalTarget)} {exercise.unit}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatNumber(percent, 1)}% done
          </p>
        </div>
      </div>

      <ProgressBar percent={percent} onTrack={good} />

      <div className="mt-4">
        <PaceSummary exercise={exercise} pace={pace} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface-raised p-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-muted">Log date</span>
          <input
            type="date"
            value={selectedDate}
            min={TRACKING_START_KEY}
            max={TRACKING_END_KEY}
            onChange={(event) =>
              event.target.value &&
              setSelectedDate(clampToTrackingPeriod(event.target.value))
            }
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          />
          <span className="text-sm text-muted">
            {formatDisplayDate(selectedDate)} ·{' '}
            <span className="font-semibold text-text tabular-nums">
              {formatNumber(loggedForDate, exercise.decimals)} {exercise.unit}
            </span>{' '}
            logged
          </span>
        </label>

        <p className="mb-2 mt-4 text-xs uppercase tracking-wider text-muted">
          Add
        </p>
        <div className="grid grid-cols-3 gap-3">
          {exercise.quickAdd.map((delta) => (
            <button
              key={`add-${delta}`}
              type="button"
              onClick={() => onAdjust(selectedDate, delta)}
              aria-label={`Add ${delta} ${exercise.unit}`}
              className="min-h-16 rounded-2xl bg-accent px-2 text-2xl font-bold text-background transition-transform active:scale-[0.97] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              +{fmt(delta)}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-4 text-xs uppercase tracking-wider text-muted">
          Undo / correct
        </p>
        <div className="grid grid-cols-3 gap-3">
          {exercise.quickAdd.map((delta) => (
            <button
              key={`sub-${delta}`}
              type="button"
              onClick={() => subtract(delta)}
              disabled={loggedForDate <= 0}
              aria-label={`Subtract ${delta} ${exercise.unit}`}
              className="min-h-12 rounded-xl border border-border bg-surface px-2 text-lg font-semibold text-text transition-transform active:scale-[0.97] hover:border-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-40"
            >
              −{fmt(delta)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface-raised p-4">
        <h3 className="mb-3 text-sm font-medium text-muted">
          Cumulative progress vs. even pace
        </h3>
        <ExerciseChart data={chartData} unit={exercise.unit} />
      </div>
    </section>
  );
}
