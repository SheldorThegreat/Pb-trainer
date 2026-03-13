// ── Web Audio API beeps + vibration ────────────────────────────────
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, durationMs: number, volume = 0.3): void {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + durationMs / 1000);
  } catch { /* silent fail */ }
}

export function playWorkBeep(): void {
  beep(880, 150, 0.3);
  setTimeout(() => beep(1100, 200, 0.35), 200);
}

export function playRestBeep(): void {
  beep(440, 300, 0.25);
}

export function playCountdownBeep(): void {
  beep(660, 100, 0.2);
}

export function playFinishBeep(): void {
  beep(1200, 150, 0.4);
  setTimeout(() => beep(1400, 150, 0.4), 200);
  setTimeout(() => beep(1600, 300, 0.5), 400);
}

export function vibrate(pattern: number | number[]): void {
  try {
    navigator?.vibrate?.(pattern);
  } catch { /* not supported */ }
}

// Ensure AudioContext is unlocked (call on first user interaction)
export function unlockAudio(): void {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
  } catch { /* silent */ }
}
