import { useCallback, useEffect, useState } from 'react';
import {
  STORAGE_KEY,
  createDefaultData,
  type AppData,
  type ExerciseEntry,
  type ExerciseId,
  type QuarterlyFastRecord,
} from '../data/constants';
import { todayKey } from '../utils/dates';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EXERCISE_IDS: ExerciseId[] = ['pushups', 'situps', 'pullups', 'miles'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function migrateHabits(
  habits: unknown,
): Record<string, Record<string, boolean>> {
  if (!isRecord(habits)) return {};

  const entries = Object.entries(habits);
  const isLegacyFlat = entries.some(([, value]) => typeof value === 'boolean');

  if (isLegacyFlat) {
    const migrated: Record<string, Record<string, boolean>> = {};
    const dateKey = todayKey();
    migrated[dateKey] = {};

    for (const [key, value] of entries) {
      if (typeof value === 'boolean') {
        migrated[dateKey][key] = value;
      }
    }

    return migrated;
  }

  const result: Record<string, Record<string, boolean>> = {};
  for (const [dateKey, dayHabits] of entries) {
    if (isRecord(dayHabits)) {
      result[dateKey] = Object.fromEntries(
        Object.entries(dayHabits).filter(
          ([, value]) => typeof value === 'boolean',
        ),
      ) as Record<string, boolean>;
    }
  }

  return result;
}

function normalizeEntries(value: unknown): ExerciseEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is ExerciseEntry =>
      isRecord(entry) &&
      typeof entry.date === 'string' &&
      DATE_KEY_PATTERN.test(entry.date) &&
      typeof entry.amount === 'number' &&
      Number.isFinite(entry.amount),
  ).map((entry) => ({ date: entry.date, amount: entry.amount }));
}

/** Merge stored/imported data onto the defaults, dropping anything malformed. */
export function normalizeAppData(parsed: Record<string, unknown>): AppData {
  const defaults = createDefaultData();
  const exercises = isRecord(parsed.exercises) ? parsed.exercises : {};
  const weeklyFast = isRecord(parsed.weeklyFast) ? parsed.weeklyFast : {};
  const quarterly = isRecord(parsed.quarterlyFasts) ? parsed.quarterlyFasts : {};

  const quarterlyFasts: Record<string, QuarterlyFastRecord> = {
    ...defaults.quarterlyFasts,
  };
  for (const [id, record] of Object.entries(quarterly)) {
    if (isRecord(record) && typeof record.completed === 'boolean') {
      quarterlyFasts[id] = {
        completed: record.completed,
        startDate:
          typeof record.startDate === 'string' ? record.startDate : undefined,
        endDate: typeof record.endDate === 'string' ? record.endDate : undefined,
      };
    }
  }

  return {
    exercises: Object.fromEntries(
      EXERCISE_IDS.map((id) => [id, normalizeEntries(exercises[id])]),
    ) as AppData['exercises'],
    habits: migrateHabits(parsed.habits),
    weeklyFast: Object.fromEntries(
      Object.entries(weeklyFast).filter(
        ([key, value]) => DATE_KEY_PATTERN.test(key) && typeof value === 'boolean',
      ),
    ) as Record<string, boolean>,
    quarterlyFasts,
  };
}

export class BackupFormatError extends Error {}

/**
 * Validate a backup file's contents. Accepts our export wrapper
 * ({ app, version, exportedAt, data }) or a bare data object.
 */
export function parseBackup(text: string): AppData {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BackupFormatError('That file isn’t valid JSON.');
  }

  const candidate =
    isRecord(json) && isRecord(json.data) ? json.data : json;

  if (
    !isRecord(candidate) ||
    !isRecord(candidate.exercises) ||
    !isRecord(candidate.habits) ||
    !EXERCISE_IDS.every((id) => {
      const list = (candidate.exercises as Record<string, unknown>)[id];
      return list === undefined || Array.isArray(list);
    })
  ) {
    throw new BackupFormatError(
      'That file doesn’t look like a Habit Tracker backup.',
    );
  }

  return normalizeAppData(candidate);
}

export function buildBackupJson(data: AppData): string {
  return JSON.stringify(
    {
      app: 'habit-tracker',
      version: 2,
      storageKey: STORAGE_KEY,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2,
  );
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? normalizeAppData(parsed) : createDefaultData();
  } catch {
    return createDefaultData();
  }
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => updater(prev));
  }, []);

  const replaceData = useCallback((next: AppData) => {
    setData(next);
  }, []);

  return { data, updateData, replaceData };
}
