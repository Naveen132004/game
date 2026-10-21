import Symbol from './Symbol.jsx';
import { PAYTABLE, SYMBOL_IDS, SYMBOLS } from '../utils/paytable.js';
import { PAYLINES } from '../utils/paylines.js';

export default function Paytable({ bet, onPreviewLine }) {
  // Highest-paying symbols first.
  const ordered = [...SYMBOL_IDS].sort((a, b) => PAYTABLE[b][5] - PAYTABLE[a][5]);

  return (
    <section className="panel paytable" aria-labelledby="paytable-title">
      <h2 id="paytable-title">Paytable</h2>
      <p className="panel-note">
        Match 3, 4 or 5 symbols on a payline, starting from the leftmost reel. Each line pays
        bet × multiplier. At your current bet of <strong className="num">{bet}</strong>:
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Symbol</th>
              <th scope="col" className="num">Three</th>
              <th scope="col" className="num">Four</th>
              <th scope="col" className="num">Five</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((id) => (
              <tr key={id}>
                <th scope="row">
                  <span className="pt-symbol">
                    <Symbol id={id} size="28px" />
                    {SYMBOLS[id].label}
                  </span>
                </th>
                {[3, 4, 5].map((count) => (
                  <td key={count} className="num">
                    <span className="pt-pay">{(PAYTABLE[id][count] * bet).toLocaleString('en-US')}</span>
                    <span className="pt-mult">{PAYTABLE[id][count]}×</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="panel-sub">Paylines</h3>
      <p className="panel-note">All five lines are active on every spin. Point at a line to see it on the reels.</p>
      <ul className="payline-legend">
        {PAYLINES.map((line) => (
          <li key={line.id}>
            <button
              id={`payline-${line.id}`}
              type="button"
              className="legend-item"
              style={{ '--line-color': line.color }}
              onMouseEnter={() => onPreviewLine(line.id)}
              onMouseLeave={() => onPreviewLine(null)}
              onFocus={() => onPreviewLine(line.id)}
              onBlur={() => onPreviewLine(null)}
              aria-label={`Show payline ${line.id}, ${line.name}, on the reels`}
            >
              <span className="legend-grid" aria-hidden="true">
                {[0, 1, 2].map((row) =>
                  line.rows.map((lineRow, reel) => <i key={`${row}-${reel}`} className={lineRow === row ? 'on' : ''} />),
                )}
              </span>
              <span className="legend-name">
                <span className="legend-num num">{line.id}</span> {line.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
