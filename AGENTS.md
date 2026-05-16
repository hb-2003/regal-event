<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regal Events — Project Guide for Agents

A Next.js 16 + React 19 marketing & booking site for **Regal Event London** (event décor & planning). Public pages, an admin panel, a PostgreSQL + TypeORM booking system, and transactional email.

> `CLAUDE.md` just re-exports this file via `@AGENTS.md`. Update **this** file; do not duplicate content.

## Tech stack

- **Next.js**: `16.2.4` (App Router, Turbopack). Read `node_modules/next/dist/docs/` before assuming any API.
- **React**: `19.2.4`
- **TypeScript**: `^5` (`strict: true`, `moduleResolution: "bundler"`, JSX `react-jsx`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Database**: PostgreSQL via **TypeORM** (`pg` driver; `typeorm` in `serverExternalPackages`)
- **Auth**: `jsonwebtoken` + `bcryptjs` (admin_token cookie, JWT signed server-side)
- **Email**: `nodemailer` (SMTP)
- **Misc**: `gsap`, `three` (used on landing/visual pages)
- **Lint**: `eslint` + `eslint-config-next` (flat config in `eslint.config.mjs`)

## Scripts

```bash
npm run dev                  # next dev (Turbopack)
npm run build                # next build
npm run start                # next start
npm run lint                 # eslint
npm run migration:run        # apply TypeORM migrations
npm run migration:revert     # revert last migration
npm run db:check                                         # verify DATABASE_URL connects
npm run migration:generate -- ./migrations/MyMigration   # generate from entity diff
npm run db:seed              # idempotent reference data (admin, categories, settings)
```

There are no test scripts configured.

## Important Next.js 16 gotchas (do not regress)

- **`middleware.ts` is deprecated → use `proxy.ts`.** The repo already has `proxy.ts` at the root exporting a `proxy(request)` function and a `config.matcher`. Do not rename it back to `middleware.ts`, and do not introduce a parallel `middleware.ts`.
- Always confirm route handler / page / metadata APIs against `node_modules/next/dist/docs/01-app/...` before editing. In particular check:
  - `03-api-reference/03-file-conventions/proxy.md`
  - `03-api-reference/03-file-conventions/route.md`
  - `02-guides/upgrading/version-16.md`
- `next.config.ts` declares `serverExternalPackages: ["pg", "typeorm"]` — keep both for the server bundle.
- Remote images: only `https://img.youtube.com` is allowlisted. Add hosts to `next.config.ts → images.remotePatterns` if you need more.

## Repo layout

```
app/
  layout.tsx              # Root layout: Cormorant Garamond + Jost fonts, dark teal theme
  page.tsx                # Landing page
  globals.css             # Tailwind v4 + design tokens
  about/  book/  categories/  contact/  gallery/  track/  videos/
                          # Public pages (each is a single page.tsx)
  admin/
    login/  dashboard/  bookings/  categories/  gallery/  videos/
                          # Admin UI (protected by proxy.ts)
  api/
    auth/{login,logout}/route.ts
    bookings/route.ts            bookings/[id]/route.ts
    categories/route.ts          categories/[id]/route.ts
    contacts/route.ts
    gallery/route.ts             gallery/[id]/route.ts
    videos/route.ts              videos/[id]/route.ts
    upload/route.ts              # File upload → public/uploads
components/
  Navbar.tsx  Footer.tsx
  admin/AdminSidebar.tsx
src/server/database/
  data-source.ts            # AppDataSource config (runtime + shared)
  migration-datasource.ts   # Default export for TypeORM CLI (-d path)
  entities/*.entity.ts      # Schema source of truth
  seed.ts                   # Idempotent seed script
migrations/                 # TypeORM migration classes (ORM-generated, no .sql files)
lib/
  db.ts                     # getDataSource() / getRepository() singleton
  auth.ts                   # JWT sign/verify, requireAdmin(), generateBookingId()
  email.ts                  # Nodemailer transactional templates (escaped HTML)
proxy.ts                    # Next 16 "proxy" (formerly middleware): guards /admin/*
public/
  uploads/                  # User-uploaded media (gitignored)
  Final Logo.{jpg,png}      # Brand assets
```

Path aliases: `@/*` → repo root; `@/server/*` → `src/server/*`. Prefer `@/lib/db`, `@/server/database/entities`, etc.

## Database (TypeORM + PostgreSQL)

- **Connection**: `DATABASE_URL` (see `.env.example`). Default matches `docker-compose.yml` `db` service.
- **Runtime**: `import { getRepository } from "@/lib/db"` inside route handlers — initializes `AppDataSource` once per process. Do **not** hold repositories at module scope.
- **Schema**: defined in `src/server/database/entities/`. After editing entities, run `npm run migration:generate -- ./migrations/DescriptiveName` then `npm run migration:run`.
- **CLI datasource**: `./src/server/database/migration-datasource.ts` (used by all `migration:*` scripts).
- **Seed** (reference data only, not schema): `npm run db:seed` after migrations on a fresh DB.
- **Tables**: `categories`, `bookings`, `admins`, `gallery`, `videos`, `contacts`, `settings`, plus TypeORM `migrations` history table.
- **Local workflow**:
  ```bash
  docker compose up db -d
  npm run migration:run
  npm run db:seed
  npm run dev
  ```
- **Docker production** (`docker compose up`): the `migrate` service runs `npm run migration:run` once before `app` starts. The `app` image is Next.js standalone only — it has no TypeORM CLI and does not run migrations itself.
- **Non-Docker production** (VPS, etc.): run `npm run migration:run` in CI or on the host **before** `npm run start`, with `DATABASE_URL` set. First deploy only: `npm run db:seed`.
- If upgrading from the old inline `initSchema` DB, drop/recreate the Postgres volume or baseline the `migrations` table before `migration:run`.

## Auth (`lib/auth.ts` + `proxy.ts`)

- `JWT_SECRET` env var is **required** and must be ≥16 chars. The module throws at import time if missing — every route that imports `lib/auth` (directly or via `proxy.ts`) will fail without it.
- Tokens live in the `admin_token` cookie, expire in 24h.
- `proxy.ts` matches `/admin/:path*` and redirects to `/admin/login` if the token is missing or invalid. `/admin/login` itself is exempt.
- For API routes, use `requireAdmin(request)`:
  ```ts
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth; // 401
  // auth.username, auth.id available
  ```
- `generateBookingId()` produces IDs like `RE-YYMM-<10 random A–Z0–9>` using `crypto.randomBytes`.

## Email (`lib/email.ts`)

- Transporter is created per call from env vars (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`).
- Templates: `sendBookingConfirmationToClient`, `sendBookingAlertToAdmin`, `sendStatusUpdateToClient`, `sendContactAlertToAdmin`.
- Brand-themed HTML (teal `#012D32` / cream `#F9F4EE` / gold `#FCCD97`).
- All user-supplied values **must** go through `esc()` before interpolation, and any value that flows into a header (subject, etc.) through `header()`. Don't bypass these helpers — they prevent HTML injection and header-injection attacks.

## Environment variables

See `.env.example`. Required for the app to start / function:

| Var | Purpose |
| --- | --- |
| `JWT_SECRET` | **Required**, ≥16 chars. Signs admin JWTs. |
| `DATABASE_URL` | **Required** for DB. PostgreSQL connection string. |
| `ADMIN_USERNAME` | Seed username (default `admin`). |
| `ADMIN_PASSWORD` | Seed password (bcrypt-hashed on first run). Fallback `admin123` — change in any non-toy environment. |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | SMTP transport. |
| `ADMIN_EMAIL` | Recipient for admin alert emails. |
| `NEXT_PUBLIC_SITE_URL` | Used to build absolute links in emails (e.g. `/track?id=…`). |

`.env`, `.env.local`, etc. are gitignored except `.env.example`.

## Conventions

- **Server-only modules** (`lib/db.ts`, `lib/auth.ts`, `lib/email.ts`) must never be imported from a Client Component. Keep them in route handlers, server components, or server actions.
- **Route handlers** live in `app/api/**/route.ts` and follow App Router conventions for the installed Next.js version — verify against the bundled docs.
- **Styling**: Tailwind v4 utility classes + tokens from `app/globals.css`. Brand palette: `#011F23` (bg), `#012D32` (panel), `#015961` (accent), `#FCCD97` (gold), `#F9F4EE` (cream), `#EDE5D8` (sand).
- **Fonts**: `Cormorant_Garamond` (serif, headings) and `Jost` (sans, body) loaded in `app/layout.tsx` via `next/font/google` and exposed as `--font-cormorant` / `--font-jost`.
- **Path imports**: prefer `@/...` alias over deep relative paths.
- **No tests** are configured. If adding tests, propose the framework choice first.

## Things to be careful about

- Don't commit anything under `public/uploads`.
- Don't weaken the `esc()` / `header()` discipline in email templates.
- Don't add a `middleware.ts` — use the existing `proxy.ts`.
- Don't enable TypeORM `synchronize: true` in production — use migrations only.
- Don't add raw `.sql` migration files; use TypeORM `migration:generate` / entity changes.
- Reuse `getDataSource()` / `getRepository()` — don't create extra DataSource instances.
