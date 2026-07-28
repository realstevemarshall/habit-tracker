import { useCallback, useEffect, useState } from 'react';
import {
  STORAGE_KEY,
  createDefaultData,
  type AppData,
} from '../data/constants';
import { todayKey } from '../utils/dates';

function migrateHabits(
  habits: unknown,
): Record<string, Record<string, boolean>> {
  if (!habits || typeof habits !== 'object') return {};

  const entries = Object.entries(habits as Record<string, unknown>);
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
    if (dayHabits && typeof dayHabits === 'object') {
      result[dateKey] = Object.fromEntries(
        Object.entries(dayHabits as Record<string, unknown>).filter(
          ([, value]) => typeof value === 'boolean',
        ),
      ) as Record<string, boolean>;
    }
  }

  return result;
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();

    const parsed = JSON.parse(raw) as AppData;
    const defaults = createDefaultData();

    return {
      exercises: { ...defaults.exercises, ...parsed.exercises },
      habits: migrateHabits(parsed.habits),
      weeklyFast: parsed.weeklyFast ?? {},
      quarterlyFasts: {
        ...defaults.quarterlyFasts,
        ...parsed.quarterlyFasts,
      },
    };
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

  return { data, updateData };
}
