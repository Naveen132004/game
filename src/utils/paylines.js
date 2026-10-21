/**
 * Grid representation used everywhere in this project:
 *
 *   grid[row][reel]   row 0 = top, 1 = middle, 2 = bottom; reel 0 = leftmost
 *
 * A payline is the list of row indexes it passes through, one per reel, so the
 * symbol a payline sees on reel `r` is `grid[payline.rows[r]][r]`.
 */
export const REEL_COUNT = 5;
export const ROW_COUNT = 3;

export const PAYLINES = [
  { id: 1, name: 'Top row', rows: [0, 0, 0, 0, 0], color: '#ffd166' },
  { id: 2, name: 'Middle row', rows: [1, 1, 1, 1, 1], color: '#ef476f' },
  { id: 3, name: 'Bottom row', rows: [2, 2, 2, 2, 2], color: '#06d6a0' },
  { id: 4, name: 'Descending V', rows: [0, 1, 2, 1, 0], color: '#4cc9f0' },
  { id: 5, name: 'Ascending V', rows: [2, 1, 0, 1, 2], color: '#f78c6b' },
];

export function getPaylineById(id) {
  return PAYLINES.find((line) => line.id === id);
}
