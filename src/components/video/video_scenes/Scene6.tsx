import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200), // Card appears
      setTimeout(() => setPhase(2), 800), // Status badge changes
      setTimeout(() => setPhase(3), 1600), // Fields fill in
      setTimeout(() => setPhase(4), 2600), // ADMITTED stamp
      setTimeout(() => setPhase(5), 3600), // Exit transition starts
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const statuses = ['Scheduled', 'Checked In', 'In Progress'];
  const statusColors = ['bg-slate-700 text-slate-300', 'bg-blue-900 text-blue-200', 'bg-teal-900 text-teal-200'];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Dark, serious grid background */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(13, 148, 136, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(13, 148, 136, 0.05) 1px, transparent 1px)',
          backgroundSize: '4vw 4vw'
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-8">
        <motion.div
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 50, opacity: 0, rotateX: 20 }}
          animate={phase >= 1 ? { y: 0, opacity: 1, rotateX: 0 } : { y: 50, opacity: 0, rotateX: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="border-b border-slate-800 px-8 py-6 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-3xl font-bold text-white tracking-wide">PATIENT ADMISSION</h2>
            
            <div className="relative h-10 w-40 overflow-hidden rounded-full">
              {statuses.map((status, i) => (
                <motion.div
                  key={status}
                  className={`absolute inset-0 flex items-center justify-center font-bold text-sm uppercase tracking-wider ${statusColors[i]}`}
                  initial={{ y: 40 }}
                  animate={{ y: phase >= 2 && phase < 2 + i ? 0 : phase >= 2 + i ? -40 : 40 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {status}
                </motion.div>
              ))}
              <motion.div
                className={`absolute inset-0 flex items-center justify-center font-bold text-sm uppercase tracking-wider ${statusColors[2]}`}
                initial={{ y: 40 }}
                animate={{ y: phase >= 2 ? 0 : 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                In Progress
              </motion.div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: 'Patient Name', value: 'Eleanor Vance', delay: 0 },
                { label: 'DOB', value: '12/04/1985', delay: 0.1 },
                { label: 'Condition', value: 'Acute observation', delay: 0.2 },
                { label: 'Department', value: 'Cardiology', delay: 0.3 }
              ].map((field, i) => (
                <div key={field.label} className="space-y-2">
                  <div className="text-slate-500 text-sm uppercase tracking-wider font-semibold">{field.label}</div>
                  <div className="h-10 border-b border-slate-800 flex items-end pb-2">
                    <motion.div
                      className="text-2xl font-medium text-slate-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: phase >= 3 ? field.delay : 0 }}
                    >
                      {field.value}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="text-slate-400 font-medium">Assigned Room:</div>
              <motion.div
                className="bg-teal-900/30 border border-teal-800 text-teal-400 px-6 py-3 rounded-lg text-3xl font-black font-mono tracking-widest"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={phase >= 3 ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: phase >= 3 ? 0.6 : 0 }}
              >
                ICU-402
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Admitted Stamp */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-teal-500 text-teal-500 text-8xl font-black uppercase tracking-[0.2em] py-4 px-8 transform -rotate-12 rounded-xl mix-blend-screen"
          style={{ textShadow: '0 0 20px rgba(20, 184, 166, 0.5)' }}
          initial={{ scale: 3, opacity: 0 }}
          animate={phase >= 4 ? { scale: 1, opacity: 0.9 } : { scale: 3, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          ADMITTED
        </motion.div>
      </div>
    </motion.div>
  );
}