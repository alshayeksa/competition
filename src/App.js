import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import WinnerScreen from './WinnerScreen';
import TitleLogo from './TitleLogo';
import { motion } from 'framer-motion';

export default function App() {
  const [phase, setPhase] = useState('splash');
  const [teams, setTeams] = useState({
    team1: { name: 'قطاع الخدمات', color: 'red' },
    team2: { name: 'قطاع الأعمال', color: 'blue' }
  });
  const [winner, setWinner] = useState(null);
  const [initialTurn, setInitialTurn] = useState(1);

  useEffect(() => {
    let isCancelled = false;
    let audio = null;
    let playPromise = null;

    if (phase === 'start') {
      audio = new Audio('/start.mp3');
      audio.loop = true; // Let's make it loop so that it serves as background music

      const tryPlay = () => {
        if (isCancelled) return;
        playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log('Audio autoplay blocked by browser:', e));
        }
      };

      // Try playing immediately
      tryPlay();

      // If the browser blocked autoplay, this will trigger playing on the first interaction
      const onUserInteract = () => {
        if (isCancelled) return;
        tryPlay();
        cleanupListeners();
      };

      const cleanupListeners = () => {
        document.removeEventListener('click', onUserInteract);
        document.removeEventListener('keydown', onUserInteract);
        document.removeEventListener('touchstart', onUserInteract);
      };

      document.addEventListener('click', onUserInteract);
      document.addEventListener('keydown', onUserInteract);
      document.addEventListener('touchstart', onUserInteract);

      return () => {
        isCancelled = true;
        cleanupListeners();
        if (audio) {
          if (playPromise !== null && playPromise !== undefined) {
            playPromise.then(() => {
              audio.pause();
              audio.currentTime = 0;
            }).catch(() => {});
          } else {
            audio.pause();
            audio.currentTime = 0;
          }
        }
      };
    }
  }, [phase]);

  const startGame = () => {
    setInitialTurn(Math.random() > 0.5 ? 1 : 2);
    setPhase('playing');
  };

  if (phase === 'splash') {
    return (
      <div 
        dir="rtl"
        onClick={() => setPhase('start')}
        className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4 cursor-pointer select-none"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-8">🌉</div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow-2xl">
            جسر المعرفة
          </h1>
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-2xl md:text-3xl text-gray-300 mt-8"
          >
            اضغط للمتابعة
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (phase === 'start') {
    return (
      <div dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <div className="mb-14">
          <TitleLogo />
        </div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-12 mb-12 bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl"
        >
          <div className="flex flex-col gap-4 items-center">
            <input className="p-3 bg-red-950/50 border-2 border-red-500/50 text-white rounded-xl text-center font-bold text-2xl focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/20 transition-all w-64" value={teams.team1.name} onChange={e => setTeams({...teams, team1: {...teams.team1, name: e.target.value}})} />
            <div className="w-full h-3 bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
          </div>
          <div className="flex flex-col gap-4 items-center">
            <input className="p-3 bg-blue-950/50 border-2 border-blue-500/50 text-white rounded-xl text-center font-bold text-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all w-64" value={teams.team2.name} onChange={e => setTeams({...teams, team2: {...teams.team2, name: e.target.value}})} />
            <div className="w-full h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
          </div>
        </motion.div>

        <motion.button 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(52,211,153,0.6)" }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame} 
          className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-3xl font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          ابدأ التحدي
        </motion.button>
      </div>
    );
  }

  if (phase === 'won') return <WinnerScreen winner={winner} onRestart={() => setPhase('start')} />;

  return (
    <div dir="rtl" className="min-h-screen bg-wavy-animated text-white p-4 flex flex-col items-center">
      <GameBoard teams={teams} initialTurn={initialTurn} onWin={(team) => { setWinner(team); setPhase('won'); }} />
    </div>
  );
}