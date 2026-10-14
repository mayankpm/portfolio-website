import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Hero.css';

/*
 * Classified dossier data model.
 * Section -> rows -> segments. A segment is the atomic unit:
 *   kind: 'redact'  -> body text, split into words, each gets a black censor bar
 *   kind: 'keyword' -> survives the sweep, transitions white -> red ("Software Engineer",
 *                      role/project titles); tight: no space after (punctuation follows)
 *   kind: 'value'   -> survives, stays normal ink (name, skills) — never barred/red
 *   kind: 'link'    -> survives, turns red with the keywords, clickable (href/download)
 * Section `label` and row `key` are structural (never redacted).
 */
const SECTIONS = [
  {
    id: 'subject',
    type: 'header',
    label: 'Subject File',
    rows: [
      { key: 'NAME', segments: [{ kind: 'value', text: 'MAYANK' }] },
      { key: 'ROLE', segments: [{ kind: 'keyword', text: 'Software Engineer' }] },
      { key: 'STATUS', segments: [{ kind: 'keyword', text: 'MS Computer Science, UMass Amherst' }] },
    ],
  },
  {
    id: 'background',
    type: 'paragraph',
    label: 'Background',
    rows: [
      {
        segments: [
          { kind: 'redact', text: 'I am a' },
          { kind: 'keyword', text: 'Software Engineer' },
          { kind: 'redact', text: 'who' },
        ],
      },
      { segments: [{ kind: 'redact', text: 'builds backend and distributed' }] },
      { segments: [{ kind: 'redact', text: 'systems, from Raft-based storage' }] },
      { segments: [{ kind: 'redact', text: 'to load balancers and multi-agent' }] },
      { segments: [{ kind: 'redact', text: 'AI pipelines, always well tested.' }] },
    ],
  },
  {
    id: 'assignments',
    type: 'entries',
    label: 'Field Assignments',
    rows: [
      { key: 'FA-01', segments: [{ kind: 'keyword', text: 'Software Developer Trainee', tight: true }, { kind: 'redact', text: ', Manhattan Associates (Sep 2025 to Sep 2026)' }] },
      { key: 'FA-02', segments: [{ kind: 'keyword', text: 'Research Assistant', tight: true }, { kind: 'redact', text: ', IISc Bengaluru (Sep 2025 to Mar 2026)' }] },
      { key: 'FA-03', segments: [{ kind: 'keyword', text: 'Teaching Assistant', tight: true }, { kind: 'redact', text: ', PES University (Aug 2024 to Dec 2024)' }] },
    ],
  },
  {
    id: 'projects',
    type: 'entries',
    label: 'Operations',
    rows: [
      { key: 'OP-01', segments: [{ kind: 'keyword', text: 'Distributed Key-Value Store', tight: true }, { kind: 'redact', text: ': Go, Raft consensus, LSM-tree storage' }] },
      { key: 'OP-02', segments: [{ kind: 'keyword', text: 'Hybrid L4/L7 Load Balancer', tight: true }, { kind: 'redact', text: ': Go, TCP proxying, HTTP routing, failover' }] },
      { key: 'OP-03', segments: [{ kind: 'keyword', text: 'Multi-Agent GenAI Framework', tight: true }, { kind: 'redact', text: ': LangGraph, FastAPI, Redis' }] },
      { key: 'OP-04', segments: [{ kind: 'keyword', text: 'Bird-Strike Risk Prediction', tight: true }, { kind: 'redact', text: ': ML research, ICICIP 2025' }] },
    ],
  },
  {
    id: 'capabilities',
    type: 'list',
    label: 'Capabilities',
    rows: [
      {
        segments: [
          { kind: 'keyword', text: 'Go' },
          { kind: 'keyword', text: 'Python' },
          { kind: 'keyword', text: 'Java' },
          { kind: 'keyword', text: 'C++' },
          { kind: 'keyword', text: 'TypeScript' },
          { kind: 'redact', text: 'plus Spring Boot, FastAPI, PostgreSQL, Redis, Docker and LangGraph' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    type: 'entries',
    label: 'Contact Channel',
    rows: [
      { key: 'EMAIL', segments: [{ kind: 'link', text: 'mayankpm285@gmail.com', href: 'mailto:mayankpm285@gmail.com' }] },
      { key: 'GITHUB', segments: [{ kind: 'link', text: 'github.com/mayankpm', href: 'https://github.com/mayankpm' }] },
      { key: 'LINKEDIN', segments: [{ kind: 'link', text: 'linkedin.com/in/mayank-pm', href: 'https://www.linkedin.com/in/mayank-pm/' }] },
    ],
  },
  {
    id: 'attachments',
    type: 'entries',
    label: 'Attachments',
    rows: [
      { key: 'RESUME', segments: [{ kind: 'link', text: 'Download PDF', href: '/Mayank_Manohar_Polepalli_Resume.pdf', download: 'Mayank_Manohar_Polepalli_Resume.pdf' }] },
    ],
  },
];

/*
 * Build the global, ordered censor queue by walking the document top-to-bottom.
 * Each word of every `redact` segment becomes one sweep target. The lookup map
 * lets the renderer ask "is this exact word censored yet?" by global index.
 */
function buildCensor() {
  const order = []; // index = sweep position
  const indexMap = new Map(); // "s:r:seg:word" -> global index
  SECTIONS.forEach((section, sIdx) => {
    section.rows.forEach((row, rIdx) => {
      row.segments.forEach((seg, segIdx) => {
        if (seg.kind !== 'redact') return;
        seg.text.split(' ').forEach((word, wordIdx) => {
          const key = `${sIdx}:${rIdx}:${segIdx}:${wordIdx}`;
          indexMap.set(key, order.length);
          order.push(key);
        });
      });
    });
  });
  return { total: order.length, indexMap };
}

const { total: CENSOR_TOTAL, indexMap: CENSOR_INDEX } = buildCensor();

/*
 * Fade-in choreography. Each rendered block (section label + each row) gets a
 * global incrementing delay so the document appears top-to-bottom. INTRO_END_MS
 * is derived from the last block's delay so the censor sweep only starts after
 * everything is visible — adding sections keeps this in sync automatically.
 */
const FADE_STEP_S = 0.12;
const FADE_DURATION_S = 0.8;
// Count fade-in blocks: one per section label + one per row.
const FADE_BLOCKS = SECTIONS.reduce((n, s) => n + 1 + s.rows.length, 0);
const INTRO_END_MS = Math.round(((FADE_BLOCKS - 1) * FADE_STEP_S + FADE_DURATION_S) * 1000) + 200;

const BAR_INTERVAL_MS = 80;
const RED_START_AFTER = Math.floor(CENSOR_TOTAL * 0.65);
const RED_TRANSITION_MS = 1400;

export default function Hero() {
  // How many words have a bar drawn over them (global sweep position).
  const [censoredCount, setCensoredCount] = useState(0);
  // false = keyword stays normal ink, true = transition to deep red.
  const [keywordRed, setKeywordRed] = useState(false);
  // Rows become click-to-toggle only once the first sweep has finished.
  const [sweepDone, setSweepDone] = useState(false);
  // Whether the visitor has toggled every bar on the page off.
  const [revealed, setRevealed] = useState(false);
  const censorStarted = useRef(false);

  useEffect(() => {
    let censorTimer;
    let redTimer;

    const introTimer = setTimeout(() => {
      if (censorStarted.current) return;
      censorStarted.current = true;

      let count = 0;
      censorTimer = setInterval(() => {
        count++;
        setCensoredCount(count);

        if (count >= RED_START_AFTER && !redTimer) {
          redTimer = setTimeout(() => {
            setKeywordRed(true);
          }, 200);
        }

        if (count >= CENSOR_TOTAL) {
          clearInterval(censorTimer);
          setSweepDone(true);
        }
      }, BAR_INTERVAL_MS);
    }, INTRO_END_MS);

    return () => {
      clearTimeout(introTimer);
      clearInterval(censorTimer);
      clearTimeout(redTimer);
    };
  }, []);

  const toggleRevealed = () => setRevealed((r) => !r);

  // Renders one segment into one or more word spans.
  // Each word is an unbreakable piece that carries its own censor bar, so a
  // bar never has to span a line break. Emails/URLs are split into several
  // pieces with break points right after "@" and "/" (never mid-name).
  const pieces = (word) =>
    word.split(/(?<=[@/])/).flatMap((part, i) => [
      ...(i ? [<wbr key={`b${i}`} />] : []),
      <span key={i} className='hero-piece'>{part}</span>,
    ]);

  // rowEnd: what follows the row's last word ('' normally; ' ' in the flowing
  // paragraph, kept inside the word so the censor bar has no gap between rows)
  const renderSegment = (seg, sIdx, rIdx, segIdx, isLastSeg, rowEnd = '') => {
    if (seg.kind === 'link') {
      const external = seg.href.startsWith('http');
      return (
        <a
          key={segIdx}
          href={seg.href}
          className='hero-link'
          style={{
            color: keywordRed ? 'var(--key-red)' : 'var(--text)',
            transition: `color ${RED_TRANSITION_MS}ms ease`,
          }}
          {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
          {...(seg.download && { download: seg.download })}
        >
          {seg.text.split(' ').map((w, i) => (
            <React.Fragment key={i}>{i ? ' ' : ''}{pieces(w)}</React.Fragment>
          ))}
        </a>
      );
    }

    if (seg.kind === 'keyword') {
      return (
        <span
          key={segIdx}
          className='hero-word-exempt'
          style={{
            color: keywordRed ? 'var(--key-red)' : 'var(--text)',
            transition: `color ${RED_TRANSITION_MS}ms ease`,
          }}
        >
          {seg.text}{isLastSeg ? rowEnd : seg.tight ? '' : ' '}
        </span>
      );
    }

    const words = seg.text.split(' ');
    return words.map((word, wordIdx) => {
      const isLastWord = wordIdx === words.length - 1;
      const trailing = isLastWord ? (isLastSeg ? rowEnd : ' ') : ' ';

      if (seg.kind === 'value') {
        return (
          <span key={`${segIdx}-${wordIdx}`} className='hero-word'>
            {pieces(word)}{trailing}
          </span>
        );
      }

      // redact
      const gi = CENSOR_INDEX.get(`${sIdx}:${rIdx}:${segIdx}:${wordIdx}`);
      const isCensored = gi !== undefined && gi < censoredCount;
      // Revealed words keep the censored box (no layout shift), just hide the bar.
      const isRevealed = isCensored && revealed;
      return (
        <span
          key={`${segIdx}-${wordIdx}`}
          className={
            isCensored
              ? `hero-word-censored${isRevealed ? ' is-revealed' : ''}`
              : 'hero-word'
          }
        >
          {pieces(word)}{trailing}
        </span>
      );
    });
  };

  // Running counter for global fade-in delays (label + each row).
  let fadeOrder = -1;
  const nextDelay = () => {
    fadeOrder += 1;
    return fadeOrder * FADE_STEP_S;
  };

  return (
    <div className='dossier'>
      <div className='dossier-classified'>// CLASSIFIED //</div>

      {SECTIONS.map((section, sIdx) => (
        <section key={section.id} className={`dossier-section dossier-${section.type}`}>
          <motion.h2
            className='dossier-label'
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: FADE_DURATION_S, delay: nextDelay() }}
          >
            {section.label}
          </motion.h2>

          {section.rows.map((row, rIdx) => {
            const segs = row.segments;
            const toggleable = sweepDone && segs.some((seg) => seg.kind === 'redact');
            const toggleProps = toggleable
              ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-pressed': revealed,
                  onClick: () => {
                    // Don't toggle when the click just finished a text selection.
                    if (window.getSelection()?.toString()) return;
                    toggleRevealed();
                  },
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleRevealed();
                    }
                  },
                }
              : {};
            return (
              <motion.div
                key={rIdx}
                className={`dossier-row${toggleable ? ' dossier-row-toggle' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: FADE_DURATION_S, delay: nextDelay() }}
                {...toggleProps}
              >
                {row.key && <span className='dossier-key'>{row.key}:</span>}
                <span className='dossier-fields'>
                  {segs.map((seg, segIdx) =>
                    renderSegment(
                      seg, sIdx, rIdx, segIdx, segIdx === segs.length - 1,
                      section.type === 'paragraph' && rIdx < section.rows.length - 1 ? ' ' : ''
                    )
                  )}
                </span>
              </motion.div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
