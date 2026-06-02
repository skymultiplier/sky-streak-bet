import { useEffect, useRef } from "react";

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Airplane (in-flight) engine loop refs
  const flyingNodesRef = useRef<{
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    noise: AudioBufferSourceNode;
    gain: GainNode;
  } | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    gainNodeRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);

    return () => {
      if (backgroundMusicRef.current) backgroundMusicRef.current.stop();
      if (flyingNodesRef.current) {
        try { flyingNodesRef.current.osc1.stop(); } catch {}
        try { flyingNodesRef.current.osc2.stop(); } catch {}
        try { flyingNodesRef.current.noise.stop(); } catch {}
        flyingNodesRef.current = null;
      }
      if (audioContextRef.current) audioContextRef.current.close();
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
    createTone(800, 0.15, 'square');
    setTimeout(() => createTone(440, 0.4), 200);
    setTimeout(() => createTone(554.37, 0.3), 400);
    setTimeout(() => createTone(659.25, 0.5), 700);
  };

  const playWinSound = () => {
    createTone(800, 0.1, 'square');
    setTimeout(() => createTone(659.25, 0.3), 100);
    setTimeout(() => createTone(783.99, 0.3), 300);
    setTimeout(() => createTone(1046.5, 0.4), 500);
    setTimeout(() => createTone(1318.5, 0.6), 700);
  };

  // Continuous airplane engine sound while plane is in flight
  const startFlyingSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx || flyingNodesRef.current) return;

    // Two detuned oscillators (engine drone) + filtered noise (wind/turbine wash)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, ctx.currentTime);
    osc2.frequency.setValueAtTime(113, ctx.currentTime); // slight detune for richness

    // Noise buffer for jet wash
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(900, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(700, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.4); // fade in

    osc1.connect(engineFilter);
    osc2.connect(engineFilter);
    engineFilter.connect(gain);
    noise.connect(noiseFilter);
    noiseFilter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    noise.start();

    // Subtle rev modulation
    const now = ctx.currentTime;
    osc1.frequency.linearRampToValueAtTime(118, now + 3);
    osc1.frequency.linearRampToValueAtTime(110, now + 6);

    flyingNodesRef.current = { osc1, osc2, noise, gain };
  };

  const stopFlyingSound = () => {
    const ctx = audioContextRef.current;
    const nodes = flyingNodesRef.current;
    if (!ctx || !nodes) return;
    const now = ctx.currentTime;
    try {
      nodes.gain.gain.cancelScheduledValues(now);
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
      nodes.gain.gain.linearRampToValueAtTime(0, now + 0.3);
    } catch {}
    setTimeout(() => {
      try { nodes.osc1.stop(); } catch {}
      try { nodes.osc2.stop(); } catch {}
      try { nodes.noise.stop(); } catch {}
    }, 350);
    flyingNodesRef.current = null;
  };

  const startBackgroundMusic = () => {
    if (!audioContextRef.current || backgroundMusicRef.current) return;

    const playFlightAmbientLoop = () => {
      if (!audioContextRef.current) return;
      const oscillator1 = audioContextRef.current.createOscillator();
      const oscillator2 = audioContextRef.current.createOscillator();
      const filter = audioContextRef.current.createBiquadFilter();
      const gainNode = audioContextRef.current.createGain();

      oscillator1.connect(filter);
      oscillator2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator1.frequency.setValueAtTime(85, audioContextRef.current.currentTime);
      oscillator2.frequency.setValueAtTime(170, audioContextRef.current.currentTime);
      oscillator1.type = 'sawtooth';
      oscillator2.type = 'triangle';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, audioContextRef.current.currentTime);

      gainNode.gain.setValueAtTime(0.03, audioContextRef.current.currentTime);

      oscillator1.frequency.setValueAtTime(85, audioContextRef.current.currentTime);
      oscillator1.frequency.linearRampToValueAtTime(88, audioContextRef.current.currentTime + 4);
      oscillator1.frequency.linearRampToValueAtTime(85, audioContextRef.current.currentTime + 8);

      oscillator1.start();
      oscillator2.start();
      backgroundMusicRef.current = oscillator1;

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
    stopBackgroundMusic,
    startFlyingSound,
    stopFlyingSound,
  };
};
