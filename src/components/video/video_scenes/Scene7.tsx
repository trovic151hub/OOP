import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300), // Card appears
      setTimeout(() => setPhase(2), 1000), // Vitals reveal
      setTimeout(() => setPhase(3), 1800), // Prescription
      setTimeout(() => setPhase(4), 2600), // DISCHARGED stamp
      setTimeout(() => setPhase(5), 3200), // Tagline
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background with warm teal glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="w-[80vw] h-[80vw] rounded-full bg-teal-900/20 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 4, ease: "easeOut" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-8 grid grid-cols-2 gap-8">
        
        {/* Left Column: Vitals */}
        <motion.div
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
          initial={{ x: -50, opacity: 0 }}
          animate={phase >= 1 ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <h3 className="text-xl font-bold text-slate-300 mb-6 border-b border-slate-700 pb-4">VITALS NORMALIZED</h3>
          <div className="space-y-4">
            {[
              { label: "Heart Rate", value: "72 bpm" },
              { label: "Blood Pressure", value: "118/75" },
              { label: "O2 Saturation", value: "99%" },
              { label: "Temperature", value: "98.6°F" },
            ].map((vital, i) => (
              <div key={vital.label} className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">{vital.label}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-200 font-bold">{vital.value}</span>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={phase >= 2 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: phase >= 2 ? i * 0.15 : 0 }}
                    className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path 
                        d="M20 6L9 17l-5-5" 
                        initial={{ pathLength: 0 }}
                        animate={phase >= 2 ? { pathLength: 1 } : { pathLength: 0 }}
                        transition={{ duration: 0.4, delay: phase >= 2 ? i * 0.15 + 0.2 : 0 }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Prescription & Discharge */}
        <div className="space-y-8 relative">
          <motion.div
            className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
            initial={{ x: 50, opacity: 0 }}
            animate={phase >= 3 ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <h3 className="text-xl font-bold text-slate-300 mb-6 border-b border-slate-700 pb-4">PRESCRIPTION SENT</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex flex-shrink-0 items-center justify-center text-blue-400 mt-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M12.5 15.5 19 22" />
                    <path d="m19 15.5-6.5 6.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-slate-200 font-bold text-lg">Amoxicillin 500mg</div>
                  <div className="text-slate-400 text-sm">Take 1 tablet every 8 hours for 7 days</div>
                  <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-900/30 text-green-400 text-xs font-bold uppercase rounded">Sent to Pharmacy</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Discharged Stamp */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-green-500 text-green-500 text-6xl font-black uppercase tracking-[0.1em] py-4 px-8 transform rotate-12 rounded-xl mix-blend-screen shadow-[0_0_30px_rgba(34,197,94,0.3)] bg-slate-900/40 backdrop-blur-sm"
            initial={{ scale: 3, opacity: 0 }}
            animate={phase >= 4 ? { scale: 1, opacity: 1 } : { scale: 3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            DISCHARGED
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-16 left-0 right-0 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-teal-400 text-2xl tracking-[0.3em] font-bold uppercase">
          Care from Admission to Discharge
        </div>
      </motion.div>

    </motion.div>
  );
}