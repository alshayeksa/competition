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
  const getMockGrid = () => {
    const mock = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    // محاكاة طريق الفريق الأول (يكاد أن ينتهي من الأعلى للأسفل، ينقصه المربع الأخير في العمود 2)
    for (let i = 0; i < GRID_SIZE - 1; i++) mock[i][2] = 1; 
    // محاكاة طريق الفريق الثاني (يكاد أن ينتهي من اليمين لليسار، ينقصه المربع الأخير في الصف 5)
    for (let i = 0; i < GRID_SIZE - 1; i++) mock[5][i] = 2; 
    return mock;
  };

  const [grid, setGrid] = useState(getMockGrid());
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
        <div className="text-xl font-bold text-red-400 drop-shadow-md">
          {teams.team1.name} <br/><span className="text-sm opacity-80">(من الأعلى للأسفل)</span>
        </div>
        
        <motion.div 
          key={currentTurn}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-10 py-3 rounded-full text-2xl font-black text-white ${turnColorClass} border-2`}
        >
          الدور الآن: {activeTeam.name}
        </motion.div>

        <div className="text-xl font-bold text-blue-400 drop-shadow-md text-left">
          {teams.team2.name} <br/><span className="text-sm opacity-80">(من اليمين لليسار)</span>
        </div>
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

      {/* شرح قواعد اللعبة للمستخدم */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
        className="mt-6 w-full max-w-3xl bg-slate-800/80 p-5 rounded-xl border border-slate-600 shadow-lg text-center backdrop-blur-sm"
      >
        <h4 className="text-xl md:text-2xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-2">
          <span>🎯</span> قواعد الانتصار (جسر المعرفة)
        </h4>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          الفريق الفائز هو من ينجح أولاً في بناء <strong className="text-white">مسار متصل من المربعات</strong>؛ 
          سواءً بإنشاء خط يربط <strong className="text-red-400">من اليمين إلى اليسار</strong> للوحة، 
          أو خط يربط <strong className="text-blue-400">من الأعلى إلى الأسفل</strong>. 
          <br />اختر مربعاتك بذكاء وخطط لقطع الطريق على خصمك!
        </p>
      </motion.div>
    </div>
  );
}

