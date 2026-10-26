import {
  BIRTHDAY_50,
  HABIT_COMPLETION_TARGET,
  HABIT_GOAL_DAYS,
  TRACKING_DAYS,
  TRACKING_END,
  TRACKING_START,
  type AppData,
  type ExerciseEntry,
  type ExerciseId,
} from '../data/constants';

const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey(): string {
  return formatDateKey(new Date());
}

export function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

/** Whole calendar days from a to b (DST-safe). */
export function daysBetween(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / DAY_MS);
}

export const TRACKING_START_KEY = formatDateKey(TRACKING_START);
export const TRACKING_END_KEY = formatDateKey(TRACKING_END);

export function isWithinTrackingPeriod(dateKey: string): boolean {
  return dateKey >= TRACKING_START_KEY && dateKey <= TRACKING_END_KEY;
}

/** Keep a date inside the tracking period (used for date-picker defaults). */
export function clampToTrackingPeriod(dateKey: string): string {
  if (dateKey < TRACKING_START_KEY) return TRACKING_START_KEY;
  if (dateKey > TRACKING_END_KEY) return TRACKING_END_KEY;
  return dateKey;
}

export function daysInTrackingPeriod(): number {
  return TRACKING_DAYS;
}

export function dayIndexInTrackingPeriod(dateKey: string): number {
  return daysBetween(TRACKING_START, parseDateKey(dateKey));
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function trackingPeriodLabel(): string {
  return `${formatShortDate(TRACKING_START)} – ${formatShortDate(TRACKING_END)}`;
}

export function daysRemainingUntilBirthday(fromDate = new Date()): number {
  return Math.max(0, daysBetween(fromDate, BIRTHDAY_50));
}

export function getWeekKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return formatDateKey(monday);
}

/** A week (keyed by its Monday) counts if any of its days fall in the period. */
export function isWeekWithinTrackingPeriod(weekKey: string): boolean {
  const sunday = addDays(weekKey, 6);
  return sunday >= TRACKING_START_KEY && weekKey <= TRACKING_END_KEY;
}

export function formatDisplayDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function getEntriesForTrackingPeriod(
  entries: ExerciseEntry[],
): ExerciseEntry[] {
  return entries.filter((entry) => isWithinTrackingPeriod(entry.date));
}

export function getTotalForEntries(entries: ExerciseEntry[]): number {
  // Round to avoid floating-point noise from 0.5-mile adds.
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return Math.round(total * 100) / 100;
}

export function getCumulativeByDate(
  entries: ExerciseEntry[],
): Map<string, number> {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const cumulative = new Map<string, number>();
  let running = 0;

  for (const entry of sorted) {
    running += entry.amount;
    cumulative.set(entry.date, running);
  }

  return cumulative;
}

export interface ChartPoint {
  day: number;
  date: string;
  actual: number | null;
  ideal: number;
}

export function buildChartData(
  entries: ExerciseEntry[],
  goalTarget: number,
): ChartPoint[] {
  const periodEntries = getEntriesForTrackingPeriod(entries);
  const cumulative = getCumulativeByDate(periodEntries);
  const totalDays = daysInTrackingPeriod();
  const points: ChartPoint[] = [];

  let lastActual = 0;
  for (let day = 0; day < totalDays; day += 1) {
    const dateKey = addDays(TRACKING_START_KEY, day);
    if (cumulative.has(dateKey)) {
      lastActual = cumulative.get(dateKey)!;
    }

    points.push({
      day: day + 1,
      date: dateKey,
      actual: day === 0 || cumulative.size > 0 ? lastActual : null,
      ideal: (goalTarget / totalDays) * (day + 1),
    });
  }

  return points;
}

export function getProgressPercent(total: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, (total / target) * 100);
}

/** Days of the period that have started, including today (0 before start). */
export function getElapsedDaysInTrackingPeriod(asOf = new Date()): number {
  const asOfKey = formatDateKey(asOf);
  if (asOfKey < TRACKING_START_KEY) return 0;
  if (asOfKey > TRACKING_END_KEY) return daysInTrackingPeriod();
  return dayIndexInTrackingPeriod(asOfKey) + 1;
}

