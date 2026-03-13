// ── Types ──────────────────────────────────────────────────────────
export interface Interval {
  label: string;
  duration: number; // seconds
  type: 'work' | 'rest' | 'warmup' | 'info';
  notes?: string;
}

export interface WorkoutBlock {
  name: string;
  intervals: Interval[];
}

export interface DayWorkout {
  day: number;
  title: string;
  subtitle: string;
  emoji: string;
  blocks: WorkoutBlock[];
  isAmrap?: boolean;
  amrapDurationBase?: number; // seconds
}

export interface WeekConfig {
  week: number;
  label: string;
  sprintRepsBonus: number;
  extraRounds: number;
  restReduction: number; // seconds to subtract from rest
  amrapDuration: number; // seconds
}

// ── Week Progression ───────────────────────────────────────────────
export const WEEK_CONFIGS: WeekConfig[] = [
  { week: 1, label: 'Foundation', sprintRepsBonus: 0, extraRounds: 0, restReduction: 0, amrapDuration: 25 * 60 },
  { week: 2, label: 'Foundation', sprintRepsBonus: 0, extraRounds: 0, restReduction: 0, amrapDuration: 25 * 60 },
  { week: 3, label: 'Build', sprintRepsBonus: 2, extraRounds: 1, restReduction: 0, amrapDuration: 27 * 60 },
  { week: 4, label: 'Build', sprintRepsBonus: 2, extraRounds: 1, restReduction: 0, amrapDuration: 27 * 60 },
  { week: 5, label: 'Peak', sprintRepsBonus: 2, extraRounds: 1, restReduction: 5, amrapDuration: 30 * 60 },
  { week: 6, label: 'Peak', sprintRepsBonus: 2, extraRounds: 1, restReduction: 10, amrapDuration: 30 * 60 },
];

// ── Schedule ───────────────────────────────────────────────────────
export const SCHEDULE = [
  { day: 1, label: 'Acceleration', short: 'ACC' },
  { day: 2, label: 'Sprint Endurance', short: 'SPR' },
  { day: 3, label: 'Zone 2 Recovery', short: 'Z2' },
  { day: 4, label: 'Reaction Speed', short: 'RXN' },
  { day: 5, label: 'Match Sim', short: 'SIM' },
  { day: 6, label: 'Optional Cardio', short: 'OPT' },
  { day: 7, label: 'Rest', short: 'REST' },
];

// ── Helper to repeat intervals ─────────────────────────────────────
function repeat(
  reps: number,
  workLabel: string,
  workDur: number,
  restDur: number,
  workNotes?: string,
): Interval[] {
  const out: Interval[] = [];
  for (let i = 0; i < reps; i++) {
    out.push({ label: `${workLabel} ${i + 1}/${reps}`, duration: workDur, type: 'work', notes: workNotes });
    if (i < reps - 1 || restDur > 0) {
      out.push({ label: 'Rest', duration: restDur, type: 'rest' });
    }
  }
  return out;
}

