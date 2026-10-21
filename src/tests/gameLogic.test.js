import { describe, expect, it } from 'vitest';
import {
  calculatePayout,
  calculateNetResult,
  canAffordBet,
  createHistoryEntry,
  evaluatePayline,
  getResultMessage,
  getWinningPaylines,
  isLargeWin,
} from '../utils/gameLogic.js';
import { PAYLINES } from '../utils/paylines.js';
import { PAYTABLE } from '../utils/paytable.js';
import {
  LOSING_GRID,
  MIDDLE_FIVE_SEVENS,
  MIDDLE_FOUR_STARS,
  MIDDLE_THREE_BELLS,
  TOP_AND_BOTTOM_WIN,
  SYM,
} from './grids.js';

const MIDDLE = PAYLINES[1];

describe('symbol matching', () => {
  it('pays three matching symbols on a horizontal line', () => {
    expect(evaluatePayline(MIDDLE_THREE_BELLS, MIDDLE)).toMatchObject({ symbol: 'BELL', matchCount: 3, multiplier: 4 });
  });

  it('pays four matching symbols', () => {
    expect(evaluatePayline(MIDDLE_FOUR_STARS, MIDDLE)).toMatchObject({ symbol: 'STAR', matchCount: 4, multiplier: 10 });
  });

  it('pays five matching symbols with the 5-match multiplier only', () => {
    const result = evaluatePayline(MIDDLE_FIVE_SEVENS, MIDDLE);
    expect(result).toMatchObject({ symbol: 'SEVEN', matchCount: 5, multiplier: 50 });
    // 50× once, not 10× + 20× + 50×.
    expect(calculatePayout(MIDDLE_FIVE_SEVENS, 10).totalPayout).toBe(500);
  });

  it('pays nothing when symbols do not match', () => {
    expect(getWinningPaylines(LOSING_GRID, PAYLINES)).toEqual([]);
    expect(calculatePayout(LOSING_GRID, 100)).toEqual({ totalPayout: 0, wins: [] });
  });

  it('does not pay two in a row', () => {
    const grid = MIDDLE_THREE_BELLS.map((row) => [...row]);
    grid[1][2] = SYM.C;
    expect(evaluatePayline(grid, MIDDLE)).toBeNull();
  });

  it('counts from the leftmost reel only', () => {
    // Bells on reels 2–5 of the middle row, but reel 1 differs.
    const grid = MIDDLE_THREE_BELLS.map((row) => [...row]);
    grid[1] = [SYM.C, SYM.B, SYM.B, SYM.B, SYM.B];
    expect(evaluatePayline(grid, MIDDLE)).toBeNull();
  });

  it('stops the run at the first different symbol', () => {
    const grid = MIDDLE_THREE_BELLS.map((row) => [...row]);
    grid[1] = [SYM.B, SYM.B, SYM.B, SYM.C, SYM.B];
    expect(evaluatePayline(grid, MIDDLE).matchCount).toBe(3);
  });

  it('gives the same evaluation for the same grid every time', () => {
    const first = calculatePayout(TOP_AND_BOTTOM_WIN, 25);
    for (let i = 0; i < 5; i += 1) expect(calculatePayout(TOP_AND_BOTTOM_WIN, 25)).toEqual(first);
  });

  it('uses whatever paytable it is given', () => {
    const custom = { ...PAYTABLE, BELL: { 3: 100, 4: 200, 5: 300 } };
    expect(evaluatePayline(MIDDLE_THREE_BELLS, MIDDLE, custom).multiplier).toBe(100);
  });
});

