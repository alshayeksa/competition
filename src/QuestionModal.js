import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './Timer';

// مكون رسالة الإجابة
function AnswerFeedback({ isCorrect, onClose }) {
  const onCloseRef = React.useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const audio = new Audio(isCorrect ? '/correct.wav' : '/wrong.wav');
    
    let isFinished = false;
    const finish = () => {
      if (!isFinished) {
        isFinished = true;
        onCloseRef.current();
      }
    };

    // ننتظر 2 ثواني بعد انتهاء الصوت لزيادة الحماس قبل إغلاق الشاشة
    audio.onended = () => setTimeout(finish, 2000);

    audio.play().catch(e => {
      console.log('Audio error:', e);
      // Fallback if browser blocks autoplay (e.g. 4 seconds)
      setTimeout(finish, 4000);
    });

    // Safety fallback in case audio gets stuck
    const timer = setTimeout(finish, 15000);

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isCorrect]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${isCorrect ? 'bg-emerald-900/90' : 'bg-rose-900/90'}`}
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <motion.div
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ delay: 0.1, type: 'spring', bounce: 0.6 }}
          className={`relative p-6 sm:p-8 md:p-16 rounded-3xl max-w-2xl w-full text-center border-4 ${isCorrect ? 'border-emerald-400 bg-gradient-to-br from-emerald-900 to-emerald-800' : 'border-rose-400 bg-gradient-to-br from-rose-900 to-rose-800'}`}
          style={{ 
            boxShadow: isCorrect 
              ? '0 0 80px rgba(52, 211, 153, 0.6), inset 0 0 40px rgba(52, 211, 153, 0.3)' 
              : '0 0 80px rgba(244, 63, 94, 0.6), inset 0 0 40px rgba(244, 63, 94, 0.3)'
          }}
        >
          {/* مؤثرات الجسيمات */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 - 50, 
                  y: Math.random() * 100 - 50,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100,
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className={`absolute w-2 h-2 rounded-full ${isCorrect ? 'bg-emerald-300' : 'bg-rose-300'}`}
              />
            ))}
          </div>

          {/* الأيقونة */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.8 }}
            className="mb-5 sm:mb-8"
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full ${isCorrect ? 'bg-emerald-500/20' : 'bg-rose-500/20'} border-4 ${isCorrect ? 'border-emerald-400' : 'border-rose-400'}`}>
              <span className={`text-5xl sm:text-6xl ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                {isCorrect ? '🎯' : '💫'}
              </span>
            </div>
          </motion.div>

          {/* الرسالة */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 ${isCorrect ? 'text-emerald-100' : 'text-rose-100'}`}
          >
            {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-lg sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-8 ${isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}
          >
            {isCorrect ? '🎉 أحسنت! نقطة مضمونة 🎉' : '💫 حظاً أوفر في السؤال القادم 💫'}
          </motion.p>

          {/* التفسير */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-base sm:text-lg md:text-xl ${isCorrect ? 'text-emerald-300' : 'text-rose-300'} italic`}
          >
            {isCorrect ? 'مستوى ذكاءك مذهل!' : 'لا تستسلم، المعرفة تحتاج صبراً'}
          </motion.div>

          {/* مؤثرات إضافية */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 sm:mt-8"
          >
            <div className={`h-1 w-32 sm:w-40 md:w-48 mx-auto rounded-full ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function QuestionModal({ question, team, onAnswer }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(false);

  // منع الضغط على الخيارات لمدة ثانية بعد ظهور السؤال لتفادي الضغط العرضي
  useEffect(() => {
    const t = setTimeout(() => setOptionsEnabled(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleOptionClick = (idx) => {
    if (!optionsEnabled || showFeedback) return;
    const isCorrect = idx === question.answer;
    
    setIsCorrectAnswer(isCorrect);
    setShowFeedback(true);
    
    // إيقاف صوت المؤقت فوراً
    if (window.stopTimer) {
      window.stopTimer();
    }
  };

  const handleTimeUp = useCallback(() => {
    setIsCorrectAnswer(false);
    setShowFeedback(true);
  }, []);

  const isRed = team.color === 'red';
  const glowColor = isRed ? 'rgba(220,38,38,0.5)' : 'rgba(37,99,235,0.5)';
  const glowStrong = isRed ? 'rgba(220,38,38,0.8)' : 'rgba(37,99,235,0.8)';
  const borderColor = isRed ? 'border-red-500/50' : 'border-blue-500/50';
  const optionLabels = ['أ', 'ب', 'ج', 'د'];

  return (
    <>
      {/* رسالة الإجابة */}
      {showFeedback && (
        <AnswerFeedback 
          isCorrect={isCorrectAnswer} 
          onClose={() => onAnswer(isCorrectAnswer)} 
        />
      )}

      {/* النافذة الرئيسية */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-40 overflow-y-auto" dir="rtl">
        
        {/* جسيمات خلفية متحركة */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${isRed ? 'bg-red-400' : 'bg-blue-400'}`}
              initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
              animate={{ 
                y: [null, Math.random() * -600],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{ duration: 3 + Math.random() * 3, delay: i * 0.15, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.6, rotateX: 40 }} 
          animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
          transition={{ type: 'spring', bounce: 0.45, duration: 0.8 }}
          className={`my-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-12 rounded-3xl max-w-3xl w-full text-center relative border-2 ${borderColor} overflow-hidden`}
          style={{ boxShadow: `0 0 80px ${glowColor}, 0 0 160px ${glowColor}, inset 0 0 30px ${glowColor}` }}
        >
          
          {/* خطوط ديكور متحركة في الأعلى */}
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${glowStrong}, transparent)` }}
          />
          <motion.div 
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${glowStrong}, transparent)` }}
          />

          {/* بادج اسم الفريق */}
          <motion.div 
            initial={{ y: -30, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className={`inline-flex max-w-full items-center gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full border-2 mb-6 md:mb-8 ${isRed ? 'bg-red-950/70 border-red-500 text-red-300' : 'bg-blue-950/70 border-blue-500 text-blue-300'}`}
            style={{ boxShadow: `0 0 20px ${glowColor}` }}
          >
            <motion.span 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xl sm:text-2xl"
            >⚡</motion.span>
            <span className="text-sm sm:text-lg md:text-xl font-black break-words">سؤال لـ: {team.name}</span>
          </motion.div>
          
          <div className="absolute top-3 left-3 sm:top-5 sm:left-5 md:top-8 md:left-8">
            <Timer seconds={40} onTimeUp={handleTimeUp} />
          </div>
          
          {/* نص السؤال */}
          <motion.h3 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="text-xl sm:text-2xl md:text-4xl font-black mb-8 sm:mb-10 md:mb-14 leading-relaxed pt-12 sm:pt-14 md:pt-0"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 2px 10px ${glowColor})`
            }}
          >
            {question.question}
          </motion.h3>
          
          {/* الخيارات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {question.options.map((opt, idx) => {
              const optColors = [
                { bg: 'from-rose-600 to-red-800', border: 'border-rose-400', glow: 'rgba(244,63,94,0.6)', label: 'bg-rose-500/40 text-rose-200' },
                { bg: 'from-sky-600 to-blue-800', border: 'border-sky-400', glow: 'rgba(56,189,248,0.6)', label: 'bg-sky-500/40 text-sky-200' },
                { bg: 'from-amber-500 to-yellow-700', border: 'border-amber-400', glow: 'rgba(245,158,11,0.6)', label: 'bg-amber-500/40 text-amber-200' },
                { bg: 'from-emerald-500 to-green-800', border: 'border-emerald-400', glow: 'rgba(52,211,153,0.6)', label: 'bg-emerald-500/40 text-emerald-200' },
              ];
              const c = optColors[idx];
              return (
              <motion.button 
                key={idx} 
                initial={{ opacity: 0, y: 50, scale: 0.7, rotateY: 90 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.4 + idx * 0.15, type: 'spring', bounce: 0.5 }}
                whileHover={optionsEnabled && !showFeedback ? { 
                  scale: 1.08, 
                  boxShadow: `0 0 40px ${c.glow}`,
                  y: -6
                } : {}}
                whileTap={optionsEnabled && !showFeedback ? { scale: 0.92 } : {}}
                onClick={() => handleOptionClick(idx)}
                disabled={!optionsEnabled || showFeedback}
                className={`relative overflow-hidden p-4 sm:p-5 md:p-6 rounded-2xl text-base sm:text-lg md:text-2xl text-white font-bold shadow-xl group transition-all duration-300 border-2 ${c.border} ${(!optionsEnabled || showFeedback) ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                style={{ boxShadow: `0 0 15px ${c.glow}` }}
              >
                {/* خلفية متدرجة نابضة */}
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 }}
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${c.bg} pointer-events-none`}
                />

                {/* شعاع ضوئي متحرك */}
                <motion.div
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)` }}
                />

                {/* حرف الاختيار */}
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
                  className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black ${c.label} backdrop-blur-sm border border-white/20`}
                >
                  {optionLabels[idx]}
                </motion.span>

                {/* دوران الإطار */}
                {optionsEnabled && !showFeedback && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0%, transparent 60%, white 80%, transparent 100%)`,
                      scale: 2.5
                    }}
                  />
                )}

                <span className="relative z-10 drop-shadow-lg">{opt}</span>
              </motion.button>
              );
            })}
          </div>

        </motion.div>
      </div>
    </>
  );
}