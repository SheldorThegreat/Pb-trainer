// ── localStorage persistence ───────────────────────────────────────
export interface DayLog {
  date: string; // YYYY-MM-DD
  day: number;
  week: number;
  completed: boolean;
  notes: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  useMeters: boolean;
  currentWeek: number;
}

export interface ProgressData {
  logs: DayLog[];
  streak: number;
  lastCompleted: string | null;
}

const SETTINGS_KEY = 'pb-trainer-settings';
const PROGRESS_KEY = 'pb-trainer-progress';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  useMeters: true,
  currentWeek: 1,
};

const DEFAULT_PROGRESS: ProgressData = {
  logs: [],
  streak: 0,
  lastCompleted: null,
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadSettings(): AppSettings {
  return load(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(s: AppSettings): void {
  save(SETTINGS_KEY, s);
}

export function loadProgress(): ProgressData {
  return load(PROGRESS_KEY, DEFAULT_PROGRESS);
}

export function saveProgress(p: ProgressData): void {
  save(PROGRESS_KEY, p);
}

export function logWorkout(day: number, week: number, notes: string): void {
  const progress = loadProgress();
  const today = new Date().toISOString().slice(0, 10);
  progress.logs.push({ date: today, day, week, completed: true, notes });

  // Streak calculation
  if (progress.lastCompleted) {
    const last = new Date(progress.lastCompleted);
    const now = new Date(today);
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
    progress.streak = diffDays <= 2 ? progress.streak + 1 : 1;
  } else {
    progress.streak = 1;
  }
  progress.lastCompleted = today;
  saveProgress(progress);
}

export function resetProgress(): void {
  save(PROGRESS_KEY, DEFAULT_PROGRESS);
}

export function getTodayDayNumber(): number {
  // Monday=1 ... Sunday=7
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function completedToday(progress: ProgressData): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return progress.logs.some((l) => l.date === today && l.completed);
}