/** Days left in the period, counting today (full length before start). */
export function getDaysLeftIncludingToday(asOf = new Date()): number {
  const asOfKey = formatDateKey(asOf);
  if (asOfKey < TRACKING_START_KEY) return daysInTrackingPeriod();
  if (asOfKey > TRACKING_END_KEY) return 0;
  return daysBetween(asOf, TRACKING_END) + 1;
}

export type PaceStatus = 'not-started' | 'ahead' | 'on-pace' | 'behind' | 'done';

export interface PaceInfo {
  status: PaceStatus;
  /** Even daily pace for the whole period (e.g. 25/day). */
  baselinePerDay: number;
  /** What's needed per day from today (including today) to hit the goal. */
  neededPerDay: number;
  remaining: number;
  daysLeft: number;
  /** How far ahead (+) or behind (−) the ideal line, as of the end of yesterday. */
  difference: number;
}

/**
 * Pace is judged against where you should be at the END of yesterday, so you
 * are not marked "behind" first thing in the morning. If you've already
 * covered today's share too, you're "ahead".
 */
export function getPaceInfo(
  total: number,
  target: number,
  asOf = new Date(),
): PaceInfo {
  const totalDays = daysInTrackingPeriod();
  const baselinePerDay = target / totalDays;
  const elapsed = getElapsedDaysInTrackingPeriod(asOf);
  const daysLeft = getDaysLeftIncludingToday(asOf);
  const remaining = Math.max(0, target - total);
  const neededPerDay = daysLeft > 0 ? remaining / daysLeft : remaining;
  const expectedThroughYesterday = baselinePerDay * Math.max(0, elapsed - 1);
  const expectedThroughToday = baselinePerDay * elapsed;
  const difference = total - expectedThroughYesterday;

  let status: PaceStatus;
  if (remaining <= 0) status = 'done';
  else if (elapsed === 0) status = 'not-started';
  else if (total >= expectedThroughToday) status = 'ahead';
  else if (total >= expectedThroughYesterday) status = 'on-pace';
  else status = 'behind';

  return {
    status,
    baselinePerDay,
    neededPerDay,
    remaining,
    daysLeft,
    difference,
  };
}

export function paceStatusLabel(status: PaceStatus): string {
  switch (status) {
    case 'done':
      return 'Goal reached';
    case 'not-started':
      return 'Starts soon';
    case 'ahead':
      return 'Ahead of pace';
    case 'on-pace':
      return 'On pace';
    case 'behind':
      return 'Behind pace';
  }
}

export function isPaceGood(status: PaceStatus): boolean {
  return status !== 'behind';
}

export function getWeeklyFastCount(
  weeklyFast: Record<string, boolean>,
): number {
  return Object.entries(weeklyFast).filter(
    ([weekKey, completed]) => completed && isWeekWithinTrackingPeriod(weekKey),
  ).length;
}

export function getHabitCompletionRate(
  habits: Record<string, Record<string, boolean>>,
  habitCount: number,
): number {
  const relevantDates = Object.keys(habits).filter(isWithinTrackingPeriod);
  if (relevantDates.length === 0 || habitCount === 0) return 0;

  const completed = relevantDates.reduce((sum, dateKey) => {
    const dayHabits = habits[dateKey] ?? {};
    const checked = Object.values(dayHabits).filter(Boolean).length;
    return sum + checked;
  }, 0);

  return (completed / (relevantDates.length * habitCount)) * 100;
}

export function getAmountForDate(
  entries: ExerciseEntry[],
  dateKey: string,
): number {
  const total = entries
    .filter((entry) => entry.date === dateKey)
    .reduce((sum, entry) => sum + entry.amount, 0);
  return Math.round(total * 100) / 100;
}

