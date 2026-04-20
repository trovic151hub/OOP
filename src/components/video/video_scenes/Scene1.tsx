import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import hospitalBg from '@/assets/hospital-bg.jpg';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 opacity-30">
        <motion.img 
          src={hospitalBg} 
          className="w-full h-full object-cover mix-blend-overlay"
          animate={{ scale: [1, 1.1] }}
          transition={{ duration: 10, ease: 'linear' }}
        />
      </div>
      
      {phase >= 1 && (
        <motion.div 
          className="absolute w-full h-[1px] bg-[#0d9488]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
      )}

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
          animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-[2vw] font-bold text-[#0d9488] tracking-widest uppercase mb-4"
        >
          Hospital Management System
        </motion.div>
        
        <h1 className="text-[8vw] font-black text-white leading-none tracking-tighter">
          {'MEDCORE'.split('').map((char, i) => (
            <motion.span 
              key={i} 
              className="inline-block"
              initial={{ opacity: 0, y: 80, rotateX: -60 }}
              animate={phase >= 3 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 80, rotateX: -60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
      </div>
    </motion.div>
  );
}
