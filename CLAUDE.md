# CLAUDE.md — Project: bootcamp (Mujertech)

These rules apply to **every** Claude session in this repository. They override any
default behavior. Read them at the start of each session.

---

## Code output

- **When writing or editing a file**, always write the **complete file contents**
  via the Write/Edit tool calls. Never use partial diffs, "// ... rest unchanged"
  placeholders, or snippet-only edits in tool calls — the file on disk must
  always be complete and correct after the call.
- **Do NOT re-dump the file contents in chat.** The user reviews the literal
  code via **/diffity**. Reprinting code blocks in the chat response is noise
  and adds nothing /diffity isn't already showing.
- After making changes, the chat response should contain only:
  1. A brief prose explanation of **what changed and why** (the *why* belongs
     in chat because /diffity shows the code, not the reasoning).
  2. A short **test plan** (concrete steps the user can run to verify).
- Never say "X remains unchanged" or "rest of the file is the same." Either the
  whole file went into a Write/Edit call (because you edited it), or it isn't
  mentioned.
- When pointing at code in prose, use `path:line` references so the user can
  jump directly to the spot.

## Git

- **Never run `git commit`, `git push`, or any git operation that modifies
  history.** The user handles all commits.
- `git init`, `git status`, `git diff`, and other read-only or one-time-setup
  commands are fine when explicitly requested.
- The literal code reaches the user through Write/Edit tool calls and **/diffity**
  — **not** through your chat output. Do not re-print code in chat.
- **DO explain in prose** what was changed and why, and give a short test plan.
  /diffity shows the code; your prose tells the user what to expect and the
  reasoning behind the change.

## Code style

- **No fallback mechanisms** — they hide real failures. If a required env var is
  missing, throw with a clear message. Don't silently default. Don't `||` your way
  out of an undefined.
- **Rewrite existing components** instead of patching when possible. A clean
  rewrite is preferable to layered conditionals.
- **Flag obsolete files explicitly** so the user can remove them. Do not delete
  files yourself unless asked. List paths under a "Files to remove" section in
  your prose.
- **Less code is better than more code.** No premature abstractions, no
  speculative helpers, no defensive validation at internal boundaries.
- **Avoid race conditions at all costs.** Be explicit about ordering. When in
  doubt, sequence operations rather than parallelize them.
- **No `any`.** Strict TypeScript is enforced by both `tsconfig.json`
  (`"strict": true`) and ESLint (`@typescript-eslint/no-explicit-any: 'error'`).
  Use `unknown` + narrowing, generics, or proper types.
- **Comment sparingly.** Only when the *why* is non-obvious. Don't narrate the
  *what* — well-named code already does that.

## Architecture

- **Mobile-first design.** Target older Android devices and variable
  connectivity. Base CSS styles assume small viewports; scale up with
  `min-width` media queries, never `max-width`. Avoid heavy client bundles.
- **Server Components by default.** Add `'use client'` only when the component
  genuinely needs state, effects, browser APIs, or event handlers. If you can
  fetch on the server, do.
- **Server Actions for all writes.** No client-side Supabase mutations. The
  browser Supabase client (`src/lib/supabase/browser.ts`) is for reads and
  auth-state observation only. Writes go through server actions that use the
  server client (`src/lib/supabase/server.ts`).
- **Strict TypeScript, no `any`.** (See Code style above.)
- **Spanish-first UI with English as secondary locale.** All user-facing strings
  go through `next-intl`. Default locale is `es`. URLs are always prefixed
  (`/es/...`, `/en/...`).

---

## Project tech stack (for orientation)

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** in strict mode
- **next-intl 3** (locales: `es` primary, `en` secondary; `localePrefix: 'always'`)
- **CSS Modules** (no Tailwind, no CSS-in-JS)
- **Supabase** via `@supabase/ssr` (server + browser clients in `src/lib/supabase/`)
- **ESLint 9** (flat config) + **Prettier**

## Environment variables

Documented in `.env.example`. Required:

- `NEXT_PUBLIC_SUPABASE_URL` — public, browser-safe
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, browser-safe
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never imported into a Client Component or any file that ships to the browser
- `ADMIN_EMAILS` — comma-separated, server-only

Local dev: copy `.env.example` to `.env.local` and fill in. `.env.local` is
git-ignored.

## Directory layout

```
bootcamp/
├── messages/                 next-intl translation JSON
│   ├── es.json
│   └── en.json
├── src/
│   ├── app/
│   │   ├── globals.css       global reset + base styles
│   │   └── [locale]/
│   │       ├── layout.tsx    locale validation + NextIntlClientProvider
│   │       ├── page.tsx      home (Server Component)
│   │       └── page.module.css
│   ├── i18n/
│   │   ├── routing.ts        locales + defaultLocale config
│   │   └── request.ts        per-request message loader
│   ├── lib/
│   │   └── supabase/
│   │       ├── server.ts     createSupabaseServerClient (async)
│   │       ├── browser.ts    createSupabaseBrowserClient (reads only)
│   │       └── types.ts      Database type (placeholder)
│   └── middleware.ts         next-intl middleware
├── .env.example
├── .gitignore
├── .prettierrc
├── .prettierignore
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Common scripts

```
npm run dev          # local dev server
npm run build        # production build
npm run start        # run production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run format       # Prettier write
npm run format:check # Prettier check
```
