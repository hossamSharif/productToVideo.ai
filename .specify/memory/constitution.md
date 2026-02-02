<!--
  Sync Impact Report
  ===================
  Version change: 1.2.0 → 1.2.1 (PATCH — clarification of existing principle)

  Modified principles:
    - Principle I: Git Discipline — rewritten for clarity and strict
      enforcement. Now explicitly states that every /speckit.implement
      invocation MUST end with a git commit as an automatic, unconditional
      requirement. Added self-check enforcement steps, prohibited behaviors,
      and failure-to-commit severity clause. Updated Development Workflow
      task completion criteria to reinforce commit-before-respond rule.

  Added sections: None
  Removed sections: None

  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ compatible (no changes needed)
    - .specify/templates/spec-template.md — ✅ compatible (no changes needed)
    - .specify/templates/tasks-template.md — ✅ compatible (no changes needed)

  Follow-up TODOs: None
-->

# ProductToVideo.ai Constitution

## Core Principles

### I. Git Discipline (NON-NEGOTIABLE — ZERO EXCEPTIONS)

**THE GOLDEN RULE:** Every `/speckit.implement` invocation MUST end with a
git commit. There is NO scenario where `/speckit.implement` finishes and
the agent does not commit. This is not optional. This is not conditional.
This is an absolute, unbreakable requirement.

**When to commit:**
The agent MUST stage all changes and create a git commit as the FINAL
action of every `/speckit.implement` command — immediately after
implementation is complete and before the agent sends its completion
summary to the user. The commit is part of the implementation, not a
separate step. An implementation without a commit is an INCOMPLETE
implementation.

**What triggers a commit:**
- `/speckit.implement` completes a full phase → commit ALL changes
- `/speckit.implement` completes a partial phase (user-scoped, e.g.,
  `phase1`) → commit ALL changes from that scope
- `/speckit.implement` completes one or more tasks → commit ALL changes
- If the agent runs out of context or hits a limit mid-implementation,
  it MUST commit whatever work is done so far before stopping

**The agent MUST NEVER:**
- Respond to the user that implementation is done without having committed
- Say "done" or "complete" or show a summary table without committing first
- Skip the commit because "the user didn't ask" — the commit is automatic
- Defer the commit to a later message or a follow-up command
- Wait for the user to request a commit — the constitution requires it
- Treat the commit as optional or as something the user must trigger

**Enforcement — self-check before responding:**
Before sending ANY completion message after `/speckit.implement`, the
agent MUST verify:
1. `git status` shows no unstaged implementation changes
2. `git log -1 --oneline` shows a NEW commit from this session
If either check fails, the agent MUST commit before responding.

**Commit format** — Conventional Commits strictly enforced:

