# Research: ProductToVideo.ai

**Date**: 2026-02-02 | **Branch**: `001-product-to-video-saas`

## 1. Remotion v4 + Next.js 15 Integration

### Decision: Self-hosted `renderMedia()` for MVP, Lambda for scale

**Rationale:**
- `@remotion/player` works natively in Next.js client components (`"use client"` + import). No config needed.
- `@remotion/renderer` requires `serverExternalPackages: ['@remotion/renderer']` in `next.config.js`.
- Cannot use `@remotion/bundler` in API routes (Webpack-in-Webpack conflict). Must pre-bundle Remotion compositions as a build step.
- Cannot deploy `@remotion/renderer` to Vercel (headless browser exceeds 250MB function limit).
- Self-hosted rendering on a VPS/container is simpler for MVP. Lambda can be adopted later (same compositions, just swap `renderMedia()` for `renderMediaOnLambda()`).

**Webpack/Turbopack conflicts:**
- Next.js 15 uses Turbopack for dev by default. `serverExternalPackages` has known issues with Turbopack.
- Use `--webpack` flag if Turbopack causes issues. For production builds, webpack is safer with Remotion.

**Alternatives considered:**
- Remotion Lambda: faster (distributed), pay-per-use, built-in progress/webhooks. Rejected for MVP due to AWS setup complexity. Will migrate when scaling.
- Remotion Cloud Run: Alpha status, not recommended.

**Project structure:**
```
remotion/                 # Separate from app/
  compositions/           # Video template React components
  components/             # Shared Remotion UI elements
  Root.tsx                # registerRoot() with Composition declarations
  index.ts                # Entry point for Remotion Studio
remotion-bundle/          # Pre-built output (gitignored)
scripts/
  bundle-remotion.ts      # Build script using @remotion/bundler
```

## 2. next-intl with App Router (EN/AR + RTL)

### Decision: `[locale]` top-level segment with `as-needed` prefix strategy

**Rationale:**
- Route groups `(marketing)`, `(auth)`, `(dashboard)` nest inside `app/[locale]/`.
- `localePrefix: 'as-needed'` gives clean URLs for English (default), Arabic gets `/ar/...`.
- Middleware handles locale detection: URL prefix > cookie > Accept-Language header.

**Key files:**
- `i18n/routing.ts` — `defineRouting({ locales: ['en', 'ar'], defaultLocale: 'en' })`
- `i18n/request.ts` — `getRequestConfig()` loads messages per locale
- `middleware.ts` — `createMiddleware(routing)` (composed with Supabase, see below)
- `messages/en.json`, `messages/ar.json`

**RTL support:**
- Set `dir="rtl"` on `<html>` when locale is Arabic (in locale layout).
- Use Tailwind v4 logical properties natively: `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`.
- No RTL plugin needed. Tailwind v4 has built-in logical property support.
- `flex-row` auto-reverses with `dir="rtl"`.

**Translation APIs:**
- Server Components: `await getTranslations('namespace')`
- Client Components: `useTranslations('namespace')` (requires `NextIntlClientProvider` in locale layout)

## 3. Supabase Auth with @supabase/ssr

### Decision: Compose next-intl + Supabase in a single middleware

**Middleware composition order:**
1. Run `createIntlMiddleware(routing)` first — produces response with locale headers
2. Create Supabase client on the same response object
3. Call `supabase.auth.getUser()` — refreshes tokens, writes cookies
4. Check auth for dashboard routes — redirect if unauthenticated

**Key security rules:**
- Always use `getUser()` (validates with Supabase server), never `getSession()` (only reads JWT, spoofable).
- Two-layer route protection: middleware redirect (UX) + layout `getUser()` guard (security).
- Cookie API: `getAll`/`setAll` (current); individual methods deprecated.

**Google OAuth:** PKCE flow with callback at `app/[locale]/auth/callback/route.ts`. Exchanges code for session via `exchangeCodeForSession()`.

**RLS pattern:** `auth.uid() = user_id` per-operation policies on all tables. Index `user_id` columns.

## 4. Product URL Scraping

### Decision: `puppeteer-core` + `@sparticuz/chromium-min` with layered extraction

**Extraction priority chain:**
1. **JSON-LD** (`<script type="application/ld+json">` with `@type: "Product"`) — highest fidelity, ~40% of sites
2. **Open Graph** (`og:title`, `og:image`, `product:price:amount`) — broad coverage
3. **Platform-specific strategies:**
   - Shopify: Append `.json` to product URL (no browser needed)
   - Salla/Zid: JSON-LD first (HTML varies by theme)
   - WooCommerce: `.product_title`, `.price .woocommerce-Price-amount`
   - Amazon: `#productTitle`, `.a-price .a-offscreen`, `#landingImage` (anti-bot aggressive)
4. **Generic DOM** — fallback `h1`, `[itemprop="price"]`

**Performance optimizations:**
- Block images/fonts/CSS via request interception
- Use `waitUntil: 'domcontentloaded'` (not `networkidle0`)
- "Try light first": attempt plain `fetch()` + HTML parsing before launching headless browser
- `maxDuration: 60`, `memory: 1024` for Vercel serverless

**Language detection:** `franc` (ESM-only, ISO 639-3 codes). Combine title + description text for accuracy. Check `<html lang>` first as fast signal.

## 5. Stripe Subscription Billing

### Decision: Stripe Checkout + Customer Portal + app-side quota tracking + Billing Meters for overage

**Schema (Supabase, mirrors Stripe):**
- `customers` — maps `user_id` to `stripe_customer_id` (private, no public access)
- `products` — synced from Stripe via webhooks
- `prices` — linked to products, includes `unit_amount`, `currency`, `interval`
- `subscriptions` — full lifecycle state, `current_period_start/end`, `status`
- `user_usage` — app-side: `renders_used`, `renders_limit`, `overage_renders` per billing period

**Webhook events handled:**
| Event | Action |
|---|---|
| `checkout.session.completed` | Create customer/subscription records, provision access |
| `customer.subscription.updated` | Update plan tier, status, adjust quotas |
| `customer.subscription.deleted` | Revoke access, set status to canceled |
| `invoice.payment_succeeded` | Confirm active, reset monthly usage counters |
| `invoice.payment_failed` | Mark past_due, notify user |

**Quota enforcement flow:**
- Before render: check `renders_used` vs `renders_limit` in Supabase (fast, no Stripe API call)
- At limit: offer overage ($0.50/render) or upgrade. Report meter event to Stripe Billing Meters.
- On payment success: reset counters for new period.
- Failed renders: do not increment `renders_used`.

**Critical detail:** Legacy Stripe usage records API was removed in API version `2025-03-31.basil`. Must use Billing Meters API (`stripe.billing.meterEvents.create()`).

**Webhook raw body:** Must use `request.text()` (not `.json()`) in App Router for Stripe signature verification.
