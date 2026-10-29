# DeloitteElevate

A single-tenant internal platform for onboarding new-graduate hires, profiling their skills and
goals, and generating an AI-written career path against one company's real open jobs and course
catalogue. Two roles only — **STUDENT** (the new hire) and **COMPANY_ADMIN** (HR) — no multi-tenant
logic, no billing, no public marketing site. English only, local/demo hosting.

Not a monorepo: `client/` (Next.js) and `server/` (NestJS) are two independent npm projects. Small
types/enums that need to exist on both sides are duplicated deliberately (`client/src/types`,
`server/src/types`) rather than shared via a `packages/` workspace. See `docs/DECISIONS.md` for the
full rationale log behind these choices and for issues already found and fixed.

## What the platform offers

### Public panel (`client/src/app/(public)/`) — `/login`, `/register`, `/privacy`
- Login and registration with Zod-validated forms, live password-strength meter on register.
- Invite-token registration is optional, not required: an invalid/expired/used token shows a toast
  but never blocks signup; a *valid* token locks the email field and shows the inviting company name.
- Dark/light theme toggle (top-right, since this panel has no header/nav).

### Student panel (`client/src/app/(student)/`) — gated by `RequireRole(STUDENT)`
- **Onboarding** (`/onboarding/[1–7]`): Studies → Industry & Interests → Current Skills → Soft
  Skills → Career Direction → Goals & Timeline (also captures the two consent checkboxes — privacy
  policy + AI processing, gating progression) → Review (a readable, human-formatted summary of all
  six prior steps, not raw JSON). An `OnboardingGate` force-redirects to the current unfinished step
  until `onboardingCompletedAt` is set. Progress shown via an animated segmented stepper.
- **Career path** (`/career-path`): animated fit-score ring, recommended role + why-it-fits +
  alternatives, prioritized skill gaps (HIGH/MED/LOW), a phased roadmap (courses + milestone +
  success signal per phase), the company's internal progression ladder, a weekly time-split plan,
  caveats, next steps, thumbs up/down feedback, print support. Three real states beyond the happy
  path: generating (polling, rotating-message loader), failed-with-reason, not-yet-generated.
- **Profile** (`/profile`): editable personal/professional fields, avatar upload, click-to-remove
  skill badges, change password, regenerate career path, GDPR-style **download my data** and
  **delete my account** (soft-delete/anonymize, confirmation dialog).

### Company panel (`client/src/app/(company)/company/`) — gated by `RequireRole(COMPANY_ADMIN)`
- **Dashboard**: 5 KPI tiles (total talents, onboarding completion %, paths generated, open jobs,
  avg. fit score) + 3 bar-list breakdowns (talents by target role, top skill gaps across the pool,
  onboarding funnel by step) + a recent-activity feed sourced from the audit log.
- **Jobs**: status filter (DRAFT/OPEN/PLANNED/CLOSED), publish/close/duplicate actions, full edit
  form, plus a raw "AI view" JSON toggle on the detail page (intentionally admin/debug-facing).
- **Talents**: paginated, searchable table (TanStack Table) — name, email, target role, onboarding
  progress, fit score, status. Detail page: profile, skills, latest path, full version history,
  archive/restore, regenerate path.
- **Invitations**: single invite by email, bulk invite (newline emails or N anonymous links),
  status badges (pending/used/expired/revoked), revoke, one-time link-reveal dialog.
