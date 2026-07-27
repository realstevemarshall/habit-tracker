import { useCallback, useEffect, useState } from 'react';
import {
  STORAGE_KEY,
  createDefaultData,
  type AppData,
} from '../data/constants';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();

    const parsed = JSON.parse(raw) as AppData;
    const defaults = createDefaultData();

    return {
      exercises: { ...defaults.exercises, ...parsed.exercises },
      habits: parsed.habits ?? {},
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
