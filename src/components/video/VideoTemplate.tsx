import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';

const SCENE_DURATIONS = { open: 3000, features1: 3500, features2: 3500, features3: 3500, admit: 4000, discharge: 4000, close: 4000 };

const scenePos = [
  { x: '10vw', y: '20vh', scale: 2, opacity: 0.8 },
  { x: '60vw', y: '10vh', scale: 1.2, opacity: 0.5 },
  { x: '80vw', y: '60vh', scale: 1.5, opacity: 0.6 },
  { x: '20vw', y: '70vh', scale: 0.8, opacity: 0.4 },
  { x: '35vw', y: '40vh', scale: 1.8, opacity: 0.5 },
  { x: '70vw', y: '30vh', scale: 1.3, opacity: 0.4 },
  { x: '50vw', y: '50vh', scale: 2.5, opacity: 0.2 },
];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Persistent Background */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0d9488, transparent)' }}
          animate={{ 
            x: ['-20%', '50%', '10%'], 
            y: ['10%', '60%', '30%'], 
            scale: [1, 1.2, 0.9] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} 
        />
        <motion.div 
          className="absolute w-[60vw] h-[60vw] rounded-full opacity-10 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #0f766e, transparent)' }}
          animate={{ 
            x: ['20%', '-30%', '5%'], 
            y: ['-10%', '-40%', '-20%'] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} 
        />
      </div>

      {/* Persistent midground layer */}
      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full bg-[#0d9488]/20 blur-2xl"
        animate={scenePos[currentScene]}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute h-[4px] bg-[#0d9488]"
        animate={{
          left: ['0%', '10%', '40%', '20%', '30%', '50%', '15%'][currentScene],
          width: ['100%', '80%', '40%', '60%', '50%', '40%', '70%'][currentScene],
          top: ['50%', '20%', '80%', '40%', '70%', '30%', '60%'][currentScene],
          opacity: currentScene >= 6 ? 0.3 : 0.8,
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      <AnimatePresence mode="sync">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="feat1" />}
        {currentScene === 2 && <Scene3 key="feat2" />}
        {currentScene === 3 && <Scene4 key="feat3" />}
        {currentScene === 4 && <Scene6 key="admit" />}
        {currentScene === 5 && <Scene7 key="discharge" />}
        {currentScene === 6 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}
