import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import waitingRoom from '@/assets/waiting-room.jpg';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-row-reverse items-center px-[10vw]"
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 overflow-hidden">
         <img src={waitingRoom} className="w-full h-full object-cover opacity-10 blur-sm" />
      </div>

      <div className="flex-1 z-10 pl-[5vw]">
        <motion.h2 
          className="text-[5vw] font-black text-slate-900 leading-tight mb-6"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          SMART<br/>
          <span className="text-[#0d9488]">QUEUE</span>
        </motion.h2>
        
        <motion.p 
          className="text-[2vw] text-slate-600 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          Live patient flow. Color-coded wait times. Zero friction.
        </motion.p>
      </div>

      <div className="flex-1 relative h-full flex flex-col justify-center gap-6 z-10">
        {[1, 2, 3].map((item, i) => (
          <motion.div 
            key={i}
            className="w-full bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-6"
            initial={{ opacity: 0, x: -100 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.15 }}
          >
            <div className="w-16 h-16 rounded-full bg-slate-200" />
            <div className="flex-1">
              <div className="h-6 w-1/2 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
            </div>
            <div className="w-24 h-10 rounded-full bg-[#0d9488]/10 text-[#0d9488] font-bold flex items-center justify-center">
              10 min
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
