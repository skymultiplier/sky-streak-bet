
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
    // Flight takeoff sequence - radio communication style
    createTone(800, 0.15, 'square'); // Radio static
    setTimeout(() => createTone(440, 0.4), 200); // "Sky Multiplier, you are cleared for takeoff"
    setTimeout(() => createTone(554.37, 0.3), 400); // Engine rev
    setTimeout(() => createTone(659.25, 0.5), 700); // Takeoff confirmation
  };

  const playWinSound = () => {
    // Landing confirmation with radio chatter
    createTone(800, 0.1, 'square'); // Radio static
    setTimeout(() => createTone(659.25, 0.3), 100); // "Touchdown confirmed"
    setTimeout(() => createTone(783.99, 0.3), 300); // "Welcome to destination"
    setTimeout(() => createTone(1046.5, 0.4), 500); // Success chime
    setTimeout(() => createTone(1318.5, 0.6), 700); // Victory fanfare
  };

  const startBackgroundMusic = () => {
    if (!audioContextRef.current || backgroundMusicRef.current) return;

    // Create flight-themed ambient background music
    const playFlightAmbientLoop = () => {
      if (!audioContextRef.current) return;
      
      const oscillator1 = audioContextRef.current.createOscillator();
      const oscillator2 = audioContextRef.current.createOscillator();
      const filter = audioContextRef.current.createBiquadFilter();
      const gainNode = audioContextRef.current.createGain();
      
      // Create dual-oscillator for richer sound
      oscillator1.connect(filter);
      oscillator2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Flight-themed frequencies - like distant jet engines
      oscillator1.frequency.setValueAtTime(85, audioContextRef.current.currentTime); // Low rumble
      oscillator2.frequency.setValueAtTime(170, audioContextRef.current.currentTime); // Harmonic
      
      oscillator1.type = 'sawtooth';
      oscillator2.type = 'triangle';
      
      // Filter for that distant aircraft sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, audioContextRef.current.currentTime);
      
      // Very quiet ambient level
      gainNode.gain.setValueAtTime(0.03, audioContextRef.current.currentTime);
      
      // Add subtle frequency modulation like aircraft engines
      oscillator1.frequency.setValueAtTime(85, audioContextRef.current.currentTime);
      oscillator1.frequency.linearRampToValueAtTime(88, audioContextRef.current.currentTime + 4);
      oscillator1.frequency.linearRampToValueAtTime(85, audioContextRef.current.currentTime + 8);
      
      oscillator1.start();
      oscillator2.start();
      backgroundMusicRef.current = oscillator1; // Store reference
      
      // Loop every 12 seconds for longer flight segments
      setTimeout(() => {
        if (backgroundMusicRef.current) {
          oscillator1.stop();
          oscillator2.stop();
          backgroundMusicRef.current = null;
          playFlightAmbientLoop();
        }
      }, 12000);
    };

    playFlightAmbientLoop();
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
