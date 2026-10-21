import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { readStorage, writeStorage } from '../hooks/useLocalStorage.js';
import { sanitizeSavedGame, serializeGame, STORAGE_KEY } from '../utils/storage.js';
import { useGameState } from '../hooks/useGameState.js';
import { createInitialState, gameReducer } from '../state/gameReducer.js';
import { MIDDLE_THREE_BELLS } from './grids.js';

function playedState() {
  let state = createInitialState({ bet: 25 });
  state = gameReducer(state, { type: 'SPIN_STARTED', grid: MIDDLE_THREE_BELLS, spinId: 'x1', timestamp: 1 });
  return gameReducer(state, { type: 'SPIN_COMPLETED', spinId: 'x1' });
}

describe('saving and loading', () => {
  it('round-trips balance and history through storage', () => {
    const state = playedState();
    writeStorage(STORAGE_KEY, serializeGame(state));
    const loaded = sanitizeSavedGame(readStorage(STORAGE_KEY));
    expect(loaded.balance).toBe(1075);
    expect(loaded.bet).toBe(25);
    expect(loaded.history).toEqual(state.history);
  });

  it('the game hook restores a saved balance and history on start', () => {
    writeStorage(STORAGE_KEY, serializeGame(playedState()));
    const { result } = renderHook(() => useGameState({ spinDuration: 10 }));
    expect(result.current.state.balance).toBe(1075);
    expect(result.current.state.history).toHaveLength(1);
  });

  it('the game hook saves after each completed spin', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useGameState({ spinDuration: 100, generateGrid: () => MIDDLE_THREE_BELLS }));
      act(() => result.current.spin());
      // Mid-spin, the last settled state is what's saved.
      expect(readStorage(STORAGE_KEY).balance).toBe(1000);
      act(() => vi.advanceTimersByTime(100));
      const saved = readStorage(STORAGE_KEY);
      expect(saved.balance).toBe(1030);
      expect(saved.history[0]).toMatchObject({ payout: 40, net: 30, balanceAfter: 1030 });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('bad or missing saved data', () => {
  it('ignores corrupt JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(readStorage(STORAGE_KEY)).toBeNull();
    const { result } = renderHook(() => useGameState({ spinDuration: 10 }));
    expect(result.current.state.balance).toBe(1000);
    warn.mockRestore();
  });

  it('drops invalid fields and keeps valid ones', () => {
    const good = playedState().history[0];
    expect(
      sanitizeSavedGame({
        balance: -50,
        bet: 33,
        grid: [['NOPE']],
        history: [good, { id: 5 }, null, { ...good, id: 'z', bet: 999 }],
      }),
    ).toEqual({ history: [good] });
    expect(sanitizeSavedGame('hello')).toEqual({});
    expect(sanitizeSavedGame(null)).toEqual({});
  });

  it('survives storage that throws', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(readStorage(STORAGE_KEY, broken)).toBeNull();
    expect(writeStorage(STORAGE_KEY, { a: 1 }, broken)).toBe(false);
    warn.mockRestore();
  });
});
