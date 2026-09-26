import React from 'react';
import { motion } from 'framer-motion';
import '../styles/LegacyHero.css';

// Landing text, shown before the logo is clicked.
export default function LegacyHero() {
  const textLines = [
    "I am a Software Engineer who turns complex problems",
    "into simple, reliable software, code that is easy to",
    "read, easy to test and built to last. I love working",
    "with great teams and shipping work that matters."
  ];

  return (
    <div className='legacy-text-container'>
      {textLines.map((line, index) => (
        <motion.span
          key={index}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: index * 0.2 }}
        >
          {line}{' '}
          <br />
        </motion.span>
      ))}
    </div>
  );
}
