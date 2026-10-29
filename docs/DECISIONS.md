# Decisions Log

Running log of product/technical decisions made during the build, most recent last.

## Product scope (from interview)

- **Single tenant.** One company only (seeded demo company "Northwind Technologies"). The `Company` entity/column still exists for clean modeling, but there is no cross-company tenant-isolation guard or test suite — only one company will ever exist in this build.
- **Internal demo, no commercial logic.** No pricing/billing/trial-limit features.
- **English only.** No i18n library, no Albanian translations/scaffolding for this pass.
- **Product name: "Deloitte Elevate".** Visual identity uses a neutral professional palette, not Deloitte's actual trademarked colours/logo (not a confirmed officially-sanctioned brand asset).
- **Seed data kept at full spec size:** 7-step onboarding, 25+ jobs, 90+ skills, 80+ courses.
- **Scope trim:** no AI eval harness (20 synthetic profiles), no Playwright E2E, no exhaustive Jest coverage — a handful of targeted tests only. Simple (not deep) AuditLog + GDPR export/delete.
- **Hosting:** local only, no deployment config.

## Technical stack & structure

- **Not a monorepo.** Per explicit instruction, the project mirrors the structure of the reference project at `~/Documents/EEF/M4R`: a top-level `client/` (Next.js) and `server/` (NestJS) as two independent npm projects — no pnpm workspaces, no `packages/shared`. Where small types/enums need to exist on both sides, they are duplicated deliberately (server `src/types`, client `src/types`/`src/constants`), matching the M4R convention.
- **NestJS module layout mirrors M4R:** flat feature folders directly under `server/src/<feature>/` (not nested under `src/modules/<feature>`), each with its own `entities/` and `dto/` subfolders. Cross-cutting pieces live in `server/src/guard/`, `server/src/decorators/`, `server/src/helpers/`, `server/src/types/`, `server/src/migrations/`, `server/src/utilities/` (seed/CLI scripts), `server/src/modules/` (app-wide infra: `data-source.ts`, logger).
- **TypeORM conventions mirror M4R:** `typeorm-naming-strategies` `SnakeNamingStrategy` for snake_case columns, `mysql2` driver, `@PrimaryGeneratedColumn('uuid')` for char(36) UUID primary keys, `synchronize: false`, migrations run via the TypeORM CLI against `src/modules/data-source.ts`.
- **Auth is custom, not Auth0 (deliberate deviation from M4R).** M4R delegates auth entirely to Auth0 (JWKS verification, no local password storage). That doesn't fit this build's invite-only registration + company-scoped roles + the already-approved security design (hashed passwords, hashed single-use invite tokens, JWT access + rotating refresh tokens in HTTP-only cookies). Keeping custom auth also avoids requiring an external Auth0 tenant for a local demo. The guard/decorator *naming style* (`*.guard.ts` in `src/guard/`, param decorators in `src/decorators/`) is still mirrored from M4R; the verification logic itself is local JWT, not JWKS.
- **Password hashing:** bcrypt (cost 12), matching M4R's choice — an explicitly allowed alternative to argon2id in the original spec.
- **UI stack:** Next.js App Router, Tailwind v4, shadcn/ui (`nova` preset — the current shadcn CLI replaced the old "new-york" style used by M4R; closest modern equivalent, still Radix + lucide-react under the hood), TanStack Query/Table, react-hook-form + Zod resolvers, sonner for toasts, next-themes for dark mode.
- **No Docker available on this machine** (checked: no `docker` binary). Local MySQL is provided by an existing Homebrew MySQL 9.6 service instead. A `server/compose.yaml` is still included (mirroring M4R's pattern) for portability on machines that do have Docker, but local dev/testing in this environment uses the Homebrew install directly, database name `ds` (per explicit instruction), user `pathway`.
- **Gemini API key handling:** the user pasted a live key into chat during the interview. Per the non-negotiable security rules (key must never appear in chat/git/logs), the key was **not** written to any file. The user was advised to rotate it in Google AI Studio and place the new key only in `server/.env` (gitignored) when ready. Until then, `GEMINI_API_KEY` stays empty and the pipeline uses the deterministic fallback generator automatically.

## Issues found and fixed during verification

- **TypeORM `@JoinColumn` naming bug (fixed before any real data existed).** Every relation that
  paired an explicit scalar FK column (e.g. `skillId: string`) with `@ManyToOne() @JoinColumn({ name: 'skillId' })`
  was silently creating a *second*, always-NULL shadow column, because the explicit camelCase
  `name` bypassed `SnakeNamingStrategy` while the plain column did not. Reads via `relations: {...}`
  joined on the empty shadow column and returned `null` relations. Fixed by removing the explicit
  `name` from every `@JoinColumn()` so both pieces resolve to the same snake_case column. Caught
  by the first real seed run (`us.skill` was null); the database was dropped and recreated once,
  cleanly, since no real user data existed yet.
- **MySQL rejected `DEFAULT CURRENT_TIMESTAMP(6)` on `datetime(3)` columns.** TypeORM's generated
  default didn't match the column's own precision. Fixed by explicitly setting
  `default: () => 'CURRENT_TIMESTAMP(3)'` (and `onUpdate` for the updated-at columns) on every
  `@CreateDateColumn`/`@UpdateDateColumn`.
- **MySQL rejected a literal default on a `TEXT` column** (`Skill.description`). Removed the
  default; the seed script always supplies a description.
- **Security: the talents list/detail endpoints were leaking `passwordHash`.** TypeORM selects
  all columns by default, and `TalentsService`/`StudentsController` return the `User` entity
  directly. Fixed at the source by marking `User.passwordHash` as `{ select: false }`, so it's
  excluded from every query unless explicitly requested. Added `UsersService.findByEmailWithPassword`
  / `findByIdWithPassword` (via query builder `addSelect`) for the two places that actually need
  to compare it: login and change-password.
- **`@nestjs/config@12`, `@nestjs/typeorm@12`, and `uuid@14` are pure ESM (`"type": "module"`,
  no CJS build).** npm's peer-dependency resolution happily installed them alongside
  `@nestjs/core@11`, and the app itself ran fine under `ts-node`/Node 24 (which can `require()`
  synchronous ESM), but Jest's CJS test runner could not. Pinned to the last CJS-compatible
  majors (`@nestjs/config@^4`, `@nestjs/typeorm@^11`, `uuid@^9` + `@types/uuid`) instead of
  reconfiguring Jest for ESM — simpler and removes a latent "it only works by accident on this
  Node version" risk.
