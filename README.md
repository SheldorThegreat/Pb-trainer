# 🎯 PB Trainer — Paintball Conditioning App

A 6-week progressive paintball-specific conditioning program with a built-in interval timer.

## Features

- **📱 Mobile-first** — dark mode, large thumb-friendly buttons
- **⏱ Workout Timer** — auto-advancing intervals with work/rest visual distinction, countdown beeps (Web Audio API), vibration, screen wake lock
- **📅 6-Week Progressive Program** — auto-adjusts reps, rounds, and rest periods per week
- **📊 Progress Tracking** — streaks, completion history, workout notes (localStorage)
- **⚙️ Settings** — sound, vibration, meters/yards, manual week select, reset progress

## Workouts

| Day | Focus | Type |
|-----|-------|------|
| 1 | PB Acceleration | Sprint intervals + kneeling starts |
| 2 | Sprint Endurance | Sprint-backpedal-wall sit combos |
| 3 | Engine + Mobility | Zone 2 cardio + core circuits |
| 4 | Reactive Speed | Reactive sprints + core |
| 5 | Match Simulation | AMRAP game-day conditioning |
| 6 | Optional Cardio | Light active recovery |
| 7 | Rest | Full rest day |

## Progression

- **Weeks 1-2**: Base program — focus on form
- **Weeks 3-4**: +2 sprint reps, +1 core round
- **Weeks 5-6**: Reduced rest (20-25s), 30-min match sim

## Setup

```bash
npm install
npm run dev     # Development server at http://localhost:3000
npm run build   # Production build (static export)
```

## Tech Stack

- Next.js 14 (App Router, static export)
- TypeScript
- Tailwind CSS
- Web Audio API (sound cues)
- Wake Lock API (keep screen on)
- localStorage (persistence, no backend)

## Deploy

Static export (`output: 'export'`) — deploy the `out/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).