```
<type>(<scope>): <short summary in imperative mood>

<optional body — what changed and why, wrapped at 72 chars>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Allowed types:** `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`

**Required scopes:**
`landing`, `auth`, `dashboard`, `editor`, `videos`, `bulk`, `settings`,
`scraper`, `ai`, `remotion`, `stripe`, `i18n`, `theme`, `db`, `api`, `ui`

**Commit message rules:**
- Summary line MUST be under 72 characters.
- MUST use imperative mood ("add login form" not "added login form").
- Summary MUST describe WHAT was done, not HOW.
- Body MUST reference which phase and task IDs were completed
  (e.g., `Completes Phase 1: Setup (T001-T008)`).
- If the task maps to a spec requirement, reference it in the body
  (e.g., `Implements FR-013, FR-014`).
- If the task maps to a user story, reference it in the body
  (e.g., `Part of User Story 1 — Single Video Generation`).
- Never commit broken code. If something is incomplete, finish it first or
  mark it with a TODO comment and note that in the commit body.
- Each commit MUST be atomic — one logical change per commit. If a single
  task touches multiple unrelated areas, split into multiple commits.
- Multiple atomic commits per `/speckit.implement` run are allowed and
  encouraged when the work spans distinct logical changes (e.g., one
  commit for docs, one for setup, one for feature code).

**Failure to commit is a constitution violation.** The agent must treat
a missing commit with the same severity as shipping broken code.

### II. Design Quality (NON-NEGOTIABLE)

Before writing any frontend code — any page, component, section, modal,
form, or visual element — the agent MUST first read the skill file at
`/mnt/skills/public/frontend-design/SKILL.md` and apply its guidelines.
Every UI element MUST match the design system defined in the technical plan
exactly: correct colors, fonts, spacing, border radii, animations, and
component patterns. No generic or default styling is acceptable. The brand
identity is the source of truth.

### III. RTL-First Layout (NON-NEGOTIABLE)

Never use hard-coded directional CSS properties. The following are
**prohibited** in any component:

- `margin-left`, `margin-right`, `padding-left`, `padding-right`
- `text-align: left`, `text-align: right`
- `left`, `right`, `float: left`, `float: right`

MUST use CSS logical properties instead:
`margin-inline-start`, `margin-inline-end`, `padding-inline-start`,
`padding-inline-end`, `inset-inline-start`, `inset-inline-end`, or
their Tailwind equivalents (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).

This ensures Arabic RTL layout works automatically without separate
code paths.

### IV. TypeScript Strict Mode (NON-NEGOTIABLE)

All code MUST be written in TypeScript with strict mode enabled. No `any`
types except when interfacing with untyped third-party libraries, and even
then they MUST be wrapped in properly typed utility functions. All component
props MUST have explicit interfaces. All API request and response shapes
MUST be typed. All Supabase queries MUST use generated types from
`supabase gen types`.

### V. Component Architecture

- Every component MUST be a named export with a descriptive filename in
  kebab-case.
- Server Components by default. Only add `'use client'` when the component
  genuinely needs browser APIs, event handlers, hooks, or client-side state.
- No business logic inside components. Extract logic into hooks (`/hooks/`)
  or utility functions (`/lib/`).
- All text visible to users MUST come from `next-intl` translation files —
  never hard-code user-facing strings in components.

### VI. Accessibility Baseline

- All interactive elements MUST be keyboard navigable.
- All images MUST have `alt` attributes (use translated alt text from
  i18n files).
- All form inputs MUST have associated labels.
- Color contrast MUST meet WCAG AA minimum (4.5:1 for normal text).
- MUST use semantic HTML elements (`nav`, `main`, `header`, `footer`,
  `section`, `article`, `aside`, `button`) — not `div` with `onClick`.

### VII. Error Handling

- Never swallow errors silently. Every `try/catch` MUST either handle
  the error meaningfully (show user feedback, retry, fallback) or re-throw.
- All API routes MUST return consistent error response shapes:
  `{ error: string, code: string }`.
- All user-facing errors MUST be translatable (keyed in i18n files, not
  hard-coded English strings).

### VIII. Environment Safety

- Never commit `.env` files or secrets to git.
- All secret values MUST come from environment variables.
- `.env.local` and `.env` MUST be in `.gitignore` from the very first
  commit.
- A `.env.example` file MUST list all required variables with placeholder
  values.

### IX. Supabase Tooling Strategy (NON-NEGOTIABLE)

When performing ANY operation that involves Supabase — database schema
changes, SQL queries, authentication configuration, storage bucket
management, RLS policies, type generation, project configuration, edge
functions, logs, or debugging — the agent MUST follow this strict tool
priority:

**Priority 1 — Supabase MCP Tools (always try first):**
Before executing any Supabase-related task, the agent MUST first check
whether Supabase MCP tools are available in the current environment. If
MCP tools are available, the agent MUST use them for the operation. The
agent MUST NEVER write raw SQL files manually or run shell commands for
tasks that an MCP tool can handle.

**Priority 2 — Supabase CLI (fallback only when MCP is unavailable):**
If the agent attempts to use a Supabase MCP tool and receives an error
indicating the tool is not available, not connected, or the MCP server
is unreachable, THEN and ONLY THEN the agent falls back to the equivalent
Supabase CLI command. The agent MUST explicitly state to the user:
"Supabase MCP tools are not available. Falling back to Supabase CLI."
before switching.

**Priority 3 — Manual file creation (last resort):**
If both MCP and CLI are unavailable (e.g., CLI is not installed), the
agent may create SQL migration files and configuration files manually,
but MUST warn the user that these files need to be applied manually and
MUST include instructions for how to apply them.

### X. Context7 Documentation-First Development (NON-NEGOTIABLE)

The agent MUST use Context7 MCP tools to fetch up-to-date,
version-specific documentation BEFORE writing any code that uses a
library, framework, or package API. The agent MUST NEVER rely solely on
its training data for library-specific code. Training data goes stale —
Context7 does not.

**The core principle: Look it up, then write it.**

## Context7 MCP Tools

Context7 provides exactly two tools. The agent MUST understand both and
use them correctly:

### Tool 1: `resolve-library-id`

Resolves a human-readable library name into a Context7-compatible
library ID.

| Parameter | Required | Description |
|---|---|---|
| `query` | Yes | The user's question or task — used to rank results by relevance |
| `libraryName` | Yes | The name of the library to search for |

**Returns**: A list of matching libraries with their Context7-compatible
IDs in `/org/project` format.

### Tool 2: `query-docs`

Fetches actual documentation and code examples for a specific library.

| Parameter | Required | Description |
|---|---|---|
| `libraryId` | Yes | Exact Context7-compatible library ID (e.g., `/vercel/next.js`) |
| `query` | Yes | Specific question or task — be descriptive, not generic |
| `topic` | No | Narrow the search to a specific topic (e.g., `"routing"`, `"authentication"`, `"hooks"`) |
| `tokens` | No | Max tokens to return (default: 5000, minimum: 1000) |

**Returns**: Relevant documentation snippets and code examples from the
library's official docs.

## Required Workflow — Two-Step Lookup

Every Context7 interaction MUST follow this sequence:

**Step 1 — Resolve the library ID** (skip if ID is known from the
pre-mapped registry below):
```
resolve-library-id(
  query: "How to create server-side middleware with JWT auth",
  libraryName: "next.js"
)
```

**Step 2 — Query the docs with the resolved ID**:
```
query-docs(
  libraryId: "/vercel/next.js",
  query: "How to create middleware that checks JWT token in cookies
    and redirects unauthenticated users",
  topic: "middleware"
)
```

The agent MUST NEVER call `query-docs` without first having a valid
Context7-compatible library ID — either resolved via
`resolve-library-id` or known from the pre-mapped registry below.

## Pre-Mapped Library Registry

To save `resolve-library-id` calls and avoid wasting the 3-call-per-
question rate limit, the following Context7 library IDs are pre-mapped
for this project's tech stack. The agent MUST use these IDs directly
with `query-docs` when working with these libraries, skipping the
resolve step:

| Library | Context7 ID | Use When |
|---|---|---|
| Next.js | `/vercel/next.js` | App Router, API routes, middleware, server components, layouts, routing, `next/font`, `next/image` |
| React | `/facebook/react` | Hooks, components, state management, context, refs, effects |
| Supabase JS Client | `/supabase/supabase` | Auth, database queries, storage, realtime, RLS client-side |
| Supabase SSR | `/supabase/auth-helpers` | Server-side auth in Next.js, middleware session refresh — if not found, query `/supabase/supabase` with topic `"ssr"` |
| Tailwind CSS | `/tailwindlabs/tailwindcss` | Utility classes, configuration, dark mode, responsive design, custom themes |
| shadcn/ui | `/shadcn-ui/ui` | Component usage, installation, theming, customization — if not found, resolve with `libraryName: "shadcn ui"` |
| Remotion | `/remotion-dev/remotion` | Video composition, Player component, rendering, Lambda, sequences, timing — if not found, resolve with `libraryName: "remotion"` |
| Stripe | `/stripe/stripe-node` | Checkout, subscriptions, webhooks, customer portal, payment intents |
| Framer Motion | `/framer/motion` | Animations, variants, gestures, layout animations, exit animations — if not found, resolve with `libraryName: "framer motion"` |
| next-intl | `/amannn/next-intl` | i18n setup, useTranslations, middleware locale detection, server components — if not found, resolve with `libraryName: "next-intl"` |
| next-themes | `/pacocoursey/next-themes` | Theme provider, useTheme hook, class strategy — if not found, resolve with `libraryName: "next-themes"` |
| Anthropic SDK | `/anthropics/anthropic-sdk-node` | Claude API calls, message creation, streaming — if not found, resolve with `libraryName: "anthropic sdk"` |
| Puppeteer | `/puppeteer/puppeteer` | Headless browser, page navigation, DOM queries, screenshots |
| Resend | `/resend/resend-node` | Transactional email, React Email templates — if not found, resolve with `libraryName: "resend"` |
| Zod | `/colinhacks/zod` | Schema validation, type inference, form validation |
| React Hook Form | `/react-hook-form/react-hook-form` | Form state, validation integration with Zod |
| TypeScript | `/microsoft/typescript` | Type utilities, generics, advanced patterns — use sparingly, only for non-obvious TS features |

**If a library ID from this table fails** (returns empty or error), the
agent MUST fall back to `resolve-library-id` with the library name to
get the current valid ID. Library IDs can change over time.

**If a library is NOT in this table**, the agent MUST always call
`resolve-library-id` first to discover the correct ID before querying
docs.

## Mandatory Trigger Conditions (Context7)

The agent MUST use Context7 in ALL of the following situations. No
exceptions:

### Trigger 1: First Use of Any Library in a Task

The FIRST time the agent writes code that imports or uses any library in
a given `/speckit.implement` task, it MUST query Context7 for that
library before writing the code. This applies even if the agent has used
the library in a previous task — each implement task starts fresh.

### Trigger 2: Unfamiliar or Advanced API Usage

Whenever the agent needs to use a library API that is:
- Complex (multi-step setup, configuration objects with many options)
- Recently changed (features known to evolve frequently: Next.js App
  Router, Supabase Auth, Remotion rendering)
- Used in a non-trivial way (custom configurations, advanced patterns,
  edge cases)

The agent MUST query Context7 for the specific API before writing code.

### Trigger 3: Integration Between Two Libraries

Whenever the agent writes code that integrates two or more libraries
together (e.g., Supabase Auth with Next.js middleware, Remotion Player
in a Next.js page, Stripe webhooks with Supabase), the agent MUST query
Context7 for at least the primary library's integration docs.

### Trigger 4: Error or Unexpected Behavior

If the agent's code produces an error, fails to compile, or behaves
unexpectedly, and the issue involves a library API, the agent MUST query
Context7 for the correct API usage before attempting a fix. The agent
MUST NOT guess at fixes based on training data.

### Trigger 5: Configuration and Setup Files

When creating or modifying configuration files for any library
(`next.config.js`, `tailwind.config.ts`, `remotion.config.ts`, Supabase
config, etc.), the agent MUST query Context7 for the current
configuration schema and options.

## Query Writing Best Practices (Context7)

The quality of Context7 results depends entirely on the quality of the
query. The agent MUST follow these rules:

### Be Specific — Never Generic

| Bad Query | Good Query |
|---|---|
| `"auth"` | `"How to sign in with email and password using Supabase Auth in Next.js App Router"` |
| `"hooks"` | `"React useEffect cleanup function for subscriptions with dependency array"` |
| `"routing"` | `"Next.js 15 App Router dynamic route segments with generateStaticParams"` |
| `"animation"` | `"Framer Motion staggerChildren variant for list item entrance animation"` |
| `"video"` | `"Remotion Player component props for live preview with input controls in React"` |

### Use the `topic` Parameter

Always include the `topic` parameter when querying docs for a specific
feature area. This dramatically improves result relevance:

| Library | Common Topics |
|---|---|
| Next.js | `"app-router"`, `"middleware"`, `"server-components"`, `"api-routes"`, `"fonts"`, `"images"`, `"metadata"` |
| Supabase | `"authentication"`, `"database"`, `"storage"`, `"rls"`, `"realtime"`, `"edge-functions"`, `"ssr"` |
| Remotion | `"player"`, `"lambda"`, `"compositions"`, `"sequences"`, `"rendering"`, `"audio"` |
| Stripe | `"checkout"`, `"webhooks"`, `"subscriptions"`, `"customer-portal"`, `"pricing"` |
| Tailwind | `"dark-mode"`, `"responsive"`, `"configuration"`, `"rtl"`, `"custom-theme"` |
| shadcn/ui | `"accordion"`, `"dialog"`, `"sheet"`, `"toast"`, `"form"`, `"theming"` |
| Framer Motion | `"variants"`, `"layout-animation"`, `"exit-animation"`, `"gestures"`, `"scroll"` |
| next-intl | `"middleware"`, `"server-components"`, `"client-components"`, `"routing"` |

### Request Adequate Tokens

- For simple API lookups: `tokens: 3000` (default is fine)
- For setup guides or multi-step configurations: `tokens: 8000`
- For complex integrations: `tokens: 10000`

## Rate Limit Rules (Context7)

Context7 enforces a limit of **3 calls per tool per question**. The
agent MUST respect this:

- Maximum **3 calls** to `resolve-library-id` per task.
- Maximum **3 calls** to `query-docs` per task.
- If the agent cannot find what it needs after 3 calls to either tool,
  it MUST proceed with the best information it has and note in a code
  comment: `// TODO: Verify against latest docs — Context7 lookup
  limit reached`.
- To maximize effectiveness within the limit, the agent MUST use the
  pre-mapped library IDs from the registry above (saving
  `resolve-library-id` calls) and write highly specific queries
  (getting the right answer in fewer `query-docs` calls).

## Context7 Availability Detection

At the START of the first task that requires library documentation, the
agent MUST check Context7 availability:

1. Attempt a simple
   `resolve-library-id(query: "test", libraryName: "react")`.
2. If it succeeds, Context7 is available. Use it for all library
   lookups in this session.
3. If it fails, state: "Context7 MCP is not available. Falling back to
   training knowledge. Code may reference outdated APIs — please verify
   against official docs after implementation." Then proceed without
   Context7 but add `// VERIFY: Written without Context7 — check
   official docs` comments on any non-trivial library usage.

The agent MUST NOT silently skip Context7. Every fallback MUST be
announced.

## What Context7 is NOT For

Do NOT use Context7 for:
- **General programming concepts**: loops, conditionals, data
  structures, algorithms. The agent knows these.
- **Project-specific code**: business logic, custom utilities,
  application architecture. Context7 only has library docs.
- **Supabase schema operations**: Use Supabase MCP tools for database
  operations (see Principle IX). Context7 is for learning how to use
  the Supabase JS client API, not for executing database commands.
- **Trivial API calls**: If the usage is extremely common and simple
  (e.g., `useState`, `console.log`, `JSON.parse`), do not waste a
  Context7 call.

## Prohibited Practices (Context7)

- NEVER write library-specific code from memory alone when Context7 is
  available. Always verify.
- NEVER call `query-docs` without a valid library ID. Always resolve
  first or use the pre-mapped registry.
- NEVER use generic single-word queries like `"auth"`, `"forms"`,
  `"video"`. Always be specific.
- NEVER exceed 3 calls per tool per question. Plan queries carefully.
- NEVER assume a library API works the same way it did in a previous
  version. Context7 exists precisely because APIs change.
- NEVER include sensitive information (API keys, passwords, credentials,
  personal data) in Context7 queries.
- NEVER skip Context7 and claim "I already know this" — the agent's
  training data may be outdated. Look it up.

## MCP-to-CLI Fallback Mapping

The agent MUST use the correct tool for each operation. Below is the
definitive mapping. The MCP tool column is the preferred method. The CLI
column is the fallback.

### Database Schema (DDL — CREATE, ALTER, DROP)

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Create table / alter schema / add columns / create indexes | `apply_migration` (pass the DDL SQL) | `supabase migration new <name>` then write SQL into the generated file, then `supabase db push` |
| View existing tables and their columns | `list_tables` | `supabase db dump --schema public` or `supabase inspect db table-sizes` |
| List all applied migrations | `list_migrations` | `supabase migration list` |
| List installed extensions | `list_extensions` | `supabase inspect db extensions` |

**Rules for schema changes:**
- ALL schema changes (CREATE TABLE, ALTER TABLE, ADD COLUMN, CREATE INDEX,
  CREATE POLICY, etc.) MUST go through `apply_migration` (MCP) or
  `supabase migration new` + `supabase db push` (CLI). The agent MUST
  NEVER execute DDL directly via `execute_sql` — that tool is only for
  non-schema queries.
- Every migration MUST have a descriptive name:
  `create_users_table`, `add_stripe_customer_id_to_subscriptions`,
  `create_rls_policies_for_video_projects`.
- Migrations are irreversible in production. The agent MUST always include
  a comment at the top of each migration SQL describing what it does.

### Database Queries (DML — SELECT, INSERT, UPDATE, DELETE)

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Run SELECT queries / inspect data | `execute_sql` | `supabase db execute --sql "SELECT ..."` or connect via `psql` |
| Insert seed data | `execute_sql` | `supabase db execute --sql "INSERT ..."` or create a `supabase/seed.sql` file and run `supabase db reset` |
| Debug data issues | `execute_sql` + `get_logs` | `supabase db execute` + `supabase functions logs` |

### Row Level Security (RLS)

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Create RLS policies | `apply_migration` (include CREATE POLICY in migration SQL) | `supabase migration new add_rls_<table>` then write policy SQL, then `supabase db push` |
| Enable RLS on a table | `apply_migration` (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) | Same as above — include in migration file |
| Verify RLS policies | `execute_sql` (`SELECT * FROM pg_policies`) | `supabase db execute --sql "SELECT * FROM pg_policies WHERE tablename = '...'"` |

**RLS rules:**
- RLS MUST be enabled on EVERY table that stores user data. No exceptions.
- Every table MUST have at minimum a SELECT policy restricted to
  `auth.uid() = user_id`.
- The agent MUST verify RLS is active after creating tables by querying
  `pg_policies`.

### TypeScript Type Generation

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Generate types from schema | `generate_typescript_types` | `supabase gen types typescript --local > src/types/supabase.ts` (local) or `supabase gen types typescript --project-id <ref> > src/types/supabase.ts` (remote) |

**Type generation rules:**
- Types MUST be regenerated after EVERY migration that changes the schema.
- The generated types file MUST live at `src/types/supabase.ts`.
- All Supabase client queries MUST use these generated types. Never use
  `any` for Supabase query results.

### Authentication Configuration

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Check auth configuration | `get_project_url` + `get_anon_key` | `supabase status` |
| View auth settings | `execute_sql` (query `auth.users` for testing) | `supabase inspect db auth-users` or check via Dashboard |

**Auth rules:**
- Google OAuth provider configuration (client ID, secret, redirect URL)
  MUST be done via the Supabase Dashboard manually — neither MCP nor CLI
  can configure OAuth providers programmatically. The agent MUST instruct
  the user to configure this in the dashboard and provide step-by-step
  instructions.
- For local development, use `supabase start` which starts a local
  Supabase instance with auth pre-configured. The local auth endpoint is
  `http://localhost:54321/auth/v1`.

