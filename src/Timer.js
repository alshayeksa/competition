import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// إنشاء AudioContext مرة واحدة فقط (لتجنب حظر المتصفح بعد 6 أصوات)
let audioCtx = null;
const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  return audioCtx;
};

// دالة لتوليد أصوات التنبيه
const playBeep = (freq, type, duration, vol = 0.5) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // استئناف السياق الصوتي إذا كان معلقاً بسبب المتصفح
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // تدرج في الصوت لتجنب "الفرقعة"
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log("AudioContext blocked or failed", e);
  }
};

export default function Timer({ seconds, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(true);
  const isFirstRender = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    // صوت بداية السؤال 
    const audio = new Audio('/show.wav');
    audio.play().catch(e => console.log('Audio autoplay blocked by browser:', e));
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeLeft <= 0) {
      // صوت انتهاء الوقت
      playBeep(200, 'sawtooth', 1.0, 0.6);
      setIsActive(false);
      onTimeUp();
      return;
    }

    if (timeLeft < seconds && isActive) {
      // الاستمرار في صوت التيك التنازلي كل ثانية
      const freq = timeLeft <= 5 ? 880 : 600; 
      const vol = timeLeft <= 5 ? 0.5 : 0.2;
      playBeep(freq, 'square', 0.1, vol);
    }

  }, [timeLeft, onTimeUp, seconds, isActive]);

  useEffect(() => {
    if (timeLeft <= 0 || !isActive) return;
    timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft, isActive]);

  // دالة لإيقاف المؤقت
  const stopTimer = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // تصدير الدالة للاستخدام من الخارج
  useEffect(() => {
    // إضافة دالة stopTimer إلى window للوصول إليها من QuestionModal
    window.stopTimer = stopTimer;
    return () => {
      window.stopTimer = null;
    };
  }, []);

  const isWarning = timeLeft <= 5;

  return (
    <motion.div 
      animate={isWarning ? { scale: [1, 1.1, 1], color: ['#fff', '#ef4444', '#fff'] } : {}}
      transition={isWarning ? { repeat: Infinity, duration: 0.5 } : {}}
      className={`relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full border-4 shadow-lg bg-slate-800 ${isWarning ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'}`}
    >
      <span className="text-2xl md:text-3xl font-black">{timeLeft}</span>
    </motion.div>
  );
}