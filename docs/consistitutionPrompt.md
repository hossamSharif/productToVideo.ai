# /speckit.constitution Prompt for ProductToVideo.ai

> Copy everything below this line and paste it after the `/speckit.constitution` command

---

## Git Discipline (NON-NEGOTIABLE)

After every `/speckit.implement` command that completes successfully — meaning all files for that task are created or modified, the code compiles without errors, and no broken imports or syntax issues remain — the agent MUST immediately stage all changes and create a git commit BEFORE moving on to the next task or responding that the task is complete. This is not optional. No task is considered "done" until its commit exists in the git history.

**Commit message format** — follow Conventional Commits strictly:

```
<type>(<scope>): <short summary in imperative mood>

<optional body — what changed and why, wrapped at 72 chars>
```

**Allowed types:**
- `feat` — new feature or functionality (maps to a user story or FR)
- `fix` — bug fix
- `refactor` — code restructuring without behavior change
- `style` — design, CSS, UI-only changes with no logic change
- `chore` — tooling, config, dependencies, build setup
- `docs` — documentation only
- `test` — adding or updating tests

**Scope** — always include a scope matching the area of the codebase:
- `landing` — marketing landing page components
- `auth` — authentication (login, signup, Google OAuth, reset)
- `dashboard` — dashboard layout, sidebar, top bar
- `editor` — video editor, preview player, editing panels
- `videos` — my videos page, video card, video management
- `bulk` — bulk generation page and flow
- `settings` — account settings, profile, billing
- `scraper` — product URL extraction
- `ai` — script generation, AI integration
- `remotion` — video templates, compositions, rendering
- `stripe` — payments, subscriptions, webhooks
- `i18n` — translations, locale switching, RTL
- `theme` — dark/light mode, theme toggle
- `db` — database schema, migrations, RLS policies
- `api` — API routes not covered by other scopes
- `ui` — shared UI components, design system tokens

**Commit message rules:**
- Summary line must be under 72 characters.
- Use imperative mood: "add login form" not "added login form" or "adds login form."
- The summary must describe WHAT was done, not HOW.
- If the task maps to a spec requirement, reference it in the body: `Implements FR-013, FR-014`.
- If the task maps to a user story, reference it in the body: `Part of User Story 1 — Single Video Generation`.
- Never commit broken code. If something is incomplete, finish it first or explicitly mark it with a TODO comment and note that in the commit body.
- Each commit should be atomic — one logical change per commit. If a single `/speckit.implement` task touches multiple unrelated areas, split into multiple commits.

**Examples of good commit messages:**

```
feat(landing): add hero section with animated headline and CTAs

Implements FR-001. Hero includes primary CTA linking to signup,
secondary CTA smooth-scrolling to showcase section, and platform
trust indicators.
```

```
feat(auth): add Google OAuth sign-in with Supabase provider

Configures Supabase Google OAuth provider. Adds "Continue with
Google" button on login and signup pages with proper redirect
handling.

Implements FR-006, FR-009.
```

```
feat(editor): add live video preview with Remotion Player

Integrates @remotion/player in split-screen editor layout.
Preview updates within 2 seconds on prop changes.

Implements FR-020, FR-021. Part of User Story 1.
```

```
chore(db): add initial Supabase migration for core tables

Creates users, subscriptions, video_projects, rendered_videos,
bulk_jobs tables with RLS policies.
```

```
style(theme): implement dark and light mode CSS variables

Defines full color token system in globals.css matching the
approved design system. Integrates next-themes with class strategy.

Implements FR-051, FR-052, FR-053.
```

## Design Quality (NON-NEGOTIABLE)

Before writing any frontend code — any page, component, section, modal, form, or visual element — the agent MUST first read the skill file at `/mnt/skills/public/frontend-design/SKILL.md` and apply its guidelines. Every UI element must match the design system defined in the technical plan exactly: correct colors, fonts, spacing, border radii, animations, and component patterns. No generic or default styling is acceptable. The brand identity is the source of truth.

## RTL-First Layout (NON-NEGOTIABLE)

Never use hard-coded directional CSS properties. No `margin-left`, `margin-right`, `padding-left`, `padding-right`, `text-align: left`, `text-align: right`, `left`, `right`, `float: left`, or `float: right` in any component. Always use CSS logical properties: `margin-inline-start`, `margin-inline-end`, `padding-inline-start`, `padding-inline-end`, `inset-inline-start`, `inset-inline-end`, or their Tailwind equivalents (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`). This ensures Arabic RTL layout works automatically without separate code paths.

## TypeScript Strict Mode (NON-NEGOTIABLE)

All code must be written in TypeScript with strict mode enabled. No `any` types except when interfacing with untyped third-party libraries, and even then wrap them in properly typed utility functions. All component props must have explicit interfaces. All API request and response shapes must be typed. All Supabase queries must use generated types from `supabase gen types`.

## Component Architecture

- Every component must be a named export with a descriptive filename in kebab-case.
- Server Components by default. Only add `'use client'` when the component genuinely needs browser APIs, event handlers, hooks, or client-side state.
- No business logic inside components. Extract logic into hooks (`/hooks/`) or utility functions (`/lib/`).
- All text visible to users must come from `next-intl` translation files — never hard-code user-facing strings in components.

## Accessibility Baseline

- All interactive elements must be keyboard navigable.
- All images must have `alt` attributes (use translated alt text from i18n files).
- All form inputs must have associated labels.
- Color contrast must meet WCAG AA minimum (4.5:1 for normal text).
- Use semantic HTML elements (`nav`, `main`, `header`, `footer`, `section`, `article`, `aside`, `button`) — not `div` with `onClick`.

## Error Handling

- Never swallow errors silently. Every `try/catch` must either handle the error meaningfully (show user feedback, retry, fallback) or re-throw.
- All API routes must return consistent error response shapes: `{ error: string, code: string }`.
- All user-facing errors must be translatable (keyed in i18n files, not hard-coded English strings).

## Environment Safety

- Never commit `.env` files or secrets to git.
- All secret values must come from environment variables.
- Add `.env.local` and `.env` to `.gitignore` from the very first commit.
- Provide a `.env.example` file listing all required variables with placeholder values.