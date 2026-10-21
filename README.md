# Midnight Reels: Slot Machine Simulator

A social-casino style slot machine built with React. It has five spinning reels, five paylines, a configurable paytable, a virtual-credit balance, win animations and a persistent game history.

> **Virtual credits only.** Credits are fictional. They can't be bought, transferred or redeemed. There is no real-money play, payment integration or cash-out of any kind. The paytable is a demo rule set, not a model of any real casino game's odds or returns.

## Features

- **5 × 3 reel grid** with hand-drawn SVG symbols (cherry, lemon, grapes, bell, star, diamond, lucky seven).
- **Real spin results.** Each spin is generated and evaluated first, then the reels animate to that exact result. Reels stop one after another, left to right.
- **Five paylines** (top, middle, bottom, descending V, ascending V), drawn over the reels with an SVG overlay when they win. Hovering or focusing a line in the legend previews it on the reels.
- **Virtual credits.** Start with 1,000. Bets of 10, 25, 50 or 100 per spin. The bet is deducted when the spin starts and winnings are credited once the reels stop. Spinning is blocked when the balance can't cover the bet, so the balance never goes negative.
- **Result messages** for spinning, no win, single win, multi-line big win and insufficient credits, plus the payout and net result of each spin.
- **Animations:** vertical reel spin, staggered stops, pulsing winning symbols, glowing paylines, confetti and a cabinet jolt on large wins, an animated balance counter, and pressed/hover/disabled/spinning states on the Spin button.
- **Reduced motion.** With `prefers-reduced-motion`, reels still spin (they show the state change) but faster and without decorative effects.
- **Game history** of the latest 20 spins: spin number, date and time, bet, reel result, winning paylines, payout, net and balance after. Open a row to review the reels with the winning cells highlighted.
- **Persistence** of balance, bet, last grid and history in LocalStorage. Corrupt or missing data falls back safely, field by field.
- **Reset Demo** with an in-page confirmation dialog.
- **Accessible:** labelled controls, keyboard play (Space spins), focus-visible styles, a focus-trapped dialog and live-region status messages.
- **Responsive:** three columns on desktop, cabinet plus two panels on tablet, a single column on phones.

## Tech stack

- React 19 (function components and Hooks)
- JavaScript (ES modules), HTML5, CSS3 (no CSS framework)
- Vite
- Vitest and React Testing Library (jsdom)
- lucide-react for a few interface icons
- LocalStorage for persistence; no backend, no API keys

## Screenshots

_Add screenshots here before publishing the repository:_

- `docs/screenshot-desktop.png`: desktop layout after a winning spin
- `docs/screenshot-mobile.png`: phone layout

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run test     # run the test suite once
npm run build    # production build in dist/
```

Other scripts:

```bash
npm run test:watch    # tests in watch mode
npm run preview       # serve the production build locally
npm run build:single  # build a single self-contained HTML file in dist-single/
```

## Project structure

```
src/
  components/
    GameHeader.jsx       title, credit balance, current bet, Reset Demo
    CreditBalance.jsx    animated balance readout
    SlotMachine.jsx      reel window, payline tabs, overlay, celebration
    Reel.jsx             one reel and its spin animation
    Symbol.jsx           SVG symbol art and shared gradients
    PaylineOverlay.jsx   SVG lines drawn over the grid
    Celebration.jsx      confetti burst for large wins
    GameControls.jsx     bet chips and the Spin button
    ResultMessage.jsx    status line, payout and net result
    Paytable.jsx         paytable and payline legend
    GameHistory.jsx      recent spins with review
    ResetDialog.jsx      confirmation dialog
  hooks/
    useGameState.js      reducer wiring, spin timer, persistence
    useLocalStorage.js   safe storage read/write
    useAnimatedNumber.js eased number counter
    usePrefersReducedMotion.js
  state/
    gameReducer.js       credit flow and history (pure)
  utils/
    paytable.js          symbols, weights, multipliers
    paylines.js          grid shape and payline definitions
    randomSymbols.js     weighted symbol draws and grid generation
    gameLogic.js         evaluation, payouts, net result, messages
    storage.js           save format and validation
  tests/                 Vitest + React Testing Library suites
  App.jsx, App.css, index.css, main.jsx
