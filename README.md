# MoodPulse

MoodPulse is a Telegram bot that helps people with bipolar disorder track daily signals like mood, energy, sleep, anxiety, irritability, and medication. It keeps the process quick, collects optional notes, and can visualize trends so early warning patterns are easier to spot.

MoodPulse is a self-observation tool, not a medical device. It does not diagnose or replace care from a licensed clinician.

Why it exists: standard mood trackers often collapse everything into a single "bad/okay/good" scale, which misses important bipolar-specific signals. Mood and energy can move independently, sleep changes are a key predictor, and irritability can be the main symptom. MoodPulse separates these dimensions so users can notice meaningful changes and share clearer data with their clinician.

## Features

- **Daily check-in** — guided dialog covering mood, energy, sleep duration/quality, anxiety, irritability, medication status, and an optional free-text note. Supports editing an existing check-in for the same day.
- **Today view** — quick summary of today's check-in with a shortcut to start one.
- **Statistics** — weekly and monthly summaries with averages, mood trend detection, and a calendar view with per-day drill-down. Last-7-checkins mode for recent history.
- **Charts** — mood/energy, sleep, anxiety/irritability, and medication adherence rendered as images (line and bar charts).
- **Export** — CSV and Excel export for any period; optional email delivery.
- **Reminders** — configurable daily reminder with timezone support, snooze (30 min / 1 h / 2 h), and skip-today option.
- **Smart alerts** — after each check-in the bot checks for five clinically-motivated patterns:
  - Short sleep + high energy (possible hypomania signal)
  - Missed medications (repeated skips in a week)
  - Mood swing (large change between consecutive days)
  - Mood downtrend (sustained decline over several days)
  - High irritability + high energy
  Alerts are gentle observations with a disclaimer, never diagnoses. Users control them via `/settings` (on/off, sensitivity: low/medium/high). A 7-day per-rule cooldown prevents alert fatigue.
- **i18n** — Russian and English, auto-detected from Telegram language.

## Tech Stack

- Runtime: Bun
- Web framework: Hono
- ORM: Prisma
- Database: PostgreSQL
- Telegram bot: grammY
- Charts: chart.js + @napi-rs/canvas
- Validation: Zod