### Storage

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Configure storage buckets | `execute_sql` (insert into `storage.buckets`) | Create migration with SQL: `INSERT INTO storage.buckets (id, name, public) VALUES (...)` or configure via Dashboard |
| Set storage policies | `apply_migration` (CREATE POLICY on `storage.objects`) | Include storage policies in migration file |

### Edge Functions

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| List edge functions | `list_edge_functions` | `supabase functions list` |
| Deploy edge function | `deploy_edge_function` | `supabase functions deploy <name>` |
| View function logs | `get_logs` (service: `edge_functions`) | `supabase functions logs <name>` |

### Project and Debugging

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Get project URL and keys | `get_project_url` + `get_anon_key` | `supabase status` |
| View API/auth/postgres logs | `get_logs` | `supabase logs` or `supabase inspect db` commands |
| Check for performance issues | `get_advisors` | `supabase inspect db index-usage`, `supabase inspect db table-sizes`, `supabase inspect db unused-indexes` |
| Search Supabase docs for guidance | `search_docs` | Open `https://supabase.com/docs` manually |

## MCP Availability Detection

At the START of any task that involves Supabase, the agent MUST perform
the following check:

1. Attempt to call `list_tables` (a lightweight read-only MCP tool).
2. If the call succeeds, MCP is available. Use MCP tools for all Supabase
   operations in this task.
