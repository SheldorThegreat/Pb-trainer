'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DayWorkout, Interval, flattenWorkout, formatTime } from '../data/workouts';
import { playWorkBeep, playRestBeep, playCountdownBeep, playFinishBeep, vibrate, unlockAudio } from '../lib/audio';
import { requestWakeLock, releaseWakeLock } from '../lib/wakelock';
import { AppSettings, logWorkout } from '../lib/storage';

interface Props {
  workout: DayWorkout;
  settings: AppSettings;
  onClose: () => void;
  onComplete: () => void;
}

type TimerState = 'ready' | 'running' | 'paused' | 'finished';

export default function TimerPlayer({ workout, settings, onClose, onComplete }: Props) {
  const intervals = useRef<Interval[]>(flattenWorkout(workout));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(intervals.current[0]?.duration ?? 0);
  const [state, setState] = useState<TimerState>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = intervals.current[currentIdx];
  const next = intervals.current[currentIdx + 1] ?? null;
  const totalIntervals = intervals.current.length;
  const progress = totalIntervals > 0 ? ((currentIdx + 1) / totalIntervals) * 100 : 0;

  // AMRAP total timer
  const amrapTotal = workout.isAmrap ? workout.amrapDurationBase ?? 0 : 0;

  const doSound = useCallback((fn: () => void) => {
    if (settings.soundEnabled) fn();
  }, [settings.soundEnabled]);

  const doVibrate = useCallback((pattern: number | number[]) => {
    if (settings.vibrationEnabled) vibrate(pattern);
  }, [settings.vibrationEnabled]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      releaseWakeLock();
    };
  }, []);

  // Main tick
  useEffect(() => {
    if (state !== 'running') {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Advance to next interval
          const nextIdx = currentIdx + 1;

          // AMRAP: check if total elapsed exceeds duration
          if (workout.isAmrap && elapsed + (current?.duration ?? 0) >= amrapTotal) {
            setState('finished');
            doSound(playFinishBeep);
            doVibrate([200, 100, 200, 100, 400]);
            releaseWakeLock();
            return 0;
          }

          if (nextIdx >= totalIntervals) {
            setState('finished');
            doSound(playFinishBeep);
            doVibrate([200, 100, 200, 100, 400]);
            releaseWakeLock();
            return 0;
          }

          const nextInterval = intervals.current[nextIdx];
          setCurrentIdx(nextIdx);
          setElapsed((e) => e + (current?.duration ?? 0));

          if (nextInterval.type === 'work' || nextInterval.type === 'warmup') {
            doSound(playWorkBeep);
            doVibrate([100, 50, 100]);
          } else {
            doSound(playRestBeep);
            doVibrate(200);
          }

          return nextInterval.duration;
        }

        // Countdown beeps at 3, 2, 1
        if (prev <= 4 && prev > 1) {
          doSound(playCountdownBeep);
          doVibrate(50);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, currentIdx, current, elapsed, amrapTotal, totalIntervals, workout.isAmrap, doSound, doVibrate]);

  const handleStart = () => {
    unlockAudio();
    requestWakeLock();
    setState('running');
    doSound(playWorkBeep);
    doVibrate([100, 50, 100]);
  };

  const handlePause = () => setState('paused');
  const handleResume = () => setState('running');

  const handleSkip = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= totalIntervals) {
      setState('finished');
      releaseWakeLock();
      return;
    }
    setElapsed((e) => e + (current?.duration ?? 0) - timeLeft);
    setCurrentIdx(nextIdx);
    setTimeLeft(intervals.current[nextIdx].duration);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setTimeLeft(intervals.current[0]?.duration ?? 0);
    setElapsed(0);
    setState('ready');
  };

  const handleFinish = () => {
    logWorkout(workout.day, settings.currentWeek, notes);
    onComplete();
  };

  if (!current && state !== 'finished') {
    return (
      <div className="fixed inset-0 bg-pb-dark z-50 flex items-center justify-center">
        <p className="text-white text-xl">No intervals found</p>
        <button onClick={onClose} className="mt-4 text-pb-green">Close</button>
      </div>
    );
  }

  const isWork = current?.type === 'work' || current?.type === 'warmup';
  const bgColor = state === 'finished'
    ? 'bg-gradient-to-b from-pb-dark to-[#0a1a0a]'
    : isWork
    ? 'bg-gradient-to-b from-[#001a0a] to-pb-dark'
    : 'bg-gradient-to-b from-[#1a0a0a] to-pb-dark';

  const accentColor = state === 'finished' ? 'text-pb-green' : isWork ? 'text-pb-green' : 'text-pb-red';
  const borderColor = state === 'finished' ? 'border-pb-green/30' : isWork ? 'border-pb-green/20' : 'border-pb-red/20';

  return (
    <div className={`fixed inset-0 z-50 ${bgColor} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => {
            if (state === 'running') handlePause();
            if (confirm('Exit workout?')) {
              releaseWakeLock();
              onClose();
            } else if (state === 'running') handleResume();
          }}
          className="text-pb-muted text-sm hover:text-white"
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="text-xs text-pb-muted">{workout.emoji} {workout.title}</div>
          <div className="text-xs text-pb-muted">Week {settings.currentWeek}</div>
        </div>
        <div className="text-xs text-pb-muted">{currentIdx + 1}/{totalIntervals}</div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5 mx-4 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isWork ? 'bg-pb-green' : 'bg-pb-red'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {state === 'finished' ? (
          <>
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-pb-green mb-2">Workout Complete!</h2>
            <p className="text-pb-muted mb-6">{workout.title} — Week {settings.currentWeek}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any notes..."
              className="w-full max-w-sm bg-white/5 border border-pb-border rounded-xl p-3 text-white placeholder-pb-muted mb-4 resize-none h-24"
            />
            <button
              onClick={handleFinish}
              className="w-full max-w-sm py-4 rounded-2xl bg-pb-green text-black font-bold text-xl active:scale-95 transition-all"
            >
              ✓ Log & Close
            </button>
            <button
              onClick={handleRestart}
              className="mt-3 text-pb-muted hover:text-white"
            >
              🔄 Restart
            </button>
          </>
        ) : (
          <>
            {/* Interval type badge */}
            <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${accentColor}`}>
              {current.type === 'warmup' ? '🔥 Warm-Up' : current.type === 'work' ? '💪 Work' : '😤 Rest'}
            </div>

            {/* Current label */}
            <h2 className="text-2xl font-bold text-white text-center mb-1">{current.label}</h2>
            {current.notes && <p className="text-sm text-pb-muted text-center mb-4">{current.notes}</p>}

            {/* Timer */}
            <div className={`border-4 ${borderColor} rounded-full w-56 h-56 flex items-center justify-center mb-6`}>
              <span className={`text-7xl font-mono font-bold ${accentColor} tabular-nums`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Interval progress within current */}
            {current.duration > 0 && (
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isWork ? 'bg-pb-green' : 'bg-pb-red'}`}
                  style={{ width: `${((current.duration - timeLeft) / current.duration) * 100}%` }}
                />
              </div>
            )}

            {/* Next preview */}
            {next && (
              <div className="text-sm text-pb-muted mb-6">
                Next: <span className="text-white">{next.label}</span> ({formatTime(next.duration)})
              </div>
            )}

            {/* Controls */}
            {state === 'ready' ? (
              <button
                onClick={handleStart}
                className="w-full max-w-xs py-5 rounded-2xl bg-pb-green text-black font-bold text-2xl active:scale-95 transition-all shadow-lg shadow-pb-green/20"
              >
                ▶ GO
              </button>
            ) : (
              <div className="flex gap-3 w-full max-w-xs">
                {state === 'running' ? (
                  <button
                    onClick={handlePause}
                    className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg active:scale-95"
                  >
                    ⏸ Pause
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="flex-1 py-4 rounded-2xl bg-pb-green text-black font-bold text-lg active:scale-95"
                  >
                    ▶ Resume
                  </button>
                )}
                <button
                  onClick={handleSkip}
                  className="py-4 px-5 rounded-2xl bg-white/10 text-white font-bold text-lg active:scale-95"
                >
                  ⏭
                </button>
              </div>
            )}

            {state !== 'ready' && (
              <button onClick={handleRestart} className="mt-4 text-sm text-pb-muted hover:text-white">
                🔄 Restart
              </button>
            )}
          </>
        )}
      </div>

      {/* AMRAP total timer */}
      {workout.isAmrap && state !== 'finished' && (
        <div className="text-center pb-4 text-xs text-pb-muted">
          AMRAP Total: {formatTime(Math.max(0, amrapTotal - elapsed - (current?.duration ?? 0) + timeLeft))} remaining
        </div>
      )}
    </div>
  );
}
