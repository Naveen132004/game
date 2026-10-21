import { useEffect } from 'react';

/**
 * Storage access can throw (private browsing, blocked cookies, sandboxed frames,
 * quota errors). These helpers report failure instead of crashing the game.
 */
export function readStorage(key, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch (error) {
    console.warn(`Could not read saved game data (${key}).`, error);
    return null;
  }
}

export function writeStorage(key, value, storage = globalThis.localStorage) {
  try {
    storage?.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save game data (${key}).`, error);
    return false;
  }
}

/** Writes `value` to storage whenever it changes, while `enabled` is true. */
export function useLocalStorage(key, value, enabled = true) {
  useEffect(() => {
    if (enabled) writeStorage(key, value);
  }, [key, value, enabled]);
}
