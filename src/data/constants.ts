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
  yearlyTarget: number;
  quickAdd: number;
  unit: string;
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

export const TRACKING_YEAR_START = new Date(2026, 6, 24);
export const TRACKING_YEAR_END = new Date(2027, 6, 23);
export const BIRTHDAY_50 = new Date(2027, 6, 24);
export const STORAGE_KEY = 'habit-tracker-data-v1';
export const HABIT_DAYS_IN_YEAR = 365;
export const HABIT_YEARLY_GOAL = 300;
export const HABIT_COMPLETION_TARGET = 80;

export const EXERCISES: ExerciseConfig[] = [
  {
    id: 'pushups',
    label: 'Push-ups',
    shortLabel: 'Push-ups',
    yearlyTarget: 18000,
    quickAdd: 5,
    unit: 'reps',
  },
  {
    id: 'situps',
    label: 'Sit-ups',
    shortLabel: 'Sit-ups',
    yearlyTarget: 18000,
    quickAdd: 5,
    unit: 'reps',
  },
  {
    id: 'pullups',
    label: 'Pull-ups',
    shortLabel: 'Pull-ups',
    yearlyTarget: 2000,
    quickAdd: 5,
    unit: 'reps',
  },
  {
    id: 'miles',
    label: 'Miles',
    shortLabel: 'Miles',
    yearlyTarget: 750,
    quickAdd: 1,
    unit: 'mi',
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
  { id: '2026-08', label: 'August 2026', month: 'August 2026' },
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
