import {
  STARTING_BALANCE,
  BET_OPTIONS,
  HISTORY_LIMIT,
  canAffordBet,
  calculatePayout,
  createHistoryEntry,
} from '../utils/gameLogic.js';
import { PAYLINES } from '../utils/paylines.js';

/** Shown before the first spin of a new game. */
export const DEFAULT_GRID = [
  ['CHERRY', 'BELL', 'SEVEN', 'BELL', 'CHERRY'],
  ['LEMON', 'STAR', 'DIAMOND', 'STAR', 'LEMON'],
  ['GRAPES', 'CHERRY', 'SEVEN', 'CHERRY', 'GRAPES'],
];

export function createInitialState(overrides = {}) {
  return {
    balance: STARTING_BALANCE,
    bet: BET_OPTIONS[0],
    grid: DEFAULT_GRID,
    spinCount: 0,
    // The spin whose reels are moving: bet taken, payout decided, not yet credited.
    pendingSpin: null,
    lastResult: null,
    history: [],
    ...overrides,
  };
}

export const isSpinning = (state) => state.pendingSpin !== null;

/**
 * Credit flow for one spin:
 *
 *   SPIN_STARTED   bet is deducted once; the grid and payout are decided up front so
 *                  the reels animate toward the real result.
 *   SPIN_COMPLETED payout is credited once, matched by spin id. A stale or repeated
 *                  completion (a second timer, or one left over from before a reset)
 *                  finds no matching pending spin and changes nothing.
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'BET_CHANGED': {
      if (isSpinning(state) || !BET_OPTIONS.includes(action.bet)) return state;
      return { ...state, bet: action.bet };
    }

    case 'SPIN_STARTED': {
      if (isSpinning(state) || !canAffordBet(state.balance, state.bet)) return state;
      const { totalPayout, wins } = calculatePayout(action.grid, state.bet, PAYLINES);
      return {
        ...state,
        balance: state.balance - state.bet,
        grid: action.grid,
        spinCount: state.spinCount + 1,
        pendingSpin: {
          id: action.spinId,
          number: state.spinCount + 1,
          timestamp: action.timestamp,
          bet: state.bet,
          grid: action.grid,
          wins,
          totalPayout,
        },
        lastResult: null,
      };
    }

    case 'SPIN_COMPLETED': {
      const spin = state.pendingSpin;
      if (!spin || spin.id !== action.spinId) return state;
      const balance = state.balance + spin.totalPayout;
      const entry = createHistoryEntry({ ...spin, balanceAfter: balance });
      return {
        ...state,
        balance,
        pendingSpin: null,
        lastResult: { spinId: spin.id, bet: spin.bet, wins: spin.wins, totalPayout: spin.totalPayout },
        history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
      };
    }

    case 'GAME_RESET':
      return createInitialState();

    default:
      return state;
  }
}