export function getTrackingPeriodDateKeys(upTo?: string): string[] {
  const keys: string[] = [];
  const end = upTo ?? todayKey();
  const cappedEnd = end > TRACKING_END_KEY ? TRACKING_END_KEY : end;
  let cursor = TRACKING_START_KEY;

  while (cursor <= cappedEnd) {
    keys.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return keys;
}

export function getHabitCheckedCount(
  habits: Record<string, Record<string, boolean>>,
  habitId: string,
  upTo?: string,
): number {
  return getTrackingPeriodDateKeys(upTo).filter(
    (dateKey) => habits[dateKey]?.[habitId] === true,
  ).length;
}

export function isHabitOnTrack(
  habits: Record<string, Record<string, boolean>>,
  habitId: string,
  asOf = new Date(),
): boolean {
  const checked = getHabitCheckedCount(
    habits,
    habitId,
    formatDateKey(asOf),
  );
  const elapsedDays = getElapsedDaysInTrackingPeriod(asOf);
  // Judge against the end of yesterday, so today isn't counted until it's done.
  const expected =
    (HABIT_GOAL_DAYS / daysInTrackingPeriod()) * Math.max(0, elapsedDays - 1);
  return checked >= expected;
}

export function getDayHabitCompletionPercent(
  habits: Record<string, Record<string, boolean>>,
  dateKey: string,
  habitCount: number,
): number {
  if (habitCount === 0) return 0;
  const dayHabits = habits[dateKey] ?? {};
  const checked = Object.values(dayHabits).filter(Boolean).length;
  return (checked / habitCount) * 100;
}

export function getPeriodToDateHabitCompletionPercent(
  habits: Record<string, Record<string, boolean>>,
  habitCount: number,
  asOf = new Date(),
): number {
  const elapsedDays = getElapsedDaysInTrackingPeriod(asOf);
  if (elapsedDays === 0 || habitCount === 0) return 0;

  const dateKeys = getTrackingPeriodDateKeys(formatDateKey(asOf));
  const checked = dateKeys.reduce((sum, dateKey) => {
    const dayHabits = habits[dateKey] ?? {};
    return sum + Object.values(dayHabits).filter(Boolean).length;
  }, 0);

  return (checked / (elapsedDays * habitCount)) * 100;
}

// ---------- Streaks ----------

export interface StreakInfo {
  current: number;
  best: number;
}

/**
 * Consecutive-day streaks inside the tracking period.
 * The current streak stays alive through today: if today isn't logged yet,
 * it counts back from yesterday.
 */
export function computeStreak(
  qualifies: (dateKey: string) => boolean,
  asOf = new Date(),
): StreakInfo {
  const today = formatDateKey(asOf);
  const keys = getTrackingPeriodDateKeys(today);

  let best = 0;
  let run = 0;
  for (const key of keys) {
    if (qualifies(key)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  let current = 0;
  let cursor =
    keys.length > 0 && keys[keys.length - 1] === today && !qualifies(today)
      ? addDays(today, -1)
      : today;
  if (cursor > TRACKING_END_KEY) cursor = TRACKING_END_KEY;
  while (cursor >= TRACKING_START_KEY && qualifies(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, best: Math.max(best, current) };
}

/** Workout streak: days with any exercise logged (net amount above zero). */
export function getWorkoutStreak(
  exercises: AppData['exercises'],
  asOf = new Date(),
): StreakInfo {
  const perDay = new Map<string, number>();
  for (const list of Object.values(exercises)) {
    for (const entry of list) {
      perDay.set(entry.date, (perDay.get(entry.date) ?? 0) + entry.amount);
    }
  }
  return computeStreak((key) => (perDay.get(key) ?? 0) > 0.0001, asOf);
}

/** Habit streak: days with at least the target share (80%) of habits checked. */
export function getHabitStreak(
  habits: AppData['habits'],
  habitCount: number,
  asOf = new Date(),
): StreakInfo {
  return computeStreak(
    (key) =>
      getDayHabitCompletionPercent(habits, key, habitCount) >=
      HABIT_COMPLETION_TARGET,
    asOf,
  );
}

export type { ExerciseId };
