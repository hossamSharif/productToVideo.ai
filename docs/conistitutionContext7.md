# /speckit.constitution — Context7 MCP Documentation-First Addendum

> Append everything below this line to your existing constitution, or paste it as a follow-up `/speckit.constitution` update prompt

---

## Context7 Documentation-First Development (NON-NEGOTIABLE)

The agent MUST use Context7 MCP tools to fetch up-to-date, version-specific documentation BEFORE writing any code that uses a library, framework, or package API. The agent must NEVER rely solely on its training data for library-specific code. Training data goes stale — Context7 does not.

**The core principle: Look it up, then write it.**

---

## Context7 MCP Tools

Context7 provides exactly two tools. The agent must understand both and use them correctly:

### Tool 1: `resolve-library-id`

Resolves a human-readable library name into a Context7-compatible library ID.

| Parameter | Required | Description |
|---|---|---|
| `query` | Yes | The user's question or task — used to rank results by relevance |
| `libraryName` | Yes | The name of the library to search for |

**Returns**: A list of matching libraries with their Context7-compatible IDs in `/org/project` format.

### Tool 2: `query-docs`

Fetches actual documentation and code examples for a specific library.

| Parameter | Required | Description |
|---|---|---|
| `libraryId` | Yes | Exact Context7-compatible library ID (e.g., `/vercel/next.js`) |
| `query` | Yes | Specific question or task — be descriptive, not generic |
| `topic` | No | Narrow the search to a specific topic (e.g., `"routing"`, `"authentication"`, `"hooks"`) |
| `tokens` | No | Max tokens to return (default: 5000, minimum: 1000) |

**Returns**: Relevant documentation snippets and code examples from the library's official docs.

---

## Required Workflow — Two-Step Lookup

Every Context7 interaction MUST follow this sequence:

**Step 1 — Resolve the library ID** (skip if you already know the ID from the registry below):
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
  query: "How to create middleware that checks JWT token in cookies and redirects unauthenticated users",
  topic: "middleware"
)
```

**IMPORTANT**: The agent must NEVER call `query-docs` without first having a valid Context7-compatible library ID — either resolved via `resolve-library-id` or known from the pre-mapped registry below.

---

## Pre-Mapped Library Registry for This Project

To save `resolve-library-id` calls and avoid wasting the 3-call-per-question rate limit, the following Context7 library IDs are pre-mapped for this project's tech stack. The agent SHOULD use these IDs directly with `query-docs` when working with these libraries, skipping the resolve step:

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

**If a library ID from this table fails** (returns empty or error), the agent must fall back to `resolve-library-id` with the library name to get the current valid ID. Library IDs can change over time.

**If a library is NOT in this table**, the agent must always call `resolve-library-id` first to discover the correct ID before querying docs.

---

## Mandatory Trigger Conditions

The agent MUST use Context7 in ALL of the following situations. No exceptions:

### Trigger 1: First Use of Any Library in a Task

The FIRST time the agent writes code that imports or uses any library in a given `/speckit.implement` task, it MUST query Context7 for that library before writing the code. This applies even if the agent has used the library in a previous task — each implement task starts fresh.

**Example**: Task is "Create the login form with Supabase Auth"
→ Agent MUST call `query-docs("/supabase/supabase", "email password sign in with supabase auth in next.js", topic: "authentication")` BEFORE writing the login form code.

### Trigger 2: Unfamiliar or Advanced API Usage

Whenever the agent needs to use a library API that is:
- Complex (multi-step setup, configuration objects with many options)
- Recently changed (features known to evolve frequently: Next.js App Router, Supabase Auth, Remotion rendering)
- Used in a non-trivial way (custom configurations, advanced patterns, edge cases)

The agent MUST query Context7 for the specific API before writing code.

**Example**: Setting up Remotion Lambda rendering
→ Agent MUST call `query-docs("/remotion-dev/remotion", "how to set up remotion lambda for server-side video rendering", topic: "lambda")` BEFORE writing the rendering API route.

### Trigger 3: Integration Between Two Libraries

Whenever the agent writes code that integrates two or more libraries together (e.g., Supabase Auth with Next.js middleware, Remotion Player in a Next.js page, Stripe webhooks with Supabase), the agent MUST query Context7 for at least the primary library's integration docs.

**Example**: Integrating Stripe webhooks with Next.js API routes
→ Agent MUST call `query-docs("/stripe/stripe-node", "handle stripe webhooks in next.js api route app router", topic: "webhooks")`

### Trigger 4: Error or Unexpected Behavior

If the agent's code produces an error, fails to compile, or behaves unexpectedly, and the issue involves a library API, the agent MUST query Context7 for the correct API usage before attempting a fix. Do NOT guess at fixes based on training data.

### Trigger 5: Configuration and Setup Files

When creating or modifying configuration files for any library (`next.config.js`, `tailwind.config.ts`, `remotion.config.ts`, Supabase config, etc.), the agent MUST query Context7 for the current configuration schema and options.

---

## Query Writing Best Practices (NON-NEGOTIABLE)

The quality of Context7 results depends entirely on the quality of the query. The agent MUST follow these rules:

### Be Specific — Never Generic

| ❌ Bad Query | ✅ Good Query |
|---|---|
| `"auth"` | `"How to sign in with email and password using Supabase Auth in Next.js App Router"` |
| `"hooks"` | `"React useEffect cleanup function for subscriptions with dependency array"` |
| `"routing"` | `"Next.js 15 App Router dynamic route segments with generateStaticParams"` |
| `"animation"` | `"Framer Motion staggerChildren variant for list item entrance animation"` |
| `"video"` | `"Remotion Player component props for live preview with input controls in React"` |

### Use the `topic` Parameter

Always include the `topic` parameter when querying docs for a specific feature area. This dramatically improves result relevance:

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

---

## Rate Limit Rules

Context7 enforces a limit of **3 calls per tool per question**. The agent must respect this:

- Maximum **3 calls** to `resolve-library-id` per task.
- Maximum **3 calls** to `query-docs` per task.
- If the agent cannot find what it needs after 3 calls to either tool, it must proceed with the best information it has and note in a code comment: `// TODO: Verify against latest docs — Context7 lookup limit reached`.
- To maximize effectiveness within the limit, the agent should use the pre-mapped library IDs from the registry above (saving `resolve-library-id` calls) and write highly specific queries (getting the right answer in fewer `query-docs` calls).

