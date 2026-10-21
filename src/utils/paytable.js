/**
 * Symbols and the demo paytable.
 *
 * `weight` is how often a symbol is drawn for each reel position, relative to the
 * other weights. The paytable maps a run length (3, 4 or 5 matching symbols from the
 * leftmost reel) to a multiplier of the bet. This is a configurable demo rule set,
 * not a model of any real casino game's odds or returns. With these weights and the
 * five paylines, the long-run return is about 97% of credits bet and roughly one
 * spin in four wins something.
 */
export const SYMBOLS = {
  CHERRY: { id: 'CHERRY', label: 'Cherry', glyph: '🍒', weight: 38 },
  LEMON: { id: 'LEMON', label: 'Lemon', glyph: '🍋', weight: 34 },
  GRAPES: { id: 'GRAPES', label: 'Grapes', glyph: '🍇', weight: 22 },
  BELL: { id: 'BELL', label: 'Bell', glyph: '🔔', weight: 12 },
  STAR: { id: 'STAR', label: 'Star', glyph: '⭐', weight: 8 },
  DIAMOND: { id: 'DIAMOND', label: 'Diamond', glyph: '💎', weight: 5 },
  SEVEN: { id: 'SEVEN', label: 'Lucky Seven', glyph: '7️⃣', weight: 3 },
};

export const SYMBOL_IDS = Object.keys(SYMBOLS);

export const PAYTABLE = {
  CHERRY: { 3: 2, 4: 5, 5: 10 },
  LEMON: { 3: 2, 4: 4, 5: 8 },
  GRAPES: { 3: 3, 4: 6, 5: 12 },
  BELL: { 3: 4, 4: 8, 5: 15 },
  STAR: { 3: 5, 4: 10, 5: 20 },
  DIAMOND: { 3: 8, 4: 15, 5: 30 },
  SEVEN: { 3: 10, 4: 20, 5: 50 },
};

/** Fewest matching symbols that pay. */
export const MIN_MATCH = 3;

export function getMultiplier(symbolId, matchCount, paytable = PAYTABLE) {
  return paytable[symbolId]?.[matchCount] ?? 0;
}
