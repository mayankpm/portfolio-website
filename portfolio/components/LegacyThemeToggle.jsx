import React from 'react';
import '../styles/LegacyThemeToggle.css';

/*
 * Minimal sun/moon icon toggle for the legacy page. Shows the mode you'll
 * switch TO: sun on dark, moon on light. The two morph into each other —
 * the core grows and a mask circle slides in to carve the crescent while the
 * rays shrink away.
 */
export default function LegacyThemeToggle({ theme, onToggle }) {
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type='button'
      className={`legacy-theme-toggle is-${next}`}
      onClick={onToggle}
      aria-label={`Switch to ${next} mode`}
    >
      <svg viewBox='0 0 24 24' aria-hidden='true'>
        <mask id='legacy-moon-mask'>
          <rect x='0' y='0' width='24' height='24' fill='white' />
          <circle className='legacy-moon-cut' cx='24' cy='4' r='7' fill='black' />
        </mask>
        <circle className='legacy-core' cx='12' cy='12' r='5' mask='url(#legacy-moon-mask)' />
        <g className='legacy-rays'>
          <line x1='12' y1='1.5' x2='12' y2='3.5' />
          <line x1='12' y1='20.5' x2='12' y2='22.5' />
          <line x1='1.5' y1='12' x2='3.5' y2='12' />
          <line x1='20.5' y1='12' x2='22.5' y2='12' />
          <line x1='4.6' y1='4.6' x2='6' y2='6' />
          <line x1='18' y1='18' x2='19.4' y2='19.4' />
          <line x1='4.6' y1='19.4' x2='6' y2='18' />
          <line x1='18' y1='6' x2='19.4' y2='4.6' />
        </g>
      </svg>
    </button>
  );
}
