'use client';

import { DayWorkout, totalDuration, formatTime } from '../data/workouts';

interface Props {
  workout: DayWorkout;
  isToday?: boolean;
  completed?: boolean;
  onStart: () => void;
}

export default function WorkoutCard({ workout, isToday, completed, onStart }: Props) {
  const dur = totalDuration(workout);
  const mins = Math.round(dur / 60);

  return (
    <div
      className={`rounded-2xl p-5 transition-all ${
        isToday
          ? 'bg-gradient-to-br from-pb-card to-[#1a1a2e] border-2 border-pb-green/40 shadow-lg shadow-pb-green/10'
          : 'bg-pb-card border border-pb-border'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{workout.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-white">
              Day {workout.day}: {workout.title}
            </h3>
            <p className="text-sm text-pb-muted">{workout.subtitle}</p>
          </div>
        </div>
        {completed && (
          <span className="text-pb-green text-xl" title="Completed">✓</span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-pb-muted">
        <span>⏱ ~{mins} min</span>
        <span>🔥 {workout.blocks.length} blocks</span>
        {workout.isAmrap && <span className="text-pb-orange font-semibold">AMRAP</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {workout.blocks.map((b) => (
          <span key={b.name} className="text-xs bg-white/5 px-2 py-1 rounded-lg text-pb-muted">
            {b.name}
          </span>
        ))}
      </div>

      <button
        onClick={onStart}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
          isToday
            ? 'bg-pb-green text-black hover:bg-pb-green/90'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {completed ? '🔄 Redo' : isToday ? '▶ Start Workout' : '▶ Start'}
      </button>
    </div>
  );
}
