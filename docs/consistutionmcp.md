# /speckit.constitution — Supabase Tooling Addendum

> Append everything below this line to your existing constitution, or paste it as a follow-up `/speckit.constitution` update prompt

---

## Supabase Tooling Strategy (NON-NEGOTIABLE)

When performing ANY operation that involves Supabase — database schema changes, SQL queries, authentication configuration, storage bucket management, RLS policies, type generation, project configuration, edge functions, logs, or debugging — the agent MUST follow this strict tool priority:

**Priority 1 — Supabase MCP Tools (always try first):**
Before executing any Supabase-related task, the agent MUST first check whether Supabase MCP tools are available in the current environment. If MCP tools are available, the agent MUST use them for the operation. The agent must NEVER write raw SQL files manually or run shell commands for tasks that an MCP tool can handle.

**Priority 2 — Supabase CLI (fallback only when MCP is unavailable):**
If the agent attempts to use a Supabase MCP tool and receives an error indicating the tool is not available, not connected, or the MCP server is unreachable, THEN and ONLY THEN should the agent fall back to the equivalent Supabase CLI command. The agent must explicitly state to the user: "Supabase MCP tools are not available. Falling back to Supabase CLI." before switching.

**Priority 3 — Manual file creation (last resort):**
If both MCP and CLI are unavailable (e.g., CLI is not installed), the agent may create SQL migration files and configuration files manually, but MUST warn the user that these files need to be applied manually and MUST include instructions for how to apply them.

---

## MCP-to-CLI Fallback Mapping

The agent MUST use the correct tool for each operation. Below is the definitive mapping. The MCP tool column is the preferred method. The CLI column is the fallback.

### Database Schema (DDL — CREATE, ALTER, DROP)

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Create table / alter schema / add columns / create indexes | `apply_migration` (pass the DDL SQL) | `supabase migration new <name>` then write SQL into the generated file, then `supabase db push` |
| View existing tables and their columns | `list_tables` | `supabase db dump --schema public` or `supabase inspect db table-sizes` |
| List all applied migrations | `list_migrations` | `supabase migration list` |
| List installed extensions | `list_extensions` | `supabase inspect db extensions` |

**Rules for schema changes:**
- ALL schema changes (CREATE TABLE, ALTER TABLE, ADD COLUMN, CREATE INDEX, CREATE POLICY, etc.) MUST go through `apply_migration` (MCP) or `supabase migration new` + `supabase db push` (CLI). The agent must NEVER execute DDL directly via `execute_sql` — that tool is only for non-schema queries.
- Every migration must have a descriptive name: `create_users_table`, `add_stripe_customer_id_to_subscriptions`, `create_rls_policies_for_video_projects`.
- Migrations are irreversible in production. The agent must always include a comment at the top of each migration SQL describing what it does.

### Database Queries (DML — SELECT, INSERT, UPDATE, DELETE)

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Run SELECT queries / inspect data | `execute_sql` | `supabase db execute --sql "SELECT ..."` or connect via `psql` using the connection string from Supabase dashboard |
| Insert seed data | `execute_sql` | `supabase db execute --sql "INSERT ..."` or create a `supabase/seed.sql` file and run `supabase db reset` |
| Debug data issues | `execute_sql` + `get_logs` | `supabase db execute` + `supabase functions logs` |

### Row Level Security (RLS)

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Create RLS policies | `apply_migration` (include CREATE POLICY statements in migration SQL) | `supabase migration new add_rls_<table>` then write policy SQL, then `supabase db push` |
| Enable RLS on a table | `apply_migration` (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) | Same as above — include in migration file |
| Verify RLS policies | `execute_sql` (`SELECT * FROM pg_policies`) | `supabase db execute --sql "SELECT * FROM pg_policies WHERE tablename = '...'"` |

**RLS rules:**
- RLS MUST be enabled on EVERY table that stores user data. No exceptions.
- Every table must have at minimum a SELECT policy restricted to `auth.uid() = user_id`.
- The agent must verify RLS is active after creating tables by querying `pg_policies`.

### TypeScript Type Generation

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Generate types from schema | `generate_typescript_types` | `supabase gen types typescript --local > src/types/supabase.ts` (for local dev) or `supabase gen types typescript --project-id <ref> > src/types/supabase.ts` (for remote) |

