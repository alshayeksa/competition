import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Timer({ seconds, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(true);
  const isFirstRender = useRef(true);
  const timerRef = useRef(null);
  const bgAudioRef = useRef(null);

  useEffect(() => {
    // صوت بداية السؤال 
    const showAudio = new Audio('/show.wav');
    showAudio.play().catch(e => console.log('Show audio autoplay blocked by browser:', e));

    // تشغيل صوت التايمر المستمر (timer.mp3 الذي مدته 40 ثانية)
    const bgAudio = new Audio('/timer.mp3');
    bgAudioRef.current = bgAudio;
    bgAudio.play().catch(e => console.log('Timer audio blocked by browser:', e));

    return () => {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeLeft <= 0 && isActive) {
      // إيقاف الصوت عند انتهاء الوقت والوقت يصل للصفر
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
      setIsActive(false);
      onTimeUp();
      return;
    }
  }, [timeLeft, onTimeUp, isActive]);

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
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
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
      className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full border-4 shadow-lg bg-slate-800 ${isWarning ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'}`}
    >
      <span className="text-lg sm:text-xl md:text-3xl font-black">{timeLeft}</span>
    </motion.div>
  );
}