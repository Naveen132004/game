import { SYMBOLS, SYMBOL_IDS } from './paytable.js';
import { REEL_COUNT, ROW_COUNT } from './paylines.js';

const TOTAL_WEIGHT = SYMBOL_IDS.reduce((sum, id) => sum + SYMBOLS[id].weight, 0);

/**
 * Draws one symbol id, weighted by `SYMBOLS[id].weight`.
 * `random` returns a float in [0, 1); Math.random is fine for a non-monetary demo.
 */
export function pickWeightedSymbol(random = Math.random) {
  let roll = random() * TOTAL_WEIGHT;
  for (const id of SYMBOL_IDS) {
    roll -= SYMBOLS[id].weight;
    if (roll < 0) return id;
  }
  return SYMBOL_IDS[SYMBOL_IDS.length - 1];
}

/** Returns a fresh 3×5 grid, indexed grid[row][reel]. */
export function generateSpinResult(random = Math.random) {
  return Array.from({ length: ROW_COUNT }, () =>
    Array.from({ length: REEL_COUNT }, () => pickWeightedSymbol(random)),
  );
}

/** Seedable generator (mulberry32) for reproducible grids in tests and demos. */
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
