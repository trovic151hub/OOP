import { useState, useEffect } from 'react';

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  
  useEffect(() => {
    const sceneDurations = Object.values(durations);
    
    // Simulate recording start
    window.startRecording?.();
    
    let timeout: NodeJS.Timeout;
    const playScene = (index: number) => {
      setCurrentScene(index);
      
      const isLastScene = index === sceneDurations.length - 1;
      const nextIndex = isLastScene ? 0 : index + 1;
      
      timeout = setTimeout(() => {
        if (isLastScene) {
          window.stopRecording?.();
        }
        playScene(nextIndex);
      }, sceneDurations[index]);
    };
    
    playScene(0);
    
    return () => clearTimeout(timeout);
  }, [JSON.stringify(durations)]);
  
  return { currentScene };
}
