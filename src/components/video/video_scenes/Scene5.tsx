import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d9488]"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background elements */}
      <motion.div 
        className="absolute w-[100vw] h-[100vw] rounded-full border-[1px] border-white/10"
        initial={{ scale: 0 }}
        animate={phase >= 1 ? { scale: 2 } : { scale: 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute w-[50vw] h-[50vw] rounded-full border-[2px] border-white/20"
        initial={{ scale: 0 }}
        animate={phase >= 1 ? { scale: 1.5 } : { scale: 0 }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
      />

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={phase >= 2 ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-32 h-32 bg-white rounded-3xl mx-auto mb-8 shadow-2xl flex items-center justify-center"
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </motion.div>
        
        <h1 className="text-[7vw] font-black text-white leading-none tracking-tighter mb-4">
          {'MEDCORE'.split('').map((char, i) => (
            <motion.span 
              key={i} 
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: phase >= 2 ? i * 0.05 : 0 }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          className="text-[2vw] text-teal-100 tracking-widest uppercase font-semibold"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          Excellence in Healthcare
        </motion.p>
      </div>
    </motion.div>
  );
}
