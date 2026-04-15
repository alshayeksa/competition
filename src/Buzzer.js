import React from 'react';
import { motion } from 'framer-motion';

export default function Buzzer({ teams, onBuzz }) {
  return (
    <div className="flex justify-around py-12">
      <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => onBuzz(1)} className={`w-32 h-32 rounded-full text-white font-bold text-xl shadow-lg ${teams.team1.color}`}>
        {teams.team1.name} Buzz!
      </motion.button>
      <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => onBuzz(2)} className={`w-32 h-32 rounded-full text-white font-bold text-xl shadow-lg ${teams.team2.color}`}>
        {teams.team2.name} Buzz!
      </motion.button>
    </div>
  );
}