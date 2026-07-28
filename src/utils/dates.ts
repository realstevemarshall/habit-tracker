import {
  BIRTHDAY_50,
  HABIT_DAYS_IN_YEAR,
  HABIT_YEARLY_GOAL,
  TRACKING_YEAR_END,
  TRACKING_YEAR_START,
  type ExerciseEntry,
  type ExerciseId,
} from '../data/constants';

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

export function isWithinTrackingYear(dateKey: string): boolean {
  const date = parseDateKey(dateKey);
  return date >= TRACKING_YEAR_START && date <= TRACKING_YEAR_END;
}

export function daysInTrackingYear(): number {
  const ms =
    TRACKING_YEAR_END.getTime() -
    TRACKING_YEAR_START.getTime() +
    24 * 60 * 60 * 1000;
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function dayIndexInTrackingYear(dateKey: string): number {
  const date = parseDateKey(dateKey);
  const diff =
    date.getTime() -
    TRACKING_YEAR_START.getTime() +
    date.getTimezoneOffset() * 60 * 1000 -
    (TRACKING_YEAR_START.getTimezoneOffset() * 60 * 1000);
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export function daysRemainingUntilBirthday(fromDate = new Date()): number {
  const start = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  const end = new Date(
    BIRTHDAY_50.getFullYear(),
    BIRTHDAY_50.getMonth(),
    BIRTHDAY_50.getDate(),
  );
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function getWeekKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return formatDateKey(monday);
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

export function getEntriesForTrackingYear(
  entries: ExerciseEntry[],
): ExerciseEntry[] {
  return entries.filter((entry) => isWithinTrackingYear(entry.date));
}

export function getTotalForEntries(entries: ExerciseEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
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
  yearlyTarget: number,
): ChartPoint[] {
  const yearEntries = getEntriesForTrackingYear(entries);
  const cumulative = getCumulativeByDate(yearEntries);
  const totalDays = daysInTrackingYear();
  const points: ChartPoint[] = [];

  let lastActual = 0;
  for (let day = 0; day <= totalDays; day += 1) {
    const date = new Date(TRACKING_YEAR_START);
    date.setDate(TRACKING_YEAR_START.getDate() + day);
    const dateKey = formatDateKey(date);
    if (cumulative.has(dateKey)) {
      lastActual = cumulative.get(dateKey)!;
    }

    points.push({
      day,
      date: dateKey,
      actual: day === 0 || cumulative.size > 0 ? lastActual : null,
      ideal: (yearlyTarget / totalDays) * day,
    });
  }

  return points;
}

export function getProgressPercent(total: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, (total / target) * 100);
}

export function isOnTrack(total: number, target: number, asOf = new Date()): boolean {
  const totalDays = daysInTrackingYear();
  const elapsedDays = Math.min(
    totalDays,
    Math.max(0, dayIndexInTrackingYear(formatDateKey(asOf)) + 1),
  );
  const expected = (target / totalDays) * elapsedDays;
  return total >= expected;
}

export function getWeeklyFastCount(
  weeklyFast: Record<string, boolean>,
): number {
  return Object.entries(weeklyFast).filter(
    ([weekKey, completed]) => completed && isWithinTrackingYear(weekKey),
  ).length;
}

export function getHabitCompletionRate(
  habits: Record<string, Record<string, boolean>>,
  habitCount: number,
): number {
  const relevantDates = Object.keys(habits).filter(isWithinTrackingYear);
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
  return entries
    .filter((entry) => entry.date === dateKey)
    .reduce((sum, entry) => sum + entry.amount, 0);
}

export function getElapsedDaysInTrackingYear(asOf = new Date()): number {
  const asOfKey = formatDateKey(asOf);
  if (!isWithinTrackingYear(asOfKey)) {
    if (parseDateKey(asOfKey) < TRACKING_YEAR_START) return 0;
    return daysInTrackingYear();
  }
  return dayIndexInTrackingYear(asOfKey) + 1;
}

export function getTrackingYearDateKeys(upTo?: string): string[] {
  const keys: string[] = [];
  const endDate = upTo ? parseDateKey(upTo) : new Date();
  const cappedEnd =
    endDate > TRACKING_YEAR_END ? TRACKING_YEAR_END : endDate;
  const cursor = new Date(TRACKING_YEAR_START);

  while (cursor <= cappedEnd) {
    keys.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

export function getHabitCheckedCount(
  habits: Record<string, Record<string, boolean>>,
  habitId: string,
  upTo?: string,
): number {
  return getTrackingYearDateKeys(upTo).filter(
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
  const elapsedDays = getElapsedDaysInTrackingYear(asOf);
  const expected = (HABIT_YEARLY_GOAL / HABIT_DAYS_IN_YEAR) * elapsedDays;
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

export function getYearToDateHabitCompletionPercent(
  habits: Record<string, Record<string, boolean>>,
  habitCount: number,
  asOf = new Date(),
): number {
  const elapsedDays = getElapsedDaysInTrackingYear(asOf);
  if (elapsedDays === 0 || habitCount === 0) return 0;

  const dateKeys = getTrackingYearDateKeys(formatDateKey(asOf));
  const checked = dateKeys.reduce((sum, dateKey) => {
    const dayHabits = habits[dateKey] ?? {};
    return sum + Object.values(dayHabits).filter(Boolean).length;
  }, 0);

  return (checked / (elapsedDays * habitCount)) * 100;
}

export type { ExerciseId };
