import { useEffect, useState } from 'react';

/*
 * Random "corrupted footage" bursts. While `enabled`, returns a boolean that
 * flickers on/off in short bursts at random long intervals:
 *   - 2–4 flickers per burst, 40–120ms on / 50–170ms off
 *   - the last flicker of each burst holds for 1s
 *   - next burst 4–14s later
 */
export default function useGlitchBursts(enabled) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setGlitching(false);
      return;
    }

    let burstTimers = [];
    let scheduleTimer;

    const fireBurst = () => {
      burstTimers.forEach(clearTimeout);
      burstTimers = [];
      const flickers = 2 + Math.floor(Math.random() * 3); // 2–4 flickers
      let t = 0;
      for (let i = 0; i < flickers; i++) {
        const isLast = i === flickers - 1;
        const on = isLast ? 1000 : (40 + Math.random() * 80);   // last one: 1s; others: 40–120ms
        const off = isLast ? 0 : (50 + Math.random() * 120);     // no gap after last
        burstTimers.push(setTimeout(() => setGlitching(true), t));
        t += on;
        burstTimers.push(setTimeout(() => setGlitching(false), t));
        t += off;
      }
      schedule();
    };

    const schedule = () => {
      const next = 4000 + Math.random() * 10000;
      scheduleTimer = setTimeout(fireBurst, next);
    };

    schedule();

    return () => {
      clearTimeout(scheduleTimer);
      burstTimers.forEach(clearTimeout);
      setGlitching(false);
    };
  }, [enabled]);

  return glitching;
}
