import React from 'react';
import '../styles/ThemeToggle.css';

export default function ThemeToggle({ theme, onToggle }) {
  // Label shows the mode you'll switch TO
  const nextLabel = theme === 'dark' ? 'LIGHT' : 'DARK';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
    >
      [ {nextLabel} ]
    </button>
  );
}
