import React from 'react';

// Minimal footer for the legacy page — mirrors the top bar's edges and weight.
export default function LegacyFooter() {
  return (
    <footer className='legacy-footer'>
      <span>© {new Date().getFullYear()} Mayank</span>
      <nav className='legacy-footer-links'>
        <a href='mailto:mayankpm285@gmail.com'>Email</a>
        <a
          href='https://www.linkedin.com/in/mayank-pm/'
          target='_blank'
          rel='noopener noreferrer'
        >
          LinkedIn ↗
        </a>
        <a
          href='https://github.com/mayankpm'
          target='_blank'
          rel='noopener noreferrer'
        >
          GitHub ↗
        </a>
        <a
          href='/Mayank_Manohar_Polepalli_Resume.pdf'
          download='Mayank_Manohar_Polepalli_Resume.pdf'
        >
          Resume ↓
        </a>
      </nav>
    </footer>
  );
}
