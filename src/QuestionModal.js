import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './Timer';

// مكون رسالة الإجابة
function AnswerFeedback({ isCorrect, onClose }) {
  useEffect(() => {
    // تشغيل الصوت المناسب
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (isCorrect) {
      // صوت النجاح (سلم موسيقي تصاعدي)
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      }, 300);
    } else {
      // صوت الخطأ (نغمة تنازلية)
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      }, 300);
    }
    
    // إغلاق الرسالة بعد 2.5 ثانية
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [isCorrect, onClose]);

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
          className={`relative p-12 md:p-16 rounded-3xl max-w-2xl w-full text-center border-4 ${isCorrect ? 'border-emerald-400 bg-gradient-to-br from-emerald-900 to-emerald-800' : 'border-rose-400 bg-gradient-to-br from-rose-900 to-rose-800'}`}
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
            className="mb-8"
          >
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${isCorrect ? 'bg-emerald-500/20' : 'bg-rose-500/20'} border-4 ${isCorrect ? 'border-emerald-400' : 'border-rose-400'}`}>
              <span className={`text-6xl ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                {isCorrect ? '🎯' : '💫'}
              </span>
            </div>
          </motion.div>

          {/* الرسالة */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-5xl md:text-6xl font-black mb-6 ${isCorrect ? 'text-emerald-100' : 'text-rose-100'}`}
          >
            {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-2xl md:text-3xl font-bold mb-8 ${isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}
          >
            {isCorrect ? '🎉 أحسنت! نقطة مضمونة 🎉' : '💫 حظاً أوفر في السؤال القادم 💫'}
          </motion.p>

          {/* التفسير */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-xl ${isCorrect ? 'text-emerald-300' : 'text-rose-300'} italic`}
          >
            {isCorrect ? 'مستوى ذكاءك مذهل!' : 'لا تستسلم، المعرفة تحتاج صبراً'}
          </motion.div>

          {/* مؤثرات إضافية */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className={`h-1 w-48 mx-auto rounded-full ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function QuestionModal({ question, team, onAnswer }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  const handleOptionClick = (idx) => {
    const isCorrect = idx === question.answer;
    setIsCorrectAnswer(isCorrect);
    setShowFeedback(true);
    
    // إيقاف صوت المؤقت فوراً
    if (window.stopTimer) {
      window.stopTimer();
    }
    
    // تأخير إغلاق النافذة الرئيسية حتى تنتهي الرسالة
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2600);
  };

  const isRed = team.color === 'red';
  const glowColor = isRed ? 'rgba(220,38,38,0.3)' : 'rgba(37,99,235,0.3)';
  const borderColor = isRed ? 'border-red-500/50' : 'border-blue-500/50';

  return (
    <>
      {/* رسالة الإجابة */}
      {showFeedback && (
        <AnswerFeedback 
          isCorrect={isCorrectAnswer} 
          onClose={() => setShowFeedback(false)} 
        />
      )}

      {/* النافذة الرئيسية */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-40" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ type: 'spring', bounce: 0.4 }}
          className={`bg-slate-900 p-8 md:p-12 rounded-3xl max-w-3xl w-full text-center relative border-2 ${borderColor}`}
          style={{ boxShadow: `0 0 50px ${glowColor}, inset 0 0 20px ${glowColor}` }}
        >
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`inline-block px-6 py-2 rounded-full border mb-8 ${isRed ? 'bg-red-950/50 border-red-500 text-red-400' : 'bg-blue-950/50 border-blue-500 text-blue-400'}`}
          >
            <span className="text-xl font-bold">سؤال لـ: {team.name}</span>
          </motion.div>
          
          <div className="absolute top-8 left-8">
            <Timer seconds={40} onTimeUp={() => {
              setIsCorrectAnswer(false);
              setShowFeedback(true);
              setTimeout(() => onAnswer(false), 2600);
            }} />
          </div>
          
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400"
          >
            {question.question}
          </motion.h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {question.options.map((opt, idx) => (
              <motion.button 
                key={idx} 
                initial={{ opacity: 0, x: idx % 2 === 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionClick(idx)} 
                className="relative overflow-hidden p-6 bg-slate-800/80 border border-slate-600 rounded-2xl text-xl md:text-2xl text-white font-bold shadow-lg group"
              >
                <div className={`absolute inset-0 w-2 ${isRed ? 'bg-red-500' : 'bg-blue-500'} group-hover:w-full transition-all duration-300 opacity-20`} />
                <span className="relative z-10">{opt}</span>
              </motion.button>
            ))}
          </div>

        </motion.div>
      </div>
    </>
  );
}