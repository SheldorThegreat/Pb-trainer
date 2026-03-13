'use client';

import { ProgressData } from '../lib/storage';

interface Props {
  progress: ProgressData;
  currentWeek: number;
}

export default function ProgressTracker({ progress, currentWeek }: Props) {
  const totalWorkouts = progress.logs.filter((l) => l.completed).length;
  const weekProgress = Math.min(100, Math.round((currentWeek / 6) * 100));

  return (
    <div className="bg-pb-card rounded-2xl p-4 border border-pb-border">
      <h2 className="text-sm font-semibold text-pb-muted uppercase tracking-wider mb-3">
        Progress
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-pb-green">{progress.streak}</div>
          <div className="text-xs text-pb-muted">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
          <div className="text-xs text-pb-muted">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pb-orange">Wk {currentWeek}</div>
          <div className="text-xs text-pb-muted">of 6</div>
        </div>
      </div>

      {/* Program progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-pb-muted">
          <span>Program Progress</span>
          <span>{weekProgress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pb-green to-pb-orange rounded-full transition-all duration-500"
            style={{ width: `${weekProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
