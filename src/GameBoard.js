import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Square from './Square';
import QuestionModal from './QuestionModal';
import allQuestions from './questions.json';

const GRID_SIZE = 10;

const checkWin = (grid, playerNum) => {
  // Check Top to Bottom
  let visited = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
  const dfsTB = (r, c) => {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || visited[r][c] || grid[r][c] !== playerNum) return false;
    if (r === GRID_SIZE - 1) return true;
    visited[r][c] = true;
    return dfsTB(r+1, c) || dfsTB(r-1, c) || dfsTB(r, c+1) || dfsTB(r, c-1);
  };

  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[0][c] === playerNum && dfsTB(0, c)) return true;
  }

  // Check Left to Right (Right to Left in RTL mode)
  visited = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));
  const dfsLR = (r, c) => {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || visited[r][c] || grid[r][c] !== playerNum) return false;
    if (c === GRID_SIZE - 1) return true;
    visited[r][c] = true;
    return dfsLR(r+1, c) || dfsLR(r-1, c) || dfsLR(r, c+1) || dfsLR(r, c-1);
  };

  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r][0] === playerNum && dfsLR(r, 0)) return true;
  }

  return false;
};

export default function GameBoard({ teams, initialTurn, onWin }) {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellQuestions, setCellQuestions] = useState({});
  const [questionPool, setQuestionPool] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(initialTurn);
  const bgAudioRef = useRef(null);

  // إعداد اللوحة والصوت عند البدء
  useEffect(() => {
    const audio = new Audio('/start.mp3');
    audio.loop = true; // اجعله يتكرر (looping)
    bgAudioRef.current = audio;

    // التنظيف عند الانتهاء (كفوز أحد الفريقين)
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // تشغيل أو إيقاف الصوت بناءً على فتح/إغلاق سؤال
  useEffect(() => {
    if (!bgAudioRef.current) return;
    const audio = bgAudioRef.current;

    if (selectedCell) {
      // إيقاف الصوت عند النقر على سؤال
      audio.pause();
    } else {
      // إعادة تشغيل الصوت المتكرر عند إغلاق السؤال أو في بداية اللوحة
      audio.play().catch(e => console.log('Board audio blocked:', e));
    }
  }, [selectedCell]);

  useEffect(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const initial = {};
    // Assign one unique question per cell, cycling if questions < cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        initial[`${r}-${c}`] = shuffled[(r * GRID_SIZE + c) % shuffled.length];
      }
    }
    // Pool = questions beyond what was used for initial assignment (no repeats until pool exhausted)
    const pool = shuffled.length > GRID_SIZE * GRID_SIZE
      ? shuffled.slice(GRID_SIZE * GRID_SIZE)
      : shuffled.slice(GRID_SIZE * GRID_SIZE % shuffled.length);
    setCellQuestions(initial);
    setQuestionPool(pool);
  }, []);

  const handleCellClick = (r, c) => {
    if (grid[r][c] !== 0) return;
    const question = cellQuestions[`${r}-${c}`];
    if (!question) return;
    setSelectedCell({ r, c, question });
  };

  const handleAnswer = (isCorrect) => {
    const { r, c } = selectedCell;
    if (isCorrect) {
      const newGrid = grid.map(row => [...row]);
      newGrid[r][c] = currentTurn;
      setGrid(newGrid);
      if (checkWin(newGrid, currentTurn)) {
        onWin(currentTurn === 1 ? teams.team1 : teams.team2);
        return;
      }
    } else {
      // Cell stays open — give it the next unused question from the pool
      const pool = questionPool.length > 0
        ? questionPool
        : [...allQuestions].sort(() => 0.5 - Math.random()); // refill when exhausted
      const [nextQ, ...restPool] = pool;
      setCellQuestions(prev => ({ ...prev, [`${r}-${c}`]: nextQ }));
      setQuestionPool(restPool);
    }
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
    setSelectedCell(null);
  };

  const activeTeam = currentTurn === 1 ? teams.team1 : teams.team2;
  const turnColorClass = currentTurn === 1 
    ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)] border-red-400' 
    : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.6)] border-blue-400';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 w-full max-w-4xl flex justify-between items-center bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1], 
            textShadow: ["0px 0px 8px rgba(248,113,113,0.4)", "0px 0px 20px rgba(248,113,113,0.9)", "0px 0px 8px rgba(248,113,113,0.4)"]
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-3xl md:text-4xl font-black text-red-500 drop-shadow-xl"
        >
          {teams.team1.name}
        </motion.div>
        
        <motion.div 
          key={currentTurn}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-10 py-3 rounded-full text-2xl font-black text-white ${turnColorClass} border-2`}
        >
          الدور الآن: {activeTeam.name}
        </motion.div>

        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1], 
            textShadow: ["0px 0px 8px rgba(96,165,250,0.4)", "0px 0px 20px rgba(96,165,250,0.9)", "0px 0px 8px rgba(96,165,250,0.4)"]
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.75 }}
          className="text-3xl md:text-4xl font-black text-blue-400 drop-shadow-xl text-left"
        >
          {teams.team2.name}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl aspect-square grid grid-cols-10 gap-1 md:gap-2 bg-gray-900/80 p-3 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]" dir="ltr"
      >
        {grid.map((row, r) => row.map((cell, c) => (
          <Square key={`${r}-${c}`} value={cell} num={r * 10 + (10 - c)} teams={teams} onClick={() => handleCellClick(r, c)} delay={(r + (9 - c)) * 0.05} />
        )))}
      </motion.div>
      
      {selectedCell && (
        <QuestionModal 
          question={selectedCell.question} 
          team={activeTeam}
          onAnswer={handleAnswer} 
        />
      )}

      {/* شرح قواعد اللعبة في الجهة اليسرى */}
      <motion.div 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 100, damping: 15 }}
        whileHover={{ scale: 1.05 }}
        className="fixed top-1/2 left-8 -translate-y-1/2 w-64 md:w-80 bg-slate-900/80 p-6 rounded-2xl border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-md hidden xl:block z-30"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], textShadow: ["0px 0px 5px rgba(251,191,36,0.3)", "0px 0px 15px rgba(251,191,36,0.8)", "0px 0px 5px rgba(251,191,36,0.3)"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-2xl font-black text-amber-400 mb-4 flex items-center gap-3 border-b border-white/10 pb-3"
        >
          <span className="text-3xl">🏆</span> 
          قواعد الانتصار
        </motion.div>
        
        <p className="text-slate-200 text-base leading-loose">
          يفوز الفريق الذي ينجح في بناء <strong className="text-amber-300">مسار متصل</strong> يربط بين حافتين متقابلتين في اللوحة.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-300 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✅</span>
            <span>مسار أفقي (يمين إلى يسار)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400">✅</span>
            <span>مسار عمودي (أعلى إلى أسفل)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-400">💡</span>
            <span>المسار المتعرّج مسموح به!</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