// ── Generate workout for a given day + week ────────────────────────
export function getWorkout(day: number, weekNum: number): DayWorkout | null {
  const wk = WEEK_CONFIGS[weekNum - 1] ?? WEEK_CONFIGS[0];
  const restAdj = (base: number) => Math.max(15, base - wk.restReduction);

  switch (day) {
    case 1: return {
      day: 1, title: 'PB Acceleration', subtitle: 'Explosive first-step speed', emoji: '⚡',
      blocks: [
        { name: 'Warm-Up', intervals: [{ label: 'Jog', duration: 300, type: 'warmup', notes: 'Easy pace, loosen up' }] },
        { name: 'Sprint Series A', intervals: repeat(10 + wk.sprintRepsBonus, 'Sprint', 15, restAdj(30), 'Max effort 15m burst') },
        { name: 'Sprint Series B', intervals: repeat(6 + wk.sprintRepsBonus, 'Sprint', 20, restAdj(30), '20s sustained sprint') },
        { name: 'Kneeling Starts', intervals: repeat(6 + wk.sprintRepsBonus, 'Kneeling Sprint', 15, restAdj(30), 'Start from kneeling position') },
        { name: 'Sled Push', intervals: repeat(4 + wk.extraRounds, 'Sled Push', 45, restAdj(30), 'Heavy push, drive through legs') },
      ],
    };

    case 2: return {
      day: 2, title: 'Sprint Endurance', subtitle: 'Sustain speed under fatigue', emoji: '🏃',
      blocks: [
        { name: 'Warm-Up', intervals: [{ label: 'Jog', duration: 300, type: 'warmup' }] },
        { name: 'Sprint-Backpedal-Wall Sit', intervals: repeat(8 + wk.sprintRepsBonus, 'Sprint→Backpedal→Wall Sit', 30, restAdj(30), 'Sprint out, backpedal, wall sit') },
        { name: 'Recovery', intervals: [{ label: 'Active Recovery', duration: 120, type: 'rest', notes: 'Walk it off, hydrate' }] },
        { name: 'Sprint Finisher', intervals: repeat(6 + wk.sprintRepsBonus, 'Sprint', 25, restAdj(30), 'All-out 25s sprint') },
      ],
    };

    case 3: return {
      day: 3, title: 'Engine + Mobility', subtitle: 'Zone 2 cardio & core', emoji: '🫀',
      blocks: [
        { name: 'Zone 2 Walk', intervals: [{ label: 'Incline Walk', duration: 2700, type: 'work', notes: 'HR 130-145, steady pace' }] },
        ...Array.from({ length: 3 + wk.extraRounds }, (_, r) => ({
          name: `Core Round ${r + 1}`,
          intervals: [
            { label: 'Hollow Hold', duration: 30, type: 'work' as const },
            { label: 'Side Plank Reach (L)', duration: 30, type: 'work' as const, notes: '10 reaches' },
            { label: 'Side Plank Reach (R)', duration: 30, type: 'work' as const, notes: '10 reaches' },
            { label: 'Dead Bugs', duration: 30, type: 'work' as const, notes: '12 reps' },
            { label: 'Rest', duration: 30, type: 'rest' as const },
          ],
        })),
      ],
    };

    case 4: return {
      day: 4, title: 'Reactive Speed', subtitle: 'React & explode', emoji: '🎯',
      blocks: [
        { name: 'Warm-Up', intervals: [{ label: 'Jog', duration: 300, type: 'warmup' }] },
        { name: 'Reactive Sprints', intervals: repeat(10 + wk.sprintRepsBonus, 'Reactive Sprint', 15, restAdj(30), 'React to cue then sprint') },
        { name: 'Sprint Series', intervals: repeat(8 + wk.sprintRepsBonus, 'Sprint', 20, restAdj(30), 'Max effort 20s') },
        ...Array.from({ length: 3 + wk.extraRounds }, (_, r) => ({
          name: `Core Round ${r + 1}`,
          intervals: [
            { label: 'Bear Crawl', duration: 45, type: 'work' as const },
            { label: 'Knee Raises', duration: 45, type: 'work' as const },
            { label: 'Russian Twists', duration: 45, type: 'work' as const },
            { label: 'Rest', duration: 30, type: 'rest' as const },
          ],
        })),
      ],
    };

    case 5: return {
      day: 5, title: 'Match Simulation', subtitle: 'Game-day conditioning', emoji: '💥',
      isAmrap: true,
      amrapDurationBase: wk.amrapDuration,
      blocks: [
        {
          name: 'AMRAP', intervals: [
            { label: '30m Sprint', duration: 15, type: 'work', notes: 'Full send!' },
            { label: 'Kneel & Hold', duration: 10, type: 'work', notes: 'Bunker position' },
            { label: 'Lateral Shuffle 20m', duration: 12, type: 'work', notes: 'Stay low, quick feet' },
            { label: 'Bear Crawl 15m', duration: 15, type: 'work', notes: 'Keep hips down' },
            { label: 'Push-ups x10', duration: 20, type: 'work' },
            { label: 'Air Squats x15', duration: 25, type: 'work' },
            { label: 'Rest', duration: restAdj(30), type: 'rest' },
          ],
        },
      ],
    };

    case 6: return {
      day: 6, title: 'Optional Cardio', subtitle: 'Active recovery or extra work', emoji: '🚴',
      blocks: [
        { name: 'Easy Cardio', intervals: [{ label: 'Light Activity', duration: 1800, type: 'warmup', notes: 'Bike, swim, hike — keep it easy' }] },
      ],
    };

    case 7: return null; // Rest day

    default: return null;
  }
}

// Flatten all blocks into a single interval list (for the timer)
export function flattenWorkout(workout: DayWorkout): Interval[] {
  if (workout.isAmrap && workout.amrapDurationBase) {
    // Repeat the AMRAP block enough times to fill the duration
    const block = workout.blocks[0].intervals;
    const cycleDuration = block.reduce((s, i) => s + i.duration, 0);
    const cycles = Math.ceil(workout.amrapDurationBase / cycleDuration);
    const all: Interval[] = [];
    for (let c = 0; c < cycles; c++) {
      block.forEach((iv) => all.push({ ...iv, label: `${iv.label} (Rd ${c + 1})` }));
    }
    return all;
  }
  return workout.blocks.flatMap((b) => b.intervals);
}

export function totalDuration(workout: DayWorkout): number {
  if (workout.isAmrap && workout.amrapDurationBase) return workout.amrapDurationBase;
  return flattenWorkout(workout).reduce((s, i) => s + i.duration, 0);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
