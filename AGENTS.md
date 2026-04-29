<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regal Events — Project Guide for Agents

A Next.js 16 + React 19 marketing & booking site for **Regal Event London** (event décor & planning). Public pages, an admin panel, a SQLite-backed booking system, and transactional email.

> `CLAUDE.md` just re-exports this file via `@AGENTS.md`. Update **this** file; do not duplicate content.

## Tech stack

- **Next.js**: `16.2.4` (App Router, Turbopack). Read `node_modules/next/dist/docs/` before assuming any API.
- **React**: `19.2.4`
- **TypeScript**: `^5` (`strict: true`, `moduleResolution: "bundler"`, JSX `react-jsx`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Database**: SQLite via `better-sqlite3` (declared in `serverExternalPackages`)
- **Auth**: `jsonwebtoken` + `bcryptjs` (admin_token cookie, JWT signed server-side)
- **Email**: `nodemailer` (SMTP)
- **Misc**: `gsap`, `three` (used on landing/visual pages)
- **Lint**: `eslint` + `eslint-config-next` (flat config in `eslint.config.mjs`)

## Scripts

```bash
npm run dev      # next dev (Turbopack)
npm run build    # next build
npm run start    # next start
npm run lint     # eslint
```

There are no test scripts configured.

## Important Next.js 16 gotchas (do not regress)

- **`middleware.ts` is deprecated → use `proxy.ts`.** The repo already has `proxy.ts` at the root exporting a `proxy(request)` function and a `config.matcher`. Do not rename it back to `middleware.ts`, and do not introduce a parallel `middleware.ts`.
- Always confirm route handler / page / metadata APIs against `node_modules/next/dist/docs/01-app/...` before editing. In particular check:
  - `03-api-reference/03-file-conventions/proxy.md`
  - `03-api-reference/03-file-conventions/route.md`
  - `02-guides/upgrading/version-16.md`
- `next.config.ts` declares `serverExternalPackages: ["better-sqlite3"]` — required for the native module. Keep it there.
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
lib/
  db.ts        # SQLite singleton + schema init + seed
  auth.ts      # JWT sign/verify, requireAdmin(), generateBookingId()
  email.ts     # Nodemailer transactional templates (escaped HTML)
proxy.ts       # Next 16 "proxy" (formerly middleware): guards /admin/*
public/
  uploads/                # User-uploaded media (gitignored)
  Final Logo.{jpg,png}    # Brand assets
regal-events.db*          # SQLite data files (gitignored)
```

Path alias: `@/*` → repo root. Prefer `@/lib/db`, `@/components/Navbar`, etc. over relative paths.

## Database (`lib/db.ts`)

- Singleton `Database` opened at `process.cwd()/regal-events.db` with WAL + foreign keys ON.
- `initSchema()` creates tables idempotently (`CREATE TABLE IF NOT EXISTS`).
- `seedData()` inserts the default `admin` user (password from `ADMIN_PASSWORD` or fallback `admin123`) and the 14 baseline categories on first run.
- Schema (keep in sync if you change it):
  - `categories(id, name, slug UNIQUE, description, image, sort_order, created_at)`
  - `bookings(id, booking_id UNIQUE, full_name, phone, email, event_date, category, venue, guests, budget, notes, status DEFAULT 'Pending', admin_notes, created_at, updated_at)`
  - `admins(id, username UNIQUE, password, created_at)` — password is bcrypt hash
  - `gallery(id, title, category, image_path, sort_order, created_at)`
  - `videos(id, title, youtube_url, description, created_at)`
  - `contacts(id, full_name, email, phone, message, created_at)`
- Always import via `import getDb from "@/lib/db"` and call `getDb()` inside the request handler — do **not** hold a reference at module top-level outside this helper.
- DB files (`*.db`, `*.db-shm`, `*.db-wal`) are gitignored. Do not commit them.

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

- Don't commit `.db*` files or anything under `public/uploads`.
- Don't weaken the `esc()` / `header()` discipline in email templates.
- Don't add a `middleware.ts` — use the existing `proxy.ts`.
- Don't move `regal-events.db` away from `process.cwd()` without updating `lib/db.ts` (and double-checking serverless/edge constraints — `better-sqlite3` is Node-only, hence `serverExternalPackages`).
- Don't introduce a second SQLite connection; reuse `getDb()`.