describe('payout calculation', () => {
  it.each([
    [10, 40],
    [25, 100],
    [50, 200],
    [100, 400],
  ])('3 bells at bet %i pays %i', (bet, expected) => {
    expect(calculatePayout(MIDDLE_THREE_BELLS, bet).totalPayout).toBe(expected);
  });

  it('adds independent payline wins together', () => {
    const { totalPayout, wins } = calculatePayout(TOP_AND_BOTTOM_WIN, 10);
    expect(wins.map((w) => [w.paylineId, w.symbol, w.matchCount, w.payout])).toEqual([
      [1, 'CHERRY', 3, 20],
      [3, 'LEMON', 5, 80],
    ]);
    expect(totalPayout).toBe(100);
  });

  it('pays a symbol shared by two lines on both lines', () => {
    // The cherry on reel 1 starts both the top row and the descending V.
    const grid = [
      ['CHERRY', 'CHERRY', 'CHERRY', 'BELL', 'STAR'],
      ['LEMON', 'CHERRY', 'GRAPES', 'STAR', 'DIAMOND'],
      ['GRAPES', 'BELL', 'CHERRY', 'DIAMOND', 'SEVEN'],
    ];
    const { wins, totalPayout } = calculatePayout(grid, 10);
    expect(wins.map((w) => w.paylineId)).toEqual([1, 4]);
    expect(totalPayout).toBe(40);
  });
});

describe('net result and affordability', () => {
  it('calculates net result after the bet', () => {
    expect(calculateNetResult(25, 0)).toBe(-25);
    expect(calculateNetResult(25, 25)).toBe(0);
    expect(calculateNetResult(10, 100)).toBe(90);
  });

  it('only allows bets the balance covers', () => {
    expect(canAffordBet(100, 100)).toBe(true);
    expect(canAffordBet(99, 100)).toBe(false);
    expect(canAffordBet(0, 10)).toBe(false);
    expect(canAffordBet(Number.NaN, 10)).toBe(false);
  });
});

describe('history entries and messages', () => {
  it('records everything about a spin', () => {
    const { totalPayout, wins } = calculatePayout(TOP_AND_BOTTOM_WIN, 10);
    const entry = createHistoryEntry({
      id: 'abc',
      number: 3,
      timestamp: 1_700_000_000_000,
      bet: 10,
      grid: TOP_AND_BOTTOM_WIN,
      wins,
      totalPayout,
      balanceAfter: 1090,
    });
    expect(entry).toEqual({
      id: 'abc',
      number: 3,
      timestamp: 1_700_000_000_000,
      bet: 10,
      grid: TOP_AND_BOTTOM_WIN,
      winningPaylines: [
        { paylineId: 1, symbol: 'CHERRY', matchCount: 3, payout: 20 },
        { paylineId: 3, symbol: 'LEMON', matchCount: 5, payout: 80 },
      ],
      payout: 100,
      net: 90,
      balanceAfter: 1090,
    });
    expect(entry.grid).not.toBe(TOP_AND_BOTTOM_WIN);
  });

  it('picks the right message for each outcome', () => {
    const none = { bet: 10, wins: [], totalPayout: 0 };
    const one = calculatePayout(MIDDLE_THREE_BELLS, 10);
    const two = calculatePayout(TOP_AND_BOTTOM_WIN, 10);
    expect(getResultMessage({ spinning: true, lastResult: null }).text).toBe('Reels spinning…');
    expect(getResultMessage({ spinning: false, lastResult: none }).text).toBe('No win this time. Try another spin!');
    expect(getResultMessage({ spinning: false, lastResult: { bet: 10, ...one } }).text).toBe('You won 40 virtual credits!');
    expect(getResultMessage({ spinning: false, lastResult: { bet: 10, ...two } }).text).toBe('Big win! 100 virtual credits!');
  });

  it('flags multi-line or 10× wins as large', () => {
    expect(isLargeWin(null)).toBe(false);
    expect(isLargeWin({ bet: 10, ...calculatePayout(MIDDLE_THREE_BELLS, 10) })).toBe(false);
    expect(isLargeWin({ bet: 10, ...calculatePayout(MIDDLE_FOUR_STARS, 10) })).toBe(true);
    expect(isLargeWin({ bet: 10, ...calculatePayout(TOP_AND_BOTTOM_WIN, 10) })).toBe(true);
  });
});
