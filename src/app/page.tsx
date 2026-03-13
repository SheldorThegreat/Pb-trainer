'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWorkout, WEEK_CONFIGS, SCHEDULE } from '../data/workouts';
import { loadSettings, saveSettings, loadProgress, resetProgress, getTodayDayNumber, completedToday, AppSettings, ProgressData } from '../lib/storage';
import WorkoutCard from '../components/WorkoutCard';
import WeeklySchedule from '../components/WeeklySchedule';
import ProgressTracker from '../components/ProgressTracker';
import SettingsPanel from '../components/SettingsPanel';
import TimerPlayer from '../components/TimerPlayer';

export default function Home() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [todayDay, setTodayDay] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    setSettings(loadSettings());
    setProgress(loadProgress());
    setTodayDay(getTodayDayNumber());
  }, []);

  const handleSettingsChange = useCallback((s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleReset = useCallback(() => {
    resetProgress();
    setProgress(loadProgress());
  }, []);

  const refreshProgress = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  // Loading state
  if (!settings || !progress) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-pb-green text-2xl animate-pulse">🎯 Loading...</div>
      </div>
    );
  }

  const currentWeek = settings.currentWeek;
  const weekConfig = WEEK_CONFIGS[currentWeek - 1];
  const todayWorkout = getWorkout(todayDay, currentWeek);
  const isDone = completedToday(progress);

  // Active timer view
  if (activeDay !== null) {
    const workout = getWorkout(activeDay, currentWeek);
    if (workout) {
      return (
        <TimerPlayer
          workout={workout}
          settings={settings}
          onClose={() => setActiveDay(null)}
          onComplete={() => {
            refreshProgress();
            setActiveDay(null);
          }}
        />
      );
    }
  }

  return (
    <main className="min-h-dvh pb-8 safe-bottom">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🎯 <span className="bg-gradient-to-r from-pb-green to-pb-orange bg-clip-text text-transparent">PB Trainer</span>
          </h1>
          <p className="text-xs text-pb-muted mt-0.5">
            Week {currentWeek} · {weekConfig.label} Phase
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition-all"
        >
          ⚙️
        </button>
      </header>

      <div className="px-4 space-y-4">
        {/* Today's Workout Hero */}
        {todayWorkout ? (
          <WorkoutCard
            workout={todayWorkout}
            isToday
            completed={isDone}
            onStart={() => setActiveDay(todayDay)}
          />
        ) : (
          <div className="bg-pb-card rounded-2xl p-6 border border-pb-border text-center">
            <div className="text-4xl mb-2">😴</div>
            <h3 className="text-lg font-bold text-white">Rest Day</h3>
            <p className="text-sm text-pb-muted mt-1">Recovery is training too. Hydrate, stretch, visualize.</p>
          </div>
        )}

        {/* Weekly Schedule */}
        <WeeklySchedule
          currentWeek={currentWeek}
          todayDay={todayDay}
          progress={progress}
          onSelectDay={setActiveDay}
        />

        {/* Progress */}
        <ProgressTracker progress={progress} currentWeek={currentWeek} />

        {/* All Workouts */}
        <div>
          <h2 className="text-sm font-semibold text-pb-muted uppercase tracking-wider mb-3">
            All Workouts
          </h2>
          <div className="space-y-3">
            {SCHEDULE.filter((s) => s.day <= 6).map((s) => {
              const w = getWorkout(s.day, currentWeek);
              if (!w) return null;
              const dayDone = progress.logs.some(
                (l) => l.date === new Date().toISOString().slice(0, 10) && l.day === s.day && l.completed
              );
              return (
                <WorkoutCard
                  key={s.day}
                  workout={w}
                  isToday={s.day === todayDay}
                  completed={dayDone}
                  onStart={() => setActiveDay(s.day)}
                />
              );
            })}
          </div>
        </div>

        {/* Week Progression Info */}
        <div className="bg-pb-card rounded-2xl p-4 border border-pb-border">
          <h2 className="text-sm font-semibold text-pb-muted uppercase tracking-wider mb-3">
            📈 Week {currentWeek} Adjustments
          </h2>
          <div className="space-y-2 text-sm">
            {weekConfig.sprintRepsBonus > 0 && (
              <div className="flex items-center gap-2 text-pb-green">
                <span>+{weekConfig.sprintRepsBonus}</span>
                <span className="text-pb-muted">extra sprint reps per set</span>
              </div>
            )}
            {weekConfig.extraRounds > 0 && (
              <div className="flex items-center gap-2 text-pb-green">
                <span>+{weekConfig.extraRounds}</span>
                <span className="text-pb-muted">extra round(s)</span>
              </div>
            )}
            {weekConfig.restReduction > 0 && (
              <div className="flex items-center gap-2 text-pb-orange">
                <span>-{weekConfig.restReduction}s</span>
                <span className="text-pb-muted">rest between intervals</span>
              </div>
            )}
            {weekConfig.sprintRepsBonus === 0 && weekConfig.extraRounds === 0 && weekConfig.restReduction === 0 && (
              <p className="text-pb-muted">Base program — focus on form and consistency</p>
            )}
            <div className="flex items-center gap-2 text-white">
              <span>🎯</span>
              <span className="text-pb-muted">Match Sim: {weekConfig.amrapDuration / 60} min AMRAP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onReset={handleReset}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
