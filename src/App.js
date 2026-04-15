import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import WinnerScreen from './WinnerScreen';
import TitleLogo from './TitleLogo';
import { motion } from 'framer-motion';

export default function App() {
  const [phase, setPhase] = useState('start');
  const [teams, setTeams] = useState({
    team1: { name: 'الفريق الأحمر', color: 'red' },
    team2: { name: 'الفريق الأزرق', color: 'blue' }
  });
  const [winner, setWinner] = useState(null);
  const [initialTurn, setInitialTurn] = useState(1);

  useEffect(() => {
    if (phase === 'start') {
      const audio = new Audio('/1.wav');
      audio.loop = true; // Let's make it loop so that it serves as background music

      const tryPlay = () => {
        audio.play().catch(e => console.log('Audio autoplay blocked by browser:', e));
      };

      // Try playing immediately
      tryPlay();

      // If the browser blocked autoplay, this will trigger playing on the first interaction
      const onUserInteract = () => {
        tryPlay();
        document.removeEventListener('click', onUserInteract);
        document.removeEventListener('keydown', onUserInteract);
        document.removeEventListener('touchstart', onUserInteract);
      };

      document.addEventListener('click', onUserInteract);
      document.addEventListener('keydown', onUserInteract);
      document.addEventListener('touchstart', onUserInteract);

      return () => {
        audio.pause();
        audio.currentTime = 0;
        document.removeEventListener('click', onUserInteract);
        document.removeEventListener('keydown', onUserInteract);
        document.removeEventListener('touchstart', onUserInteract);
      };
    }
  }, [phase]);

  const startGame = () => {
    setInitialTurn(Math.random() > 0.5 ? 1 : 2);
    setPhase('playing');
  };

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
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black text-white p-4 flex flex-col items-center">
      <GameBoard teams={teams} initialTurn={initialTurn} onWin={(team) => { setWinner(team); setPhase('won'); }} />
    </div>
  );
}