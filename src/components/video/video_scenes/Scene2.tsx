import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import doctorTablet from '@/assets/doctor-tablet.jpg';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center px-[10vw]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex-1 z-10">
        <motion.h2 
          className="text-[5vw] font-black text-slate-900 leading-tight mb-6"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          REAL-TIME<br/>
          <span className="text-[#0d9488]">DASHBOARD</span>
        </motion.h2>
        
        <motion.p 
          className="text-[2vw] text-slate-600 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          Live stats for patients, appointments, and revenue.
        </motion.p>
      </div>

      <div className="flex-1 relative h-[60vh] flex items-center justify-center">
        <motion.div 
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: 30 }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        >
          <img src={doctorTablet} className="w-full h-full object-cover opacity-60" />
          
          <div className="absolute inset-0 p-6 flex flex-col gap-4 bg-white/40 backdrop-blur-sm">
            <div className="h-8 w-1/3 bg-white/80 rounded" />
            <div className="flex gap-4">
              <div className="flex-1 h-24 bg-[#0d9488]/20 rounded-xl border border-[#0d9488]/40 flex items-center px-4">
                <div className="w-12 h-12 rounded-full bg-[#0d9488]/30" />
              </div>
              <div className="flex-1 h-24 bg-white/80 rounded-xl" />
              <div className="flex-1 h-24 bg-white/80 rounded-xl" />
            </div>
            <div className="flex-1 bg-white/80 rounded-xl border border-white mt-2" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
