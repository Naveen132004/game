import { describe, expect, it } from 'vitest';
import { PAYLINES, REEL_COUNT, ROW_COUNT } from '../utils/paylines.js';
import { evaluatePayline, getPaylineSymbols, getWinningPaylines } from '../utils/gameLogic.js';
import { gridForPayline, LOSING_GRID, SYM } from './grids.js';

describe('payline definitions', () => {
  it('has the five required lines, in order', () => {
    expect(PAYLINES.map((l) => l.rows)).toEqual([
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [0, 1, 2, 1, 0],
      [2, 1, 0, 1, 2],
    ]);
  });

  it('gives every line one valid row index per reel and a unique id', () => {
    PAYLINES.forEach((line) => {
      expect(line.rows).toHaveLength(REEL_COUNT);
      line.rows.forEach((row) => expect(row >= 0 && row < ROW_COUNT).toBe(true));
    });
    expect(new Set(PAYLINES.map((l) => l.id)).size).toBe(PAYLINES.length);
  });

  it('reads the symbols a line passes through, left to right', () => {
    const vLine = PAYLINES[3];
    expect(getPaylineSymbols(LOSING_GRID, vLine)).toEqual(['CHERRY', 'STAR', 'STAR', 'LEMON', 'STAR']);
  });
});

describe('evaluating each payline', () => {
  it.each(PAYLINES.map((line) => [line.name, line]))('%s wins only when its own cells match', (_, line) => {
    const grid = gridForPayline(line, SYM.B, 5);
    const result = evaluatePayline(grid, line);
    expect(result).toMatchObject({ paylineId: line.id, symbol: 'BELL', matchCount: 5, multiplier: 15 });
    expect(result.positions).toEqual(line.rows.map((row, reel) => [row, reel]));

    const winners = getWinningPaylines(grid, PAYLINES).map((w) => w.paylineId);
    expect(winners).toContain(line.id);
  });

  it.each(PAYLINES.map((line) => [line.name, line]))('%s does not win on a non-matching grid', (_, line) => {
    expect(evaluatePayline(LOSING_GRID, line)).toBeNull();
  });
});
