'use client';

import { SCHEDULE } from '../data/workouts';
import { ProgressData } from '../lib/storage';

interface Props {
  currentWeek: number;
  todayDay: number;
  progress: ProgressData;
  onSelectDay: (day: number) => void;
}

export default function WeeklySchedule({ currentWeek, todayDay, progress, onSelectDay }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const completedDays = new Set(
    progress.logs.filter((l) => l.date === today && l.completed).map((l) => l.day)
  );

  return (
    <div className="bg-pb-card rounded-2xl p-4 border border-pb-border">
      <h2 className="text-sm font-semibold text-pb-muted uppercase tracking-wider mb-3">
        Week {currentWeek} Schedule
      </h2>
      <div className="grid grid-cols-7 gap-1">
        {SCHEDULE.map((s) => {
          const isCurrent = s.day === todayDay;
          const done = completedDays.has(s.day);
          const isRest = s.day === 7;

          return (
            <button
              key={s.day}
              onClick={() => !isRest && onSelectDay(s.day)}
              disabled={isRest}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all text-xs ${
                isCurrent
                  ? 'bg-pb-green/20 border border-pb-green/50 text-pb-green'
                  : done
                  ? 'bg-white/5 text-pb-green/70'
                  : isRest
                  ? 'text-pb-muted/50'
                  : 'text-pb-muted hover:bg-white/5'
              }`}
            >
              <span className="font-bold text-[10px]">D{s.day}</span>
              <span className="font-semibold mt-0.5">{s.short}</span>
              {done && <span className="mt-0.5">✓</span>}
              {isCurrent && !done && <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-pb-green" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
