import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// ── Orbiting star sparks ──────────────────────────────────────────────────────
const SPARKS = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * 360,
  r:     160 + (i % 3) * 40,
  size:  4 + (i % 4) * 3,
  delay: i * 0.06,
  dur:   1.8 + (i % 3) * 0.5,
}));

// ── Burst rays ────────────────────────────────────────────────────────────────
const RAYS = Array.from({ length: 12 }, (_, i) => ({
  angle: i * 30,
  delay: i * 0.05,
}));

export default function WinnerScreen({ winner, onRestart }) {
  const isRed = winner.color === 'red';

  const primaryColor   = isRed ? '#ef4444' : '#3b82f6';
  const secondaryColor = isRed ? '#fca5a5' : '#93c5fd';
  const glowRgba       = isRed ? 'rgba(239,68,68,0.7)'   : 'rgba(59,130,246,0.7)';
  const glowSoft       = isRed ? 'rgba(239,68,68,0.25)'  : 'rgba(59,130,246,0.25)';
  const bgFrom         = isRed ? 'from-red-950'          : 'from-blue-950';
  const confettiColors = isRed
    ? ['#ef4444','#fca5a5','#fde047','#fff','#f97316']
    : ['#3b82f6','#93c5fd','#fde047','#fff','#a78bfa'];

  // Crown bounce loop
  const crownAnim = {
    y:     [0, -14, 0],
    scale: [1, 1.08, 1],
  };

  // Pulse on winner name
  const namePulse = {
    textShadow: [
      `0 0 20px ${glowRgba}, 0 0 60px ${glowSoft}`,
      `0 0 50px ${glowRgba}, 0 0 120px ${glowRgba}`,
      `0 0 20px ${glowRgba}, 0 0 60px ${glowSoft}`,
    ],
  };

  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const audio = new Audio('/winner.mp3');
    audio.play().catch(err => console.log('Winner audio error:', err));
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <div
      dir="rtl"
      className={`min-h-screen bg-gradient-to-b ${bgFrom} via-gray-950 to-black text-white flex flex-col items-center justify-center overflow-hidden relative`}
    >
      {/* ── Confetti ── */}
      <Confetti recycle={true} numberOfPieces={320} colors={confettiColors} />

      {/* ── Background radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${glowSoft} 0%, transparent 70%)`,
        }}
      />

      {/* ── Burst rays (behind everything) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
        {RAYS.map((ray, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0.6], opacity: [0, 0.18, 0.08] }}
            transition={{ delay: 0.3 + ray.delay, duration: 1.2, ease: 'easeOut' }}
            style={{
              position:        'absolute',
              width:           3,
              height:          320,
              borderRadius:    2,
              background:      `linear-gradient(to top, transparent, ${primaryColor})`,
              transformOrigin: 'bottom center',
              rotate:          `${ray.angle}deg`,
              bottom:          '50%',
            }}
          />
        ))}
      </div>

      {/* ── Orbiting sparks ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        {SPARKS.map((sp, i) => {
          const rad = (sp.angle * Math.PI) / 180;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ width: sp.size, height: sp.size, background: i % 3 === 0 ? '#fde047' : secondaryColor }}
              animate={{
                x: [
                  Math.cos(rad) * sp.r * 0.4,
                  Math.cos(rad) * sp.r,
                  Math.cos(rad) * sp.r * 0.4,
                ],
                y: [
                  Math.sin(rad) * sp.r * 0.4,
                  Math.sin(rad) * sp.r,
                  Math.sin(rad) * sp.r * 0.4,
                ],
                opacity: [0, 0.9, 0],
                scale:   [0, 1.2, 0],
              }}
              transition={{ delay: sp.delay, duration: sp.dur, repeat: Infinity, ease: 'easeInOut' }}
            />
          );
        })}
      </div>

      {/* ── Main card ── */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 60 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            transition={{ type: 'spring', bounce: 0.5, duration: 1.2 }}
            className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 text-center"
          >

            {/* Title Above Crown */}
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0,   opacity: 1  }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-200 mt-4"
              dir="rtl"
            >
              بطل مسابقة جسر المعرفة
            </motion.div>

            {/* Crown icon */}
            <motion.div
              animate={crownAnim}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl drop-shadow-[0_0_25px_rgba(253,224,71,0.9)]"
            >
              👑
            </motion.div>

            {/* Ornamental divider */}
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex items-center gap-3"
            >
              <div className="h-px w-24 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${primaryColor})` }} />
              <span className="text-yellow-400 text-lg">✦</span>
              <div className="h-px w-24 rounded-full" style={{ background: `linear-gradient(to left, transparent, ${primaryColor})` }} />
            </motion.div>

            {/* Winner name */}
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1  }}
              transition={{ delay: 1.0, type: 'spring', bounce: 0.55, duration: 1.0 }}
              animate2={namePulse}
              className="text-6xl md:text-8xl font-black tracking-wide"
              style={{
                background: `linear-gradient(135deg, #fff 0%, ${secondaryColor} 40%, ${primaryColor} 70%, #fde047 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: `drop-shadow(0 0 28px ${glowRgba}) drop-shadow(0 4px 12px rgba(0,0,0,0.8))`,
              }}
            >
              {winner.name}
            </motion.h1>

            {/* Glow pulse under name */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 420, height: 100,
                background: `radial-gradient(ellipse at center, ${glowRgba} 0%, transparent 70%)`,
                filter: 'blur(18px)',
                top: '55%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: -1,
              }}
            />

            {/* Star row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="flex gap-3 text-3xl"
            >
              {['⭐','🏆','⭐'].map((e, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -8, 0], rotate: [0, i === 1 ? 15 : -10, 0] }}
                  transition={{ duration: 1.8, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>

            {/* Restart button */}
            <motion.button
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0,  opacity: 1  }}
              transition={{ delay: 2.0, type: 'spring' }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.94 }}
              onClick={onRestart}
              className="mt-4 px-14 py-5 rounded-2xl font-extrabold text-2xl text-white shadow-2xl border-2 transition-all"
              style={{
                background:   `linear-gradient(135deg, ${primaryColor}, ${isRed ? '#dc2626' : '#2563eb'})`,
                borderColor:  secondaryColor,
                boxShadow:    `0 0 30px ${glowSoft}, 0 8px 32px rgba(0,0,0,0.5)`,
              }}
            >
              🔄 العب مرة أخرى
            </motion.button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
