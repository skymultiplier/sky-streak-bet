
import { useEffect, useRef } from "react";

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    gainNodeRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playBetSound = () => {
    // Ascending chord for placing bet
    createTone(440, 0.2); // A
    setTimeout(() => createTone(554.37, 0.2), 100); // C#
    setTimeout(() => createTone(659.25, 0.3), 200); // E
  };

  const playWinSound = () => {
    // Victory fanfare
    createTone(523.25, 0.3); // C
    setTimeout(() => createTone(659.25, 0.3), 150); // E
    setTimeout(() => createTone(783.99, 0.3), 300); // G
    setTimeout(() => createTone(1046.5, 0.5), 450); // C (octave)
  };

  const startBackgroundMusic = () => {
    if (!audioContextRef.current || backgroundMusicRef.current) return;

    // Create a simple looping ambient background
    const playAmbientLoop = () => {
      if (!audioContextRef.current) return;
      
      const oscillator = audioContextRef.current.createOscillator();
      const filter = audioContextRef.current.createBiquadFilter();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(110, audioContextRef.current.currentTime);
      oscillator.type = 'sawtooth';
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
      
      gainNode.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
      
      oscillator.start();
      backgroundMusicRef.current = oscillator;
      
      // Loop every 8 seconds
      setTimeout(() => {
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.stop();
          backgroundMusicRef.current = null;
          playAmbientLoop();
        }
      }, 8000);
    };

    playAmbientLoop();
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
      backgroundMusicRef.current = null;
    }
  };

  return {
    playBetSound,
    playWinSound,
    startBackgroundMusic,
    stopBackgroundMusic
  };
};
