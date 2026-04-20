import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecordButtonProps {
  totalDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  elapsed: number;
}

export function RecordButton({ totalDuration, onStartRecording, onStopRecording, isRecording, elapsed }: RecordButtonProps) {
  const pct = Math.min(elapsed / totalDuration, 1);
  const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 bg-black/80 text-white text-xs font-mono px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>REC</span>
            <span className="text-slate-400">{remaining}s left</span>
            <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-500 rounded-full"
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? onStopRecording : onStartRecording}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-xl backdrop-blur-sm border transition-colors ${
          isRecording
            ? 'bg-red-600 border-red-500 text-white'
            : 'bg-black/70 border-white/20 text-white hover:bg-black/90'
        }`}
      >
        {isRecording ? (
          <>
            <span className="w-3 h-3 rounded-sm bg-white" />
            Stop
          </>
        ) : (
          <>
            <span className="w-3 h-3 rounded-full bg-red-500" />
            Record &amp; Download
          </>
        )}
      </motion.button>
    </div>
  );
}