**Type generation rules:**
- Types MUST be regenerated after EVERY migration that changes the schema.
- The generated types file must live at `src/types/supabase.ts`.
- All Supabase client queries in the application must use these generated types. Never use `any` for Supabase query results.

### Authentication Configuration

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Check auth configuration | `get_project_url` + `get_anon_key` | `supabase status` (shows all local URLs and keys) |
| View auth settings | `execute_sql` (query `auth.users` for testing) | `supabase inspect db auth-users` or check via Supabase Dashboard |

**Auth rules:**
- Google OAuth provider configuration (client ID, secret, redirect URL) must be done via the Supabase Dashboard manually — neither MCP nor CLI can configure OAuth providers programmatically. The agent must instruct the user to configure this in the dashboard and provide step-by-step instructions.
- For local development, use `supabase start` which starts a local Supabase instance with auth pre-configured. The local auth endpoint is `http://localhost:54321/auth/v1`.

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

### Project & Debugging

| Task | MCP Tool | CLI Fallback |
|---|---|---|
| Get project URL and keys | `get_project_url` + `get_anon_key` | `supabase status` |
| View API/auth/postgres logs | `get_logs` | `supabase logs` or `supabase inspect db` commands |
| Check for performance issues | `get_advisors` | `supabase inspect db index-usage`, `supabase inspect db table-sizes`, `supabase inspect db unused-indexes` |
| Search Supabase docs for guidance | `search_docs` | Open `https://supabase.com/docs` manually |

---

## MCP Availability Detection

At the START of any task that involves Supabase, the agent must perform the following check:

1. Attempt to call `list_tables` (a lightweight read-only MCP tool).
2. If the call succeeds → MCP is available. Use MCP tools for all Supabase operations in this task.
3. If the call fails with a connection error, tool-not-found error, or timeout → MCP is not available. State: "Supabase MCP tools are not available in this environment. Falling back to Supabase CLI." Then verify CLI availability by running `supabase --version`.
4. If CLI is also not available → State: "Neither Supabase MCP nor CLI are available. Creating migration files manually. You will need to apply them with `supabase db push` after installing the CLI." Then create the SQL files in `supabase/migrations/` with proper timestamped filenames.

The agent must NOT silently switch between tools. Every fallback must be explicitly announced.

---

## Local Development Workflow

For local development, the agent should assume the developer is running:
```
supabase start
```
This provides a local Supabase instance at `http://localhost:54321` with:
- Local MCP endpoint at `http://localhost:54321/mcp`
- Local auth at `http://localhost:54321/auth/v1`
- Local REST API at `http://localhost:54321/rest/v1`
- Local Studio dashboard at `http://localhost:54323`

The agent should use the local instance for all development and testing. The agent must NEVER execute mutations against a production Supabase project unless the user explicitly confirms the project ref and the agent warns about production impact.

---

## Migration File Discipline

Whether using MCP `apply_migration` or CLI `supabase migration new`:

- Every migration file must have a timestamped filename (auto-generated by CLI or MCP).
- Every migration must contain a SQL comment block at the top:
  ```sql
  -- Migration: <descriptive name>
  -- Description: <what this migration does>
  -- Spec References: <FR-XXX numbers if applicable>
  -- Date: <ISO date>
  ```
- Migrations must be atomic: one logical change per migration. Do not combine table creation with RLS policies with seed data in one migration. Split them.
- After every migration, the agent must regenerate TypeScript types (via MCP `generate_typescript_types` or CLI `supabase gen types`).
- After every migration, the agent must verify it applied successfully by listing tables or querying the schema.

---

## Prohibited Practices

- NEVER use the Supabase Dashboard UI for schema changes if MCP or CLI are available. Dashboard changes are not tracked in migrations and will cause drift.
- NEVER hard-code Supabase URLs or keys in source code. Always use environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- NEVER use the `service_role` key in client-side code. It bypasses RLS. It is only for server-side API routes and background jobs.
- NEVER use `execute_sql` (MCP) or `supabase db execute` (CLI) for schema changes. Always use `apply_migration` or `supabase migration new` so changes are tracked.
- NEVER skip RLS. Every new table with user data must have RLS enabled and at least one policy in the same migration or immediately following migration.
- NEVER assume MCP is available. Always check first using the detection flow above.