3. If the call fails with a connection error, tool-not-found error, or
   timeout, MCP is not available. State: "Supabase MCP tools are not
   available in this environment. Falling back to Supabase CLI." Then
   verify CLI availability by running `supabase --version`.
4. If CLI is also not available, state: "Neither Supabase MCP nor CLI
   are available. Creating migration files manually. You will need to
   apply them with `supabase db push` after installing the CLI." Then
   create the SQL files in `supabase/migrations/` with proper timestamped
   filenames.

The agent MUST NOT silently switch between tools. Every fallback MUST be
explicitly announced.

## Local Development Workflow (Supabase)

For local development, the agent assumes the developer is running:
```
supabase start
```
This provides a local Supabase instance at `http://localhost:54321` with:
- Local MCP endpoint at `http://localhost:54321/mcp`
- Local auth at `http://localhost:54321/auth/v1`
- Local REST API at `http://localhost:54321/rest/v1`
- Local Studio dashboard at `http://localhost:54323`

The agent MUST use the local instance for all development and testing.
The agent MUST NEVER execute mutations against a production Supabase
project unless the user explicitly confirms the project ref and the agent
warns about production impact.

## Migration File Discipline

Whether using MCP `apply_migration` or CLI `supabase migration new`:

- Every migration file MUST have a timestamped filename (auto-generated
  by CLI or MCP).