---

## Context7 Availability Detection

At the START of the first task that requires library documentation, the agent must check Context7 availability:

1. Attempt a simple `resolve-library-id(query: "test", libraryName: "react")`.
2. If it succeeds → Context7 is available. Use it for all library lookups in this session.
3. If it fails → State: "Context7 MCP is not available. Falling back to training knowledge. Code may reference outdated APIs — please verify against official docs after implementation." Then proceed without Context7 but add `// VERIFY: Written without Context7 — check official docs` comments on any non-trivial library usage.

The agent must NOT silently skip Context7. Every fallback must be announced.

---

## What Context7 is NOT For

Do NOT use Context7 for:
- **General programming concepts**: loops, conditionals, data structures, algorithms. The agent knows these.
- **Project-specific code**: business logic, custom utilities, application architecture. Context7 only has library docs.
- **Supabase schema operations**: Use Supabase MCP tools for database operations (see Supabase MCP constitution). Context7 is for learning how to use the Supabase JS client API, not for executing database commands.
- **Trivial API calls**: If the usage is extremely common and simple (e.g., `useState`, `console.log`, `JSON.parse`), don't waste a Context7 call.

---

## Example: Full Context7 Workflow in a Task

**Task**: Implement the Supabase Auth login form with Google OAuth

**Agent workflow**:

1. Query Supabase Auth docs:
```
query-docs(
  libraryId: "/supabase/supabase",
  query: "Sign in with email password and Google OAuth provider in Next.js App Router using @supabase/ssr",
  topic: "authentication",
  tokens: 8000
)
```

2. Query shadcn/ui form components:
```
query-docs(
  libraryId: "/shadcn-ui/ui",
  query: "Form component with react-hook-form and zod validation",
  topic: "form",
  tokens: 5000
)
```

3. Write the login form code using the patterns from Context7 responses.

4. If the Supabase auth pattern returned seems unfamiliar or different from expected, query once more with a narrower focus:
```
query-docs(
  libraryId: "/supabase/supabase",
  query: "signInWithOAuth google provider redirect URL configuration",
  topic: "authentication",
  tokens: 3000
)
```

5. Implement, test, commit (per the git discipline constitution).

---

## Prohibited Practices

- NEVER write library-specific code from memory alone when Context7 is available. Always verify.
- NEVER call `query-docs` without a valid library ID. Always resolve first or use the pre-mapped registry.
- NEVER use generic single-word queries like `"auth"`, `"forms"`, `"video"`. Always be specific.
- NEVER exceed 3 calls per tool per question. Plan your queries carefully.
- NEVER assume a library API works the same way it did in a previous version. Context7 exists precisely because APIs change.
- NEVER include sensitive information (API keys, passwords, credentials, personal data) in Context7 queries.
- NEVER skip Context7 and claim "I already know this" — the agent's training data may be outdated. Look it up.