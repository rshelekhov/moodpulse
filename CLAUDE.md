---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

---

## Project: MoodPulse

MoodPulse is a Telegram bot for people with Bipolar Affective Disorder (BAD). It tracks mood, energy, sleep, anxiety, irritability, and medication adherence to help users notice early signs of episodes.

**This is NOT a diagnostic tool or medical advice.** It is a self-observation diary.

### Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun |
| Web Framework | Hono (for webhook/API in later stages) |
| ORM | Prisma |
| Database | PostgreSQL |
| Telegram Bot | grammY |
| Charts | chart.js + chartjs-node-canvas |
| Validation | zod |

### Key Architecture Decisions

- Entry point is `src/index.ts` — it imports and starts the bot.
- Bot logic lives in `src/bot/` with commands in `src/bot/commands/`.
- Business logic lives in `src/services/`.
- Database access goes through `src/repositories/` using Prisma.
- Hono is NOT used in early stages. Bot runs via long polling (`bot.start()`). Hono will be added later for webhook mode and HTTP API.
- Prisma schema is in `prisma/schema.prisma`. New Prisma versions auto-detect `DATABASE_URL` from `.env` — do NOT add `url = env("DATABASE_URL")` to the datasource block.

### Database Models

- **User** — Telegram user with settings (timezone, reminder time, medication flag).
- **Checkin** — Daily check-in with mood (-3 to +3), energy (1-5), sleep (hours + quality), anxiety (0-3), irritability (0-3), medication status, and optional note. One check-in per user per date (`@@unique([userId, date])`).
- **QuickNote** — Free-form notes outside check-ins, with tags.
- **CustomMarker** — User-defined episode warning signs (e.g. "impulsive spending").
- **MarkerEntry** — Records of when a custom marker was observed.

### Check-in Parameter Scales

| Parameter | Range | Meaning |
|-----------|-------|---------|
| mood | -3 to +3 | -3 = severe depression, 0 = euthymia, +3 = mania |
| energy | 1 to 5 | 1 = very low, 3 = normal, 5 = excessive |
| sleepDuration | Float | Hours of sleep |
| sleepQuality | POOR / FAIR / GOOD | Subjective quality |
| anxiety | 0 to 3 | 0 = none, 3 = severe |
| irritability | 0 to 3 | 0 = none, 3 = severe |
| medicationTaken | TAKEN / SKIPPED / NOT_APPLICABLE | Medication adherence |

### Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome and user registration |
| `/checkin` | Start daily check-in |
| `/quick` | Quick note |
| `/today` | Show today's check-in |
| `/week` | Weekly stats and chart |
| `/month` | Monthly stats and chart |
| `/history` | Check-in history with pagination |
| `/settings` | User settings |
| `/markers` | Custom marker management |
| `/export` | Export data for a period |
| `/help` | Command reference |

### Development Stages

1. **Foundation (MVP)** — Bot with `/start`, `/checkin`, `/today`. Save check-ins to DB.
2. **Full Check-in** — FSM dialog for all parameters, skip/edit support.
3. **History & Stats** — `/history`, `/week`, `/month` with text summaries.
4. **Visualization** — Chart generation sent as images.
5. **Reminders** — Scheduled check-in reminders with timezone support.
6. **Smart Alerts** — Pattern detection (sleep drop + energy rise, missed meds).
7. **Quick Notes & Markers** — `/quick`, `/markers`, personalized tracking.
8. **Export & Reports** — PDF/CSV export for doctor appointments.

### Development Principles

- Each stage must produce a fully working bot. No half-finished features.
- Type safety end-to-end: TypeScript + Prisma + Zod.
- Keep it simple first, refactor when needed.
- Write clear code with good naming — you'll read it in 6 months.
- Smart alerts are observations, never diagnoses. Tone must be gentle and non-intrusive.

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/moodpulse"
BOT_TOKEN="your-bot-token"
```

### Code Style Rules

- Do NOT add comments unless the logic is genuinely non-obvious
- Run `bunx --bun biome check --write .` after writing/editing code
- Run `bun test tests/` before considering a task done

### Git Commit Rules

- Do NOT include `Co-Authored-By` lines in commits
- Keep commit messages to a single short line (imperative mood)
- Do NOT mention Claude, Claude Code, or AI in commits

### Useful Resources

- [grammY docs](https://grammy.dev/)
- [Prisma docs](https://www.prisma.io/docs)
- [Hono docs](https://hono.dev/)
- [Bun docs](https://bun.sh/docs)
- [Chart.js docs](https://www.chartjs.org/docs/)

<!-- agent-memory-kit:start -->
# Persistent Memory Workflow
Before substantial work, run:
`/Users/rs/github.com/agent-memory-kit/.venv/bin/mem recall "<task summary>" --db /Users/rs/github.com/moodpulse/.memory-kit/memory.db`

After completing work, save a summary:
`/Users/rs/github.com/agent-memory-kit/.venv/bin/mem commit --kind worklog --title "<what changed>" --from-stdin --agent claude --db /Users/rs/github.com/moodpulse/.memory-kit/memory.db`

Use `--kind decision` for architecture choices and `--kind fact --fact-key` for stable repository facts.
<!-- agent-memory-kit:end -->
