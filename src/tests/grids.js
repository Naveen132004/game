// Readable fixtures. Each grid is grid[row][reel], three rows of five.
const C = 'CHERRY';
const L = 'LEMON';
const G = 'GRAPES';
const B = 'BELL';
const S = 'STAR';
const D = 'DIAMOND';
const SV = 'SEVEN';

export const SYM = { C, L, G, B, S, D, SV };

/** No payline wins on this grid. */
export const LOSING_GRID = [
  [C, L, G, B, S],
  [B, S, C, L, D],
  [L, C, S, D, SV],
];

/** Only the middle row wins: 3 bells. */
export const MIDDLE_THREE_BELLS = [
  [C, L, G, B, S],
  [B, B, B, S, D],
  [G, C, S, D, SV],
];

/** Middle row 4 stars, nothing else. */
export const MIDDLE_FOUR_STARS = [
  [C, L, G, B, C],
  [S, S, S, S, D],
  [G, C, L, D, SV],
];

/** Middle row 5 sevens, nothing else. */
export const MIDDLE_FIVE_SEVENS = [
  [C, L, G, B, S],
  [SV, SV, SV, SV, SV],
  [G, C, L, D, B],
];

/**
 * Top row 3 cherries (2×) and bottom row 5 lemons (8×). The V lines share
 * the corner cells but break on reel 2.
 */
export const TOP_AND_BOTTOM_WIN = [
  [C, C, C, B, S],
  [G, B, D, S, D],
  [L, L, L, L, L],
];

/** Builds a grid where only the given payline carries `symbol`, everything else is filler. */
export function gridForPayline(payline, symbol, count = 5) {
  // A filler pattern with no 3-runs on any line.
  const filler = LOSING_GRID.map((row) => row.map((id) => (id === symbol ? D : id)));
  const grid = filler.map((row) => [...row]);
  payline.rows.forEach((row, reel) => {
    if (reel < count) grid[row][reel] = symbol;
  });
  return grid;
}
