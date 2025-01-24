import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Hero.css';

export default function Hero() {
  const [textLines, setTextLines] = useState([]);

  // Once the last line has finished its fade-in animation, we start word-by-word striking.
  const [strikethroughStarted, setStrikethroughStarted] = useState(false);

  // Tracks which line is currently being struck
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  // Tracks how many words in the current line have been struck
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // After **all** lines are fully processed, we transition unstruck words to red.
  const [allStrikethroughComplete, setAllStrikethroughComplete] = useState(false);

  const keywords = [
    'generative AI',
    'AI',
    'machine learning',
    'data-driven',
    'innovative solutions',
    'cloud computing',
    'optimization',
    'backend',
    'development',
    'mathematical'
  ];

  // === 1) Fetch a random response from JSON and split into ~4 lines. ===
  const fetchAndUpdateResponses = () => {
    fetch('./openaiResponses.json')
      .then((response) => response.json())
      .then((data) => {
        const randomResponse = data[Math.floor(Math.random() * data.length)];

        // Split into 4 roughly equal lines
        const words = randomResponse.split(' ');
        const lines = Array(4).fill('');
        let index = 0;

        words.forEach((word) => {
          lines[index] += (lines[index] ? ' ' : '') + word;
          if (lines[index].length > randomResponse.length / 4 && index < 3) {
            index++;
          }
        });

        setTextLines(lines);
      })
      .catch((error) => console.error('Error fetching JSON:', error));
  };

  useEffect(() => {
    fetchAndUpdateResponses();
    return () => clearInterval(interval);
  }, []);

  // === 2) Once the last line’s fade-in completes, we trigger the word-by-word strikethrough. ===
  const handleAnimationComplete = (lineIndex) => {
    if (lineIndex === textLines.length - 1) {
      setStrikethroughStarted(true);
      setCurrentLineIndex(0);
      setCurrentWordIndex(0);
    }
  };

  // === 3) Word-by-word strikethrough logic. ===
  // Every ~400ms, we strike the next word in the current line. 
  // Once we finish a line, we move to the next line until all lines are done.
  useEffect(() => {
    if (!strikethroughStarted) return;  
    if (textLines.length === 0) return;
    if (currentLineIndex >= textLines.length) {
      // If we're "past" the last line, it means we finished all lines
      // => trigger the final color transition for unstruck words
      if (!allStrikethroughComplete) {
        setAllStrikethroughComplete(true);
      }
      return;
    }

    const wordsInLine = textLines[currentLineIndex].split(' ');

    if (currentWordIndex <= wordsInLine.length) {
      // Strike the next word in the current line after a short delay
      const timer = setTimeout(() => {
        setCurrentWordIndex((prev) => prev + 1);
      }, 200); // Adjust for speed of striking each word
      return () => clearTimeout(timer);
    } else {
      // Done striking all words in this line, move to the next line
      const nextLineTimer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentWordIndex(0);
      }, 3); // Small pause before next line
      return () => clearTimeout(nextLineTimer);
    }
  }, [
    strikethroughStarted,
    currentLineIndex,
    currentWordIndex,
    textLines,
    allStrikethroughComplete
  ]);

  // === 4) Helper to see if a single word is in any of your multi-word keywords. ===
  // We skip strikethrough for matching words.
  const isKeyword = (word) => {
    const cleaned = word.replace(/[^\w-]/g, '').toLowerCase();
    return keywords.some((kw) =>
      kw
        .toLowerCase()
        .split(' ')
        .includes(cleaned)
    );
  };

  return (
    <div className="text-container" style={{ whiteSpace: 'pre-wrap' }}>
      {textLines.map((line, index) => (
        <motion.span
          key={index}
          // Fade in each line from y=50, opacity=0
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: index * 0.2 }}
          onAnimationComplete={() => handleAnimationComplete(index)}
          style={{ display: 'block' }}
        >
          {line.split(' ').map((word, wIndex) => {
            // Insert a non‐breaking space to preserve spacing
            const space = '\u00A0';

            // 1) If we haven't started strikethrough or we're not up to this line yet => plain text
            if (!strikethroughStarted || index > currentLineIndex) {
              return (
                <React.Fragment key={wIndex}>
                  {word}{space}
                </React.Fragment>
              );
            }

            // 2) If this line is done (index < currentLineIndex), 
            //    all non‐keywords are struck
            if (index < currentLineIndex) {
              if (isKeyword(word)) {
                // For any words that remain unstruck after everything is done,
                // we do the color transition from white to red if allStrikethroughComplete is true:
                if (allStrikethroughComplete) {
                  return (
                    <span className="unstruck-to-red" key={wIndex}>
                      {word}{space}
                    </span>
                  );
                } else {
                  return (
                    <React.Fragment key={wIndex}>
                      {word}{space}
                    </React.Fragment>
                  );
                }
              }
              // Non-keywords are always struck
              return (
                <span className="strike-through" key={wIndex}>
                  {word}{space}
                </span>
              );
            }

            // 3) Otherwise, index === currentLineIndex => we're actively striking this line:
            //    If wIndex < currentWordIndex => that word is already struck 
            if (wIndex < currentWordIndex) {
              // If it's a keyword => skip strikethrough
              if (isKeyword(word)) {
                // Possibly turn them red if *everything* is done
                if (allStrikethroughComplete) {
                  return (
                    <span className="unstruck-to-red" key={wIndex}>
                      {word}{space}
                    </span>
                  );
                } else {
                  return (
                    <React.Fragment key={wIndex}>
                      {word}{space}
                    </React.Fragment>
                  );
                }
              }
              // Otherwise strike it
              return (
                <span className="strike-through" key={wIndex}>
                  {word}{space}
                </span>
              );
            }

            // 4) wIndex >= currentWordIndex => not struck yet
            return (
              <React.Fragment key={wIndex}>
                {word}{space}
              </React.Fragment>
            );
          })}
          <br />
        </motion.span>
      ))}
    </div>
  );
}