- Every migration MUST contain a SQL comment block at the top:
  ```sql
  -- Migration: <descriptive name>
  -- Description: <what this migration does>
  -- Spec References: <FR-XXX numbers if applicable>
  -- Date: <ISO date>
  ```
- Migrations MUST be atomic: one logical change per migration. Do not
  combine table creation with RLS policies with seed data in one
  migration. Split them.
- After every migration, the agent MUST regenerate TypeScript types
  (via MCP `generate_typescript_types` or CLI `supabase gen types`).
- After every migration, the agent MUST verify it applied successfully
  by listing tables or querying the schema.

## Prohibited Practices (Supabase)

- NEVER use the Supabase Dashboard UI for schema changes if MCP or CLI
  are available. Dashboard changes are not tracked in migrations and will
  cause drift.
- NEVER hard-code Supabase URLs or keys in source code. Always use
  environment variables: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- NEVER use the `service_role` key in client-side code. It bypasses RLS.
  It is only for server-side API routes and background jobs.
- NEVER use `execute_sql` (MCP) or `supabase db execute` (CLI) for
  schema changes. Always use `apply_migration` or
  `supabase migration new` so changes are tracked.
- NEVER skip RLS. Every new table with user data MUST have RLS enabled
  and at least one policy in the same migration or immediately following
  migration.
