import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ─── Local heartbeat audio player ────────────────────────────────────────────
function createPlayer() {
  const audio = new Audio('/heartbeat.wav');
  audio.preload = 'auto';
  audio.volume  = 1.0;
  return audio;
}

// ─── Floating golden particles ────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left:     `${6 + (i % 7) * 14}%`,
  size:     3 + (i % 3) * 2,
  duration: 2.4 + (i % 4) * 0.7,
  delay:    i * 0.25,
  drift:    i % 2 === 0 ? 18 : -18,
}));

// ─── Ornamental row ───────────────────────────────────────────────────────────
const OrnamentRow = ({ delay }) => (
  <motion.div
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: 1 }}
    transition={{ delay, duration: 0.9, ease: 'easeOut' }}
    className="flex items-center justify-center gap-2"
  >
    {['◆', '──', '◆', '──', '◆'].map((c, i) => (
      <span
        key={i}
        className={c === '──'
          ? 'text-yellow-400/40 text-lg tracking-tighter'
          : 'text-yellow-400 text-[10px]'}
      >
        {c}
      </span>
    ))}
  </motion.div>
);

// ─── ECG / heartbeat trace ────────────────────────────────────────────────────
const EcgLine = () => (
  <svg viewBox="0 0 300 46" preserveAspectRatio="xMidYMid meet" className="w-full max-w-[220px] sm:max-w-[260px] md:max-w-[300px] h-auto opacity-70">
    <defs>
      <linearGradient id="ecg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="transparent" />
        <stop offset="18%"  stopColor="#fbbf24" stopOpacity="0.7" />
        <stop offset="50%"  stopColor="#f59e0b" />
        <stop offset="82%"  stopColor="#fbbf24" stopOpacity="0.7" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <motion.path
      /* flat – P-wave – flat – Q – R spike – S – flat – T-wave – flat */
      d="M 0,23 L 48,23 C 53,23 55,19 58,16 C 61,13 63,23 66,23
         L 76,23 L 79,37 L 85,2 L 91,38 L 95,23
         L 110,23 C 115,23 121,13 127,10 C 132,7 137,14 141,19
         L 147,23 L 300,23"
      fill="none"
      stroke="url(#ecg)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: 2.2, duration: 1.6, ease: 'easeInOut' }}
    />
    {/* Travelling glow dot */}
    <motion.circle
      r="4"
      fill="#fef08a"
      filter="url(#dotGlow)"
      initial={{ offsetDistance: '0%', opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ delay: 3.8, duration: 0.6, ease: 'easeOut' }}
      style={{ cy: 23 }}
    />
    <defs>
      <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function TitleLogo() {
  const playerRef  = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Heartbeat logic removed to let '1.wav' play alone.
  }, []);

  // Heartbeat pulse: LUB (t=0) → DUB (t=0.19) → rest
  const beatAnim = {
    scale: [1, 1.08, 1.0, 1.05, 1.0, 1.0],
    times: [0, 0.05, 0.17, 0.22, 0.30, 1.0],
  };
  const glowAnim = {
    scale:   [1,  2.5, 1.2,  2.0,  1.0, 1.0],
    opacity: [0.2, 0.95, 0.35, 0.75, 0.2, 0.2],
    times:   [0,  0.05, 0.17, 0.22, 0.30, 1.0],
  };

  return (
    <div className="relative w-full max-w-[92vw] sm:max-w-3xl text-center select-none py-2 px-2 mx-auto overflow-hidden">

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-amber-400"
            style={{ left: p.left, bottom: 0, width: p.size, height: p.size }}
            animate={{ y: [0, -130, 0], x: [0, p.drift, 0], opacity: [0, 0.9, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Pulsing glow blob ── */}
      <motion.div
        animate={glowAnim}
      transition={{ duration: 1.1, times: glowAnim.times, repeat: Infinity, delay: 1.8 }}
        className="absolute left-1/2 top-1/2 w-48 sm:w-64 md:w-72 h-20 sm:h-24 md:h-28 rounded-full pointer-events-none"
        style={{
          zIndex: 0,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.65) 0%, rgba(245,158,11,0.2) 55%, transparent 80%)',
          filter: 'blur(22px)',
        }}
      />

      {/* ── Top ornament ── */}
      <div className="relative mb-4" style={{ zIndex: 1 }}>
        <OrnamentRow delay={0.2} />
      </div>

      {/* ── Title words with heartbeat pulse ── */}
      <motion.div
        animate={beatAnim}
        transition={{ duration: 1.1, times: beatAnim.times, repeat: Infinity, delay: 1.8 }}
        style={{ zIndex: 1, position: 'relative' }}
      >
        <div dir="rtl" className="flex gap-2 sm:gap-4 md:gap-5 justify-center items-end flex-wrap">
          {['جسر', 'المعرفة'].map((word, i) => (
            <motion.div
              key={word}
              initial={{ y: -80, opacity: 0, filter: 'blur(14px)' }}
              animate={{ y: 0,   opacity: 1, filter: 'blur(0px)'  }}
              transition={{ delay: 0.4 + i * 0.5, duration: 0.85, type: 'spring', bounce: 0.45 }}
              className="relative"
            >
              {/* depth shadow */}
              <span
                aria-hidden
                className="absolute text-[2.4rem] sm:text-6xl md:text-8xl font-black select-none pointer-events-none"
                style={{
                  inset: 0,
                  transform: 'translate(3px, 4px)',
                  background: 'linear-gradient(135deg,#92400e,#78350f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  opacity: 0.45,
                  filter: 'blur(3px)',
                }}
              >
                {word}
              </span>

              {/* main text */}
              <span
                className="relative text-[2.4rem] sm:text-6xl md:text-8xl font-black leading-none"
                style={{
                  background: 'linear-gradient(140deg, #fef9c3 0%, #fde047 20%, #fbbf24 45%, #f59e0b 65%, #ea580c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.75)) drop-shadow(0 3px 8px rgba(0,0,0,0.7))',
                  letterSpacing: '0.02em',
                }}
              >
                {word}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Bottom ornament ── */}
      <div className="relative mt-4" style={{ zIndex: 1 }}>
        <OrnamentRow delay={1.3} />
      </div>

      {/* ── Tagline ── */}
      <motion.p
        dir="rtl"
        initial={{ opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 1, letterSpacing: '0.2em' }}
        transition={{ delay: 1.6, duration: 0.9 }}
        className="mt-3 text-[10px] sm:text-xs md:text-sm text-amber-300/65 font-light uppercase leading-relaxed"
        style={{ zIndex: 1, position: 'relative' }}
      >
        تحـدى &nbsp;·&nbsp; تنـافـس &nbsp;·&nbsp; انتـصر
      </motion.p>

      {/* ── ECG heartbeat line ── */}
      <div className="flex justify-center mt-3 px-4" style={{ zIndex: 1, position: 'relative' }}>
        <EcgLine />
      </div>

    </div>
  );
}
