"use client"
import React, { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import LegacyFooter from '../components/LegacyFooter'
import LegacyHero from '../components/LegacyHero'
import LegacyThemeToggle from '../components/LegacyThemeToggle'
import SecretLogo from '../components/SecretLogo'
import Sidenav from '../components/Sidenav'
import ThemeToggle from '../components/ThemeToggle'
import useGlitchBursts from '../hooks/useGlitchBursts'
import '../styles/Hero.css'

export default function Home() {
  // The original landing page is shown until the hidden logo is clicked.
  const [unlocked, setUnlocked] = useState(false);
  const [theme, setTheme] = useState('dark');
  // When true, the page briefly flips to a photo-negative (light mode only).
  const glitching = useGlitchBursts(unlocked && theme === 'light');

  // Apply the theme class to <body> so CSS variables cascade everywhere
  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  if (!unlocked) {
    return (
      <div className="legacy-page">
        <div className="legacy-name font-bold">Mayank</div>
        {/* Logo sits to the left of the theme toggle */}
        <div className="legacy-controls">
          <SecretLogo onClick={() => setUnlocked(true)} />
          <LegacyThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <h1 className="about-text-container font-bold">
          <LegacyHero/>
        </h1>
        <LegacyFooter/>
      </div>
    )
  }

  return (
    <>
      {/* <Sidenav/> */}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <div className={`page-surface${glitching ? ' glitch-invert' : ''}`}>
        <div className="paper-sheet">
          <div className="about-text-container font-bold">
            <Hero/>
          </div>
        </div>
      </div>
    </>
  )
}
