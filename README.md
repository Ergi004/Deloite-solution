# Deloitte Elevate

A personalised, company-backed career path platform for new graduates. Students complete a
7-step onboarding wizard; an AI engine (Google Gemini, with an automatic deterministic fallback)
builds a career path constrained to the company's real jobs and course catalogue. Company admins
manage jobs, invitations, the skills/courses catalogue and see talent/onboarding analytics.

This is a demo build for a single company (seeded as "Northwind Technologies"). See
`docs/DECISIONS.md` for the decisions made along the way and what's deliberately out of scope.

## Stack

- `server/` — NestJS + TypeORM + MySQL (plain npm project, not a monorepo)
- `client/` — Next.js (App Router) + Tailwind + shadcn/ui (Base UI) + TanStack Query

## Prerequisites

- Node.js 20+
- A MySQL 8/9 server reachable locally (this build does not use Docker — see
  `docs/DECISIONS.md` for why)

## Setup

1. **Database.** Create a database and point `server/.env` at it (copy `server/.env.example`
   if you don't have one yet):

   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=<your password>
   DB_NAME=ds
   ```

2. **Install dependencies and run migrations/seed:**

   ```bash
   cd server
   npm install
   npm run migration:run
   npm run seed
   ```

   The seed is idempotent — safe to re-run. It prints the demo HR login and several invite
   links to the console.

3. **Gemini API key (optional).** Leave `GEMINI_API_KEY` empty in `server/.env` to run entirely
   on the deterministic fallback career-path generator (no external calls). To use real Gemini
   generation, put a valid key in `server/.env` — never in client/.env, never committed.

4. **Client env.** Copy `client/.env.example` to `client/.env` (default values work for local
   dev; it just points the Next.js rewrite proxy at the API).

5. **Run both apps** (two terminals):

   ```bash
   cd server && npm run start:dev   # http://localhost:4000
   cd client && npm run dev         # http://localhost:3000
   ```

   The web app proxies `/api/*` to the API via `next.config.ts` rewrites, so the browser only
   ever talks to `http://localhost:3000`.

## Demo login

- **Company admin:** `hr@northwind-demo.com` / `Demo-HR-2026!`
- **Demo students (read-only browsing, already onboarded):**
  `ana.demo@northwind-demo.com` / `Demo-Student-2026!`
  `dren.demo@northwind-demo.com` / `Demo-Student-2026!`
- **New student signup:** the seed prints 3 pending invite links to the console
  (`npm run seed` output) — open one in the browser to go through registration + onboarding
  yourself.

## Testing

```bash
cd server && npm test        # targeted Jest tests (see below for coverage scope)
cd server && npm run lint && npm run typecheck
cd client && npm run lint && npm run typecheck && npm run build
```

## What's built

- Invite-only registration, JWT access + rotating refresh tokens in HTTP-only cookies, reuse
  detection, role guards (`COMPANY_ADMIN` / `STUDENT`)
- 7-step onboarding wizard with autosave/resume
- AI career-path pipeline: normalize → filter (industry/role-family boundaries, adjacency) →
  gap/fit scoring → Gemini generation → strict validation → deterministic fallback
- Career-path page (fit score, phases, progression ladder, regenerate, feedback, print)
- Student profile (edit, skills manager, avatar upload, password change, data export, delete
  account)
- Company panel: dashboard KPIs, talents (list/detail/archive/regenerate), jobs (full CRUD +
  publish gating + progression ladders), invitations (single/bulk, revoke), catalogue
  (skills read-only, courses CRUD), settings
- Seed data: 100 skills, 117 courses (13 internal), 25 required jobs (20 open/3 planned/2
  draft) + 11 progression-ladder jobs, demo company admin, demo students, pending/used/expired
  invitations

## Known limitations (by design, see `docs/DECISIONS.md`)

- Single tenant only — one company (Northwind Technologies), no cross-company isolation logic
- English only, no i18n
- No AI eval harness, no Playwright E2E — a handful of targeted tests only
- No Docker in this environment — run against a local MySQL install instead
- Email is never actually sent — invite links are logged to the console and shown once in the
  company admin UI
