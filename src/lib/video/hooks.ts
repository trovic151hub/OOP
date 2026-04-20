import { useState, useEffect, useRef, useCallback } from 'react';

export function useVideoPlayer({ durations, onComplete }: {
  durations: Record<string, number>;
  onComplete?: () => void;
}) {
  const keys = Object.keys(durations);
  const sceneDurations = Object.values(durations);
  const [currentScene, setCurrentScene] = useState(0);
  const sceneRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playScene = useCallback((index: number) => {
    sceneRef.current = index;
    setCurrentScene(index);
    const isLast = index === sceneDurations.length - 1;

    timeoutRef.current = setTimeout(() => {
      if (isLast) {
        onComplete?.();
        playScene(0);
      } else {
        playScene(index + 1);
      }
    }, sceneDurations[index]);
  }, [sceneDurations, onComplete]);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    playScene(0);
  }, [playScene]);

  useEffect(() => {
    playScene(0);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return { currentScene, reset };
}
