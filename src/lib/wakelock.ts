// ── Screen Wake Lock API ───────────────────────────────────────────
let sentinel: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<void> {
  try {
    if ('wakeLock' in navigator) {
      sentinel = await navigator.wakeLock.request('screen');
    }
  } catch { /* not available or denied */ }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    await sentinel?.release();
    sentinel = null;
  } catch { /* already released */ }
}
