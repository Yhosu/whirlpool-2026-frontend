// Web Audio API procedural sound engine & Haptic feedback

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function triggerHaptic(pattern: number | number[] = 15) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if blocked
    }
  }
}

/**
 * Mechanical tactile switch/click
 */
export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  triggerHaptic(10);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(450, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.06);
}

/**
 * Drum spinning motor hum with rising pitch and gentle modulation
 */
export function startSpinSound(): () => void {
  if (isMuted) return () => {};
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  triggerHaptic([30, 20, 30, 20, 40]);

  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc2.type = 'sine';

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(150, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 1.8);

  osc.frequency.setValueAtTime(60, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.8);

  osc2.frequency.setValueAtTime(120, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.8);

  gain.gain.setValueAtTime(0.01, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.4);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc2.start();

  // Return stop function with deceleration
  return () => {
    try {
      const now = ctx.currentTime;
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.7);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => {
        try {
          osc.stop();
          osc2.stop();
        } catch {}
      }, 850);
    } catch {}
  };
}

/**
 * Heavy mechanical washer hatch unlock & swing open
 */
export function playDoorOpenSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  triggerHaptic([40, 30, 70]);

  // Metallic latch click
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.13);

  // Soft door swing hiss
  setTimeout(() => {
    if (!ctx) return;
    const oscHiss = ctx.createOscillator();
    const gainHiss = ctx.createGain();
    oscHiss.type = 'sine';
    oscHiss.frequency.setValueAtTime(180, ctx.currentTime);
    oscHiss.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);

    gainHiss.gain.setValueAtTime(0.12, ctx.currentTime);
    gainHiss.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    oscHiss.connect(gainHiss);
    gainHiss.connect(ctx.destination);

    oscHiss.start();
    oscHiss.stop(ctx.currentTime + 0.36);
  }, 100);
}

/**
 * Capsule popping out with bouncy spring
 */
export function playCapsuleEjectSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  triggerHaptic([30, 15, 60]);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);

  gain.gain.setValueAtTime(0.28, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.23);
}

/**
 * Victory fanfare / Prize reveal sound
 */
export function playWinSound(isJackpot: boolean = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  triggerHaptic([50, 40, 50, 40, 120, 60, 200]);

  // Arpeggio notes: C5, E5, G5, C6 (and E6 if jackpot)
  const notes = isJackpot ? [523.25, 659.25, 783.99, 1046.5, 1318.51] : [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, idx) => {
    const startTime = ctx.currentTime + idx * 0.11;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isJackpot ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx === notes.length - 1 ? 1.2 : 0.45));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + (idx === notes.length - 1 ? 1.3 : 0.5));
  });
}

/**
 * Procedural water splash & gush sound for door burst
 */
export function playWaterSplashSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  triggerHaptic([40, 20, 60, 30, 40]);

  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.9);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.85);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.88);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch {
    // Ignore in unsupported environments
  }
}