```

Game rules live in pure functions under `utils/` and `state/`, so they are tested without rendering anything.

## Grid and payline logic

One grid representation is used throughout:

```
grid[row][reel]     row 0 = top, 1 = middle, 2 = bottom
                    reel 0 = leftmost … reel 4 = rightmost
```

A payline is a list of row indexes, one per reel. The symbol a payline sees on reel `r` is `grid[line.rows[r]][r]`.

| # | Name | Rows |
|---|---|---|
| 1 | Top row | `[0, 0, 0, 0, 0]` |
| 2 | Middle row | `[1, 1, 1, 1, 1]` |
| 3 | Bottom row | `[2, 2, 2, 2, 2]` |
| 4 | Descending V | `[0, 1, 2, 1, 0]` |
| 5 | Ascending V | `[2, 1, 0, 1, 2]` |

`evaluatePayline(grid, payline)` reads the line left to right, counts how many symbols in a row match the symbol on reel 1, and stops at the first different symbol. Runs of 3, 4 or 5 pay. Each line is evaluated independently, so one cell can be part of wins on several lines.

## Payout formula

```
payout for a line = bet × multiplier[symbol][matchCount]
spin payout       = sum of all winning line payouts
net result        = spin payout − bet
```

Only the full run on a line is paid: five sevens pay the 5-match multiplier once, not the 3- and 4-match amounts as well.

| Symbol | 3 | 4 | 5 |
|---|---:|---:|---:|
| Cherry | 2× | 5× | 10× |
| Lemon | 2× | 4× | 8× |
| Grapes | 3× | 6× | 12× |
| Bell | 4× | 8× | 15× |
| Star | 5× | 10× | 20× |
| Diamond | 8× | 15× | 30× |
| Lucky Seven | 10× | 20× | 50× |

Symbol weights in `utils/paytable.js` set how often each symbol is drawn. With the default weights the long-run return is about 97% of credits bet, and roughly one spin in four wins something. Change the weights or multipliers there to tune the game.

## How a spin works

1. The player picks a bet and presses **Spin** (or Space).
2. `SPIN_STARTED`: the reducer checks the player can afford the bet and no spin is running, deducts the bet, and stores the new grid and its evaluated payout as the pending spin.
3. The reels animate. Each reel scrolls a strip that ends on its final three symbols, and later reels run longer so they stop in sequence.
4. After the last reel stops, `SPIN_COMPLETED` (carrying the spin id) credits the payout, records the history entry and shows the result message.

A completion only applies if its spin id matches the pending spin. A repeated timer, or one left over from before a reset, changes nothing, so payouts are credited exactly once. Saves happen only between spins, so closing the page mid-spin never stores a half-finished spin.

### Example

Balance 1,000, bet 10. The spin lands three cherries on the top row and five lemons on the bottom row.

- Bet deducted at the start: 990
- Top row: 10 × 2 = 20; bottom row: 10 × 8 = 80
- Payout 100, net +90, message “Big win! 100 virtual credits!”
- Balance after: 1,090

## Tests

`npm run test` runs 65 tests across six files, all using fixed grids rather than random outcomes:

- `randomSymbols.test.js`: 5×3 grid shape, seeded reproducibility, weight distribution
- `paylines.test.js`: line definitions and win/no-win for every payline
- `gameLogic.test.js`: 3/4/5 matches, no match, leftmost-reel rule, payouts across bet sizes, multi-line totals, net result, history entries, messages
- `gameReducer.test.js`: bet deduction, payout credit, insufficient credits, duplicate spins and payouts, stale completion after reset, history limit, reset
- `storage.test.js`: balance and history persistence, corrupt JSON, invalid fields, storage that throws
- `App.test.jsx`: win, big-win and loss feedback, blocked double spins, bet changes, insufficient-credit warning, reload persistence, reset confirmation, Space to spin

## Known limitations

- Symbols use simple weighted draws per cell, not physical reel strips.
- Sound effects are not included.
- History keeps the latest 20 spins only.
- Saved data is per browser and per device.

## Future improvements

- Sound with a mute toggle
- Wild and scatter symbols, free-spin bonus rounds
- Autoplay with stop conditions
- Reel-strip based outcomes and an RTP simulation script
- Visual regression tests with Playwright
