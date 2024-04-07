import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Hero.css';

export default function Hero() {
  const textLines = [
    "I am a passionate Web Developer working on enhancing",
    "designs and functionality, striving to replicate",
    "the success of projects with a deep desire",
    "and passion for excellence."
  ];

  return (
    <div className='text-container'>
      {textLines.map((line, index) => (
        <motion.span
          key={index}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: index * 0.2 }}
        >
          {line}
          <br />
        </motion.span>
      ))}
    </div>
  );
}
