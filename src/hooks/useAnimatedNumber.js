import { useEffect, useRef, useState } from 'react';

/** Eases a displayed number toward `target`. Always lands exactly on `target`. */
export function useAnimatedNumber(target, { duration = 600, disabled = false } = {}) {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    if (disabled || from === target || typeof requestAnimationFrame !== 'function') {
      shownRef.current = target;
      setShown(target);
      return undefined;
    }
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const value = progress === 1 ? target : Math.round(from + (target - from) * eased);
      shownRef.current = value;
      setShown(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, disabled]);

  return shown;
}
