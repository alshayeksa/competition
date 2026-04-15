import React from 'react';
import { motion } from 'framer-motion';

export default function Square({ value, num, onClick, teams, delay }) {
  let isUnowned = value === 0;

  let styleClasses = 'bg-slate-700 hover:bg-slate-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]';
  
  if (value === 1) {
    styleClasses = 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_15px_rgba(220,38,38,0.8)] border border-red-400/50 z-10';
  } else if (value === 2) {
    styleClasses = 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.8)] border border-blue-400/50 z-10';
  }

  // Animation variants
  const variants = {
    hidden: { 
      scale: 0.5, 
      opacity: 0, 
      rotateX: 90,
      backgroundColor: '#f59e0b',
      boxShadow: '0px 0px 30px rgba(245, 158, 11, 0)'
    },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotateX: 0,
      backgroundColor: value === 0 ? '#1e293b' : undefined,
      boxShadow: value === 0 ? '0px 0px 0px rgba(245, 158, 11, 0)' : undefined,
      transition: { 
        delay, 
        duration: 0.8, 
        type: "spring",
        bounce: 0.5
      }
    }
  };

  return (
    <motion.button
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: value === 0 ? 1.08 : 1, zIndex: 20, boxShadow: value === 0 ? '0px 0px 15px rgba(255,255,255,0.3)' : undefined }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={value !== 0}
      className={`w-full h-full rounded-md md:rounded-lg relative transition-colors duration-300 ${styleClasses} flex items-center justify-center overflow-hidden border border-white/5 aspect-square min-w-0`}
    >
      {/* تأثير اللون الدوار للمربعات الغير مملوكة */}
      {isUnowned && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, #eab308 80%, transparent 100%)',
            scale: 2.5
          }}
        />
      )}
      
      {/* غطاء لإخفاء وسط الدوران وإظهار الإطار فقط */}
      {isUnowned && (
        <div className="absolute inset-[2px] bg-slate-800 rounded-md md:rounded-lg z-10 hover:bg-slate-700 transition-colors duration-200" />
      )}

      {/* Number inside the square */}
      <span className={`font-black text-sm sm:text-lg md:text-2xl drop-shadow-lg z-20 pointer-events-none transition-opacity duration-300 ${value === 0 ? 'text-white/30' : 'text-white/90'}`}>
        {num}
      </span>

      {value !== 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/20 rounded-md md:rounded-lg z-10 pointer-events-none"
        />
      )}
    </motion.button>
  );
}