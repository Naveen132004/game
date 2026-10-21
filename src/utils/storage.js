import { BET_OPTIONS, HISTORY_LIMIT } from './gameLogic.js';
import { SYMBOLS } from './paytable.js';
import { REEL_COUNT, ROW_COUNT } from './paylines.js';

export const STORAGE_KEY = 'slot-machine-simulator:v1';

const isCount = (n) => Number.isInteger(n) && n >= 0;

export function isValidGrid(grid) {
  return (
    Array.isArray(grid) &&
    grid.length === ROW_COUNT &&
    grid.every((row) => Array.isArray(row) && row.length === REEL_COUNT && row.every((id) => id in SYMBOLS))
  );
}

function isValidHistoryEntry(entry) {
  return (
    entry &&
    typeof entry.id === 'string' &&
    isCount(entry.number) &&
    Number.isFinite(entry.timestamp) &&
    BET_OPTIONS.includes(entry.bet) &&
    isValidGrid(entry.grid) &&
    Array.isArray(entry.winningPaylines) &&
    isCount(entry.payout) &&
    Number.isInteger(entry.net) &&
    isCount(entry.balanceAfter)
  );
}

/** What is saved: only settled values, never a spin that is still in progress. */
export function serializeGame(state) {
  const { balance, bet, grid, spinCount, history } = state;
  return { balance, bet, grid, spinCount, history };
}

/**
 * Turns whatever was found in storage into safe state overrides. Each field is
 * checked on its own, so one corrupt field falls back to its default instead of
 * discarding the whole save. Returns {} when nothing usable was found.
 */
export function sanitizeSavedGame(saved) {
  if (!saved || typeof saved !== 'object') return {};
  const overrides = {};
  if (isCount(saved.balance)) overrides.balance = saved.balance;
  if (BET_OPTIONS.includes(saved.bet)) overrides.bet = saved.bet;
  if (isValidGrid(saved.grid)) overrides.grid = saved.grid;
  if (isCount(saved.spinCount)) overrides.spinCount = saved.spinCount;
  if (Array.isArray(saved.history)) {
    overrides.history = saved.history.filter(isValidHistoryEntry).slice(0, HISTORY_LIMIT);
  }
  return overrides;
}
