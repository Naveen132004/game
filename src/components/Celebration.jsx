import { useEffect, useMemo, useState } from 'react';

const PARTICLE_COUNT = 28;
const COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#4cc9f0', '#f78c6b', '#c58cff'];
const LIFETIME_MS = 1600;

/** A short burst of confetti, shown once per large win and then removed. */
export default function Celebration({ burstKey }) {
  const [visibleKey, setVisibleKey] = useState(burstKey);

  useEffect(() => {
    setVisibleKey(burstKey);
    const timer = setTimeout(() => setVisibleKey(null), LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [burstKey]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 110 + Math.random() * 120;
        return {
          dx: `${Math.cos(angle) * distance}px`,
          dy: `${Math.sin(angle) * distance - 40}px`,
          spin: `${Math.round(Math.random() * 720 - 360)}deg`,
          delay: `${Math.round(Math.random() * 120)}ms`,
          color: COLORS[i % COLORS.length],
        };
      }),
    // New particle paths for each burst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey],
  );

  if (!visibleKey || visibleKey !== burstKey) return null;
  return (
    <div className="celebration" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{ '--dx': p.dx, '--dy': p.dy, '--spin': p.spin, '--delay': p.delay, background: p.color }}
        />
      ))}
    </div>
  );
}
