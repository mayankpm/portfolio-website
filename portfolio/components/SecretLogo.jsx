import React from 'react';
import useGlitchBursts from '../hooks/useGlitchBursts';
import '../styles/SecretLogo.css';

/*
 * Hidden top-right logo on the legacy page. Invisible by default, flickers into
 * view during random glitch bursts, always visible on hover, and clickable
 * whether or not it's currently showing.
 */
export default function SecretLogo({ onClick }) {
  const glitching = useGlitchBursts(true);

  return (
    <button
      type='button'
      className={`secret-logo${glitching ? ' is-glitching' : ''}`}
      onClick={onClick}
      aria-label='Open classified file'
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/images.png' alt='' draggable='false' />
    </button>
  );
}
