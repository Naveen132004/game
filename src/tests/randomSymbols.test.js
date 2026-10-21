import { describe, expect, it } from 'vitest';
import { generateSpinResult, createSeededRandom, pickWeightedSymbol } from '../utils/randomSymbols.js';
import { SYMBOLS, SYMBOL_IDS } from '../utils/paytable.js';
import { isValidGrid } from '../utils/storage.js';

describe('generateSpinResult', () => {
  it('produces a 5×3 grid of known symbols', () => {
    const grid = generateSpinResult(createSeededRandom(1));
    expect(grid).toHaveLength(3);
    grid.forEach((row) => {
      expect(row).toHaveLength(5);
      row.forEach((id) => expect(SYMBOLS).toHaveProperty(id));
    });
    expect(isValidGrid(grid)).toBe(true);
  });

  it('is reproducible with the same seed and varies between seeds', () => {
    expect(generateSpinResult(createSeededRandom(42))).toEqual(generateSpinResult(createSeededRandom(42)));
    expect(generateSpinResult(createSeededRandom(42))).not.toEqual(generateSpinResult(createSeededRandom(43)));
  });

  it('maps the edges of the random range to the first and last symbols', () => {
    expect(pickWeightedSymbol(() => 0)).toBe(SYMBOL_IDS[0]);
    expect(pickWeightedSymbol(() => 0.999999)).toBe(SYMBOL_IDS[SYMBOL_IDS.length - 1]);
  });

  it('draws symbols roughly in proportion to their weights', () => {
    const random = createSeededRandom(7);
    const counts = Object.fromEntries(SYMBOL_IDS.map((id) => [id, 0]));
    const draws = 50_000;
    for (let i = 0; i < draws; i += 1) counts[pickWeightedSymbol(random)] += 1;
    const totalWeight = SYMBOL_IDS.reduce((sum, id) => sum + SYMBOLS[id].weight, 0);
    SYMBOL_IDS.forEach((id) => {
      expect(counts[id] / draws).toBeCloseTo(SYMBOLS[id].weight / totalWeight, 1);
    });
  });
});