- NEVER assume MCP is available. Always check first using the detection
  flow above.

## Development Constraints

**Technology stack:**
- Next.js (App Router) with TypeScript strict mode
- Supabase (auth, database, storage)
- Remotion (video rendering)
- Stripe (payments)
- next-intl (i18n with Arabic RTL support)
- next-themes (dark/light mode)
- Tailwind CSS with logical property utilities

**Internationalization:** All user-facing strings MUST be extracted to
`next-intl` translation files. Components MUST NOT contain hard-coded
text in any language.

**Styling:** Tailwind CSS only. No inline styles. No CSS modules unless
justified. All spacing, color, and typography MUST use design system tokens.

## Development Workflow

**Task completion criteria — ALL must be met before responding to user:**
1. All files for the task are created or modified.
2. Code compiles without errors and has no broken imports.
3. All user-facing strings use i18n keys.
4. RTL logical properties used exclusively for layout.
5. TypeScript strict mode passes with no `any` leaks.
6. Context7 consulted for all library API usage per Principle X.
7. **Git commit created per Principle I.** This is the LAST step. The
   agent MUST NOT send a completion response to the user until the commit
   exists. A task without a commit is NOT complete — period.

**Code review gates:**
- Constitution compliance verified on every PR.
- No `any` types without justification.
- No hard-coded directional CSS.
- No hard-coded user-facing strings.
- Semantic HTML and keyboard navigation verified.

## Governance

This constitution supersedes all other development practices for the
ProductToVideo.ai project. Amendments require:

1. Documentation of the proposed change with rationale.
2. Version bump following semantic versioning:
   - MAJOR: Principle removal or backward-incompatible redefinition.
   - MINOR: New principle added or existing principle materially expanded.
   - PATCH: Clarifications, wording fixes, non-semantic refinements.
3. Update of all dependent templates if affected.
4. A sync impact report appended to the amended constitution.

**Compliance:** All PRs and code reviews MUST verify compliance with
these principles. Violations MUST be corrected before merge. Complexity
beyond what is described here MUST be justified in the plan's Complexity
Tracking table.

**Version**: 1.2.1 | **Ratified**: 2026-02-02 | **Last Amended**: 2026-02-02
