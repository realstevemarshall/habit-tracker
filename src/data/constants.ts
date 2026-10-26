export type ExerciseId = 'pushups' | 'situps' | 'pullups' | 'miles';

export interface ExerciseEntry {
  date: string;
  amount: number;
}

export interface QuarterlyFastRecord {
  completed: boolean;
  startDate?: string;
  endDate?: string;
}

export interface AppData {
  exercises: Record<ExerciseId, ExerciseEntry[]>;
  habits: Record<string, Record<string, boolean>>;
  weeklyFast: Record<string, boolean>;
  quarterlyFasts: Record<string, QuarterlyFastRecord>;
}

export interface ExerciseConfig {
  id: ExerciseId;
  label: string;
  shortLabel: string;
  /** Total to reach by the end of the tracking period. */
  goalTarget: number;
  /** Quick-add button sizes, smallest first. */
  quickAdd: number[];
  unit: string;
  /** Decimal places to show (miles use 1). */
  decimals: number;
}

export interface HabitDefinition {
  id: string;
  label: string;
  description: string;
}

export interface QuarterlyFastWindow {
  id: string;
  label: string;
  month: string;
}

// Tracking period: Oct 27, 2026 through the day before the 50th birthday.
// Everything else (period length, daily pace, date-picker limits, labels)
// is derived from these dates, so change them here only.
export const TRACKING_START = new Date(2026, 9, 27);
export const TRACKING_END = new Date(2027, 6, 23);
export const BIRTHDAY_50 = new Date(2027, 6, 24);

/** Number of days in the tracking period, inclusive (270). */
export const TRACKING_DAYS =
  Math.round(
    (Date.UTC(
      TRACKING_END.getFullYear(),
      TRACKING_END.getMonth(),
      TRACKING_END.getDate(),
    ) -
      Date.UTC(
        TRACKING_START.getFullYear(),
        TRACKING_START.getMonth(),
        TRACKING_START.getDate(),
      )) /
      (24 * 60 * 60 * 1000),
  ) + 1;

// v2 = fresh start on Oct 27, 2026. Old v1 data is left untouched in the
// browser under 'habit-tracker-data-v1'.
export const STORAGE_KEY = 'habit-tracker-data-v2';

/** Percent of days each habit should be done (80%). */
export const HABIT_COMPLETION_TARGET = 80;
/** Days per habit to hit by the birthday: 80% of 270 = 216. */
export const HABIT_GOAL_DAYS = Math.round(
  (TRACKING_DAYS * HABIT_COMPLETION_TARGET) / 100,
);
/** Weekly fast days to hit by the birthday (one per week, 39). */
export const WEEKLY_FAST_GOAL = Math.ceil(TRACKING_DAYS / 7);

export const EXERCISES: ExerciseConfig[] = [
  {
    id: 'pushups',
    label: 'Push-ups',
    shortLabel: 'Push-ups',
    goalTarget: 6750, // 25 per day
    quickAdd: [5, 10, 25],
    unit: 'reps',
    decimals: 0,
  },
  {
    id: 'situps',
    label: 'Sit-ups',
    shortLabel: 'Sit-ups',
    goalTarget: 6750, // 25 per day
    quickAdd: [5, 10, 25],
    unit: 'reps',
    decimals: 0,
  },
  {
    id: 'pullups',
    label: 'Pull-ups',
    shortLabel: 'Pull-ups',
    goalTarget: 1480, // previous 2,000/yr pace prorated to 270 days
    quickAdd: [5, 10, 25],
    unit: 'reps',
    decimals: 0,
  },
  {
    id: 'miles',
    label: 'Miles',
    shortLabel: 'Miles',
    goalTarget: 540, // 2 per day
    quickAdd: [0.5, 1, 2],
    unit: 'mi',
    decimals: 1,
  },
];

export const HABITS: HabitDefinition[] = [
  {
    id: 'water',
    label: 'Drink a full gallon of water',
    description: 'Drink a full gallon of water throughout the day.',
  },
  {
    id: 'alcohol',
    label: 'Zero alcohol',
    description: 'No alcoholic beverages today.',
  },
  {
    id: 'mobility',
    label: 'Five minutes of mobility or stretching',
    description: 'At least five minutes of mobility work or stretching.',
  },
  {
    id: 'sleep',
    label: 'At least seven hours of quality sleep',
    description: 'Get at least seven hours of quality, restorative sleep.',
  },
  {
    id: 'protein',
    label: 'Hit 150 grams of protein',
    description: 'Consume at least 150 grams of protein for the day.',
  },
  {
    id: 'mindfulness',
    label: 'Five minutes of mindfulness, meditation, or journaling',
    description:
      'Spend at least five minutes on mindfulness, meditation, or journaling.',
  },
  {
    id: 'reading',
    label: 'Read at least ten pages or one chapter',
    description: 'Read at least ten pages or one full chapter of a book.',
  },
  {
    id: 'no-late-food',
    label: 'No food within three hours of bedtime',
    description: 'Stop eating at least three hours before going to bed.',
  },
  {
    id: 'no-sweets',
    label: 'No dessert or sweets',
    description: 'Avoid dessert, candy, and other sweets for the day.',
  },
  {
    id: 'vitamins',
    label: 'Take daily vitamins or supplements',
    description: 'Take your daily vitamins and supplements.',
  },
  {
    id: 'no-early-meals',
    label: 'No meals before 11am',
    description: 'Do not eat any meals before 11:00 AM.',
  },
];

export const QUARTERLY_FASTS: QuarterlyFastWindow[] = [
  { id: '2026-11', label: 'November 2026', month: 'November 2026' },
  { id: '2027-02', label: 'February 2027', month: 'February 2027' },
  { id: '2027-05', label: 'May 2027', month: 'May 2027' },
];

export function createDefaultData(): AppData {
  return {
    exercises: {
      pushups: [],
      situps: [],
      pullups: [],
      miles: [],
    },
    habits: {},
    weeklyFast: {},
    quarterlyFasts: Object.fromEntries(
      QUARTERLY_FASTS.map((fast) => [fast.id, { completed: false }]),
    ),
  };
}
