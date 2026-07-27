import { useState } from 'react';
import type { AppData, ExerciseConfig } from '../data/constants';
import {
  buildChartData,
  formatDisplayDate,
  formatNumber,
  getAmountForDate,
  getEntriesForTrackingYear,
  getProgressPercent,
  getTotalForEntries,
  isOnTrack,
  todayKey,
} from '../utils/dates';
import { ExerciseChart } from './ExerciseChart';
import { ProgressBar } from './ProgressBar';

interface ExerciseTabProps {
  exercise: ExerciseConfig;
  entries: AppData['exercises'][keyof AppData['exercises']];
  onAdd: (date: string, amount: number) => void;
}

export function ExerciseTab({ exercise, entries, onAdd }: ExerciseTabProps) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const yearEntries = getEntriesForTrackingYear(entries);
  const total = getTotalForEntries(yearEntries);
  const percent = getProgressPercent(total, exercise.yearlyTarget);
  const onTrack = isOnTrack(total, exercise.yearlyTarget);
  const chartData = buildChartData(entries, exercise.yearlyTarget);
  const loggedToday = getAmountForDate(entries, selectedDate);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Year-to-date total</p>
          <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
            {formatNumber(total)}
            <span className="ml-2 text-lg font-normal text-muted">
              {exercise.unit}
            </span>
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted">Yearly goal</p>
          <p className="text-xl font-medium tabular-nums">
            {formatNumber(exercise.yearlyTarget)} {exercise.unit}
          </p>
          <p
            className={`mt-1 text-sm font-medium ${
              onTrack ? 'text-accent' : 'text-muted'
            }`}
          >
            {onTrack ? 'On track' : 'Behind ideal pace'} ·{' '}
            {formatNumber(percent, 1)}%
          </p>
        </div>
      </div>

      <ProgressBar percent={percent} onTrack={onTrack} />

      <div className="mt-6 rounded-xl border border-border bg-surface-raised p-4">
        <h3 className="mb-3 text-sm font-medium text-muted">
          Cumulative progress vs. ideal pace
        </h3>
        <ExerciseChart data={chartData} unit={exercise.unit} />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-muted">Log date</span>
          <input
            type="date"
            value={selectedDate}
            min="2026-07-24"
            max="2027-07-23"
            onChange={(event) => setSelectedDate(event.target.value)}
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          />
          <span className="text-xs text-muted">
            {formatDisplayDate(selectedDate)} · {formatNumber(loggedToday)}{' '}
            {exercise.unit} logged
          </span>
        </label>

        <button
          type="button"
          onClick={() => onAdd(selectedDate, exercise.quickAdd)}
          className="min-h-12 rounded-xl bg-accent px-6 text-base font-semibold text-background transition-transform active:scale-[0.98] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          +{exercise.quickAdd} {exercise.unit}
        </button>
      </div>
    </section>
  );
}
