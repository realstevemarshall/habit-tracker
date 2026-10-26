# Habit & Exercise Tracker

A zero-cost, local-first habit and exercise tracker built with React, Vite, Tailwind CSS, and Recharts. All data is stored in the browser's `localStorage` — no backend required. It can be installed to a phone's home screen and works offline.

## Tracking Period

**October 27, 2026 – July 23, 2027 (270 days)**, ending the day before the 50th birthday (July 24, 2027).

The dates live in `src/data/constants.ts` (`TRACKING_START`, `TRACKING_END`, `BIRTHDAY_50`); period length, daily pace, date-picker limits, and labels are all derived from them.

## Goals

| Goal | Target by birthday | Even daily pace |
| --- | --- | --- |
| Push-ups | 6,750 | 25 / day |
| Sit-ups | 6,750 | 25 / day |
| Pull-ups | 1,480 | ~5.5 / day |
| Running | 540 miles | 2 mi / day |
| Each daily habit | 216 of 270 days | 80% of days |
| Weekly fast days | 39 | 1 / week |
| 96-hour fasts | 3 | Nov 2026, Feb 2027, May 2027 |

## Features

- **Exercise tracking** — Push-ups, sit-ups, pull-ups, and miles with progress bars and a cumulative chart against an even pace line
- **Daily pace** — "Need X/day" from today to the end of the period (a missed day is spread over the days left), plus Ahead / On pace / Behind status. Pace is judged against where you should be at the end of *yesterday*, so you're not "behind" first thing in the morning
- **Big quick-add buttons** — +5 / +10 / +25 reps and +0.5 / +1 / +2 miles, with matching undo buttons (a day can't go below zero)
- **Streaks** — Workout streak (consecutive days with any exercise logged) and habit streak (consecutive days with at least 80% of habits — 9 of 11 — done), each with a best-ever count. Today doesn't break a streak until it's over
- **Daily habits** — 11 checkboxes with definition tooltips and history by date
- **Weekly fast** — Track progress toward 39 fast days
- **Quarterly 96-hour fasts** — Three windows with optional start/end dates
- **Dashboard** — Summary, streaks, pace, and countdown to the 50th birthday
- **Backup** — Export downloads all data as `habit-tracker-backup-YYYY-MM-DD.json`; Import validates a backup file and asks before replacing current data
- **Installable (PWA)** — Web app manifest, icons, and an offline service worker via `vite-plugin-pwa`

## Data storage

Data is saved under the `localStorage` key `habit-tracker-data-v2`. Data from the previous July 2026 tracking year is left untouched under `habit-tracker-data-v1` in the same browser (it's just no longer shown).

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Installing on a phone

Phones only install web apps served over **HTTPS**, so the built `dist/` folder has to be hosted somewhere (for example GitHub Pages, Netlify, or Vercel). Then open the site on the phone and choose **Share → Add to Home Screen** (iPhone, Safari) or **Install app** (Android, Chrome).

If hosting under a sub-path such as `https://<user>.github.io/habit-tracker/`, set `base: '/habit-tracker/'` in `vite.config.ts` first.

Note: data saved on the phone is separate from data in your computer's browser — use Export/Import to move it.
