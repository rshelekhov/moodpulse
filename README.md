# MoodPulse

MoodPulse is a Telegram bot that helps people with bipolar disorder track daily signals like mood, energy, sleep, anxiety, irritability, and medication. It keeps the process quick, collects optional notes, and can visualize trends so early warning patterns are easier to spot.

MoodPulse is a self-observation tool, not a medical device. It does not diagnose or replace care from a licensed clinician.

Why it exists: standard mood trackers often collapse everything into a single "bad/okay/good" scale, which misses important bipolar-specific signals. Mood and energy can move independently, sleep changes are a key predictor, and irritability can be the main symptom. MoodPulse separates these dimensions so users can notice meaningful changes and share clearer data with their clinician.

## Tech Stack

- Runtime: Bun
- Web framework: Hono
- ORM: Prisma
- Database: PostgreSQL
- Telegram bot: grammY
- Charts: chart.js + @napi-rs/canvas
- Validation: Zod
