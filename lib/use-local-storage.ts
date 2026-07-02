'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Persists state to localStorage under `key`. Loads the saved value on mount
 * and writes back on every change, but skips the write-back until the load
 * has completed — otherwise the initial render's default value would
 * overwrite real saved data in the same effect-flush.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setValue(JSON.parse(saved));
      }
    } catch {
      // Storage unavailable (private browsing, restricted iframe) or corrupted
      // data; keep the default and let the next save attempt overwrite it.
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable or quota exceeded; fall back to in-memory state.
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}