- **Catalogue**: read-only shared skills taxonomy + company-scoped course CRUD (global courses
  can't be deleted; company-added ones can).
- **Settings**: company name + industries — the industries list feeds directly into the student
  onboarding dropdown.

### Career-path AI pipeline (`server/src/career-path/`)
The most engineered part of the system — degrades gracefully instead of failing outright:

```
normalize → filter → gap → generate (Gemini) → validate → fallback (deterministic, non-AI)
```

- `normalize` flattens the student profile into AI-ready context.
- `filter` narrows to candidate jobs matching industry + role family.
- `gap` computes fit score + per-skill current-vs-required deltas.
- `generate` prompts Gemini (`@google/genai`) with a versioned prompt (`career-path.v1`).
- `validate` schema-checks the AI's JSON output, with up to 2 repair attempts.
- `fallback` is a fully deterministic generator used if Gemini is unavailable or output never
  validates — the user always gets a path, AI or not.

Runs through an in-process generation queue with a stuck-generation recovery sweep (5-minute
threshold). Every generation is a new versioned `CareerPath` row (never overwritten) and is
audit-logged.

## Data model (`server/src/*/entities/`, 15 entities)

`User` (role/status, `passwordHash` is `{select:false}`) → `StudentProfile` (1:1 — every onboarding
answer lives here as columns) and `Company`. `Skill` ↔ `UserSkill` (self-rated 1–5) ↔ `JobSkill`
(required level + weight + required/nice-to-have) is the matching triangle the fit score runs on.
`Job` is heavily specced (seniority, work mode, salary, responsibilities, promotion criteria,
months-to-productivity). `JobProgression` models the ladder a job leads to. `Course` + `CourseSkill`
tie learning content to skills. `CareerPath` stores versioned AI output + validation report +
feedback. `Invitation` (hashed single-use tokens), `RefreshToken`, `OnboardingResponse`, `AuditLog`.

Seed data (`server/src/utilities/seed.ts`, run via `npm run seed`): 100 skills, 36 jobs, 18 courses,
one demo company, one demo HR admin (`hr@northwind-demo.com` / `Demo-HR-2026!`), one demo student
(`Demo-Student-2026!`).

## Auth & security

- Custom auth (not a delegated provider) — deliberate, to support invite-only registration +
  company-scoped roles without standing up an external tenant for a local demo.
- bcrypt (cost 12) password hashing. JWT access token (short TTL) + rotating refresh token, both
  HTTP-only cookies — not localStorage.
- `RequireRole` (`client/src/components/auth/require-role.tsx`) is the client-side gate: redirects
  to `/login` if unauthenticated, or to the other role's home if the role doesn't match.
- Server: Helmet, strict single-origin CORS, custom CSRF middleware, `@nestjs/throttler` rate
  limiting (10 req/window — confirmed via `X-RateLimit-*` headers), global `ValidationPipe`
  (`whitelist` + `forbidNonWhitelisted` + `transform` — unknown fields are rejected, not dropped).
- Swagger docs at `/api/docs`, non-production only.

## Stack

**Client** — Next.js 16 (App Router) + React 19, Tailwind v4, shadcn/ui on Base UI primitives,
TanStack Query (server state) + TanStack Table (talents grid), react-hook-form + Zod resolvers,
sonner (toasts), next-themes (dark mode).

**Server** — NestJS 11 + TypeORM 0.3 + MySQL (`mysql2`), `typeorm-naming-strategies`
`SnakeNamingStrategy`, UUID primary keys, migrations only (`synchronize: false`), Pino structured
logging, `@google/genai` for Gemini, `@nestjs/schedule` for the stuck-generation sweep.

## Commands

```bash
# client/
npm run dev         # next dev, :3000
npm run build        # next build
npm run lint          # eslint
npm run typecheck    # tsc --noEmit

# server/
npm run start:dev    # nest start --watch, :4000
npm run seed          # populate demo data (idempotent — skips existing records)
npm run migration:run # apply pending TypeORM migrations
npm run test           # jest unit specs
npm run lint            # eslint --fix
npm run typecheck     # tsc --noEmit
```

Client proxies `/api/:path*` → `server`'s `API_INTERNAL_URL` (default `http://localhost:4000`) via
`next.config.ts` rewrites — both servers must be running for the app to work end-to-end, and the
backend's CORS/CSRF checks mean API calls only succeed when proxied through the Next.js app (a bare
`curl` without a matching `Origin` header gets a 403).

## Conventions worth knowing

- Routing is role-scoped by Next.js route groups: `(public)`, `(student)`, `(company)` — each with
  its own `layout.tsx` doing the actual gating.
- Server feature folders are flat under `server/src/<feature>/` (not nested under `src/modules/`),
  each with its own `entities/` and `dto/`. Cross-cutting code lives in `guard/`, `decorators/`,
  `helpers/`, `types/`, `migrations/`, `utilities/` (seed/CLI scripts), `modules/` (data-source,
  logger).
- UI primitives in `client/src/components/ui/` are shadcn components on Base UI — edit the
  component, not a copy, when changing shared look-and-feel (inputs, selects, checkboxes etc. were
  all tuned for bigger/more-detectable hit targets and hover states in a prior pass).
- Onboarding step UI lives in `client/src/components/onboarding/step{1-7}-*.tsx`, each owning its
  own `Step*Values` interface and a matching server-side DTO in
  `server/src/onboarding/dto/step*.dto.ts` — keep both in sync when changing a step's fields.
- Global theming: CSS custom properties in `client/src/app/globals.css` (a single green accent over
  a cool-neutral gray family, OKLCH-defined) — see the comment block there and `docs/DECISIONS.md`
  before changing brand colors.

## Testing & known gaps (intentional, not oversights)

- 6 Jest specs server-side (auth service, invitations service, 3 AI-pipeline units). No client
  tests, no E2E (Playwright), no full coverage — explicit scope trim.
- No cross-tenant isolation tests — only one company will ever exist in this build.
- No i18n, no deployment config (local-only; a `server/compose.yaml` exists for portability but is
  unused here).
- The job detail page's "AI view" raw-JSON toggle and the catalogue's course-creation dialog are
  intentionally raw/admin-facing — don't "simplify" them without checking they're meant for HR/eng,
  not end users.
