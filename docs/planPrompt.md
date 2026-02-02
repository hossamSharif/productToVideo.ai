 

## Tech Stack

**Framework**: Next.js 15 with App Router (full-stack — server components, API routes, middleware). Use the `src/app` directory structure with route groups for `(marketing)` (landing page), `(auth)` (login/signup/reset), and `(dashboard)` (authenticated app).

**UI Component Library**: shadcn/ui built on top of Radix UI primitives. Use shadcn/ui for all interactive components: Button, Input, Dialog, DropdownMenu, Select, Tabs, Card, Toast, Accordion (for FAQ), Sheet (for mobile sidebar), Tooltip, Avatar, Badge, Progress, Skeleton (for loading states), and Separator. Install components individually via the shadcn CLI (`npx shadcn@latest add <component>`).

**Styling**: Tailwind CSS v4 with CSS variables for theming. All custom design tokens defined as CSS variables in `globals.css` (see Design System section below). Use Tailwind's `dark:` variant for dark/light theme switching via a class strategy (`class` on `<html>`). Use `tailwind-merge` for conditional class merging and `clsx` for dynamic classNames.

**Internationalization (i18n)**: `next-intl` for the application UI translations (English and Arabic). Store translation files as JSON in `/messages/en.json` and `/messages/ar.json`. Configure middleware to detect locale from URL prefix (`/en/...`, `/ar/...`). Use `useTranslations()` hook in client components and `getTranslations()` in server components. For RTL support, set `dir="rtl"` and `lang="ar"` on `<html>` when locale is Arabic. Tailwind's RTL plugin (`tailwindcss-rtl` or Tailwind v4's built-in `rtl:` variant) must be used for layout mirroring — never hard-code left/right values; always use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`).

**Authentication**: Supabase Auth with the following providers:
- Email/Password signup and login (Supabase built-in).
- Google OAuth sign-in and sign-up (via Supabase's Google provider — configure Google Cloud Console OAuth credentials, set redirect URL in Supabase dashboard). Use `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- Forgot password flow via `supabase.auth.resetPasswordForEmail()`.
- Use `@supabase/ssr` package for Next.js App Router integration with server-side session handling. Create a Supabase middleware in `middleware.ts` that refreshes the session on every request using `updateSession()`. Create utility functions in `lib/supabase/server.ts` (server client) and `lib/supabase/client.ts` (browser client).

**Database**: Supabase PostgreSQL. Define tables for: users (profile data, preferences), subscriptions, video_projects, rendered_videos, bulk_jobs. Use Supabase Row Level Security (RLS) policies so users can only access their own data. Use Supabase migrations (`supabase/migrations/`) for schema management.

**File Storage**: Supabase Storage for rendered video files, product image uploads, and user avatars. Create separate buckets: `rendered-videos` (private, authenticated access), `product-images` (private), `avatars` (public). Generate signed URLs for video downloads.

**Video Engine**: Remotion v4 for video composition.
- Video templates are React components inside a `/remotion/` directory at the project root.
- Use `@remotion/player` (`<Player>` component) for the in-browser live preview in the editor.
- Use `@remotion/lambda` for serverless video rendering on AWS Lambda. If Lambda setup is too complex for initial development, fall back to `@remotion/renderer` with `renderMedia()` on a server-side API route (self-hosted rendering) as a working alternative.
- Each of the 5 video templates is a separate Remotion composition component that accepts props: `productName`, `price`, `currency`, `images[]`, `scriptLines[]`, `primaryColor`, `secondaryColor`, `backgroundColor`, `musicTrack`, `language`, `direction` (ltr/rtl).

**AI Script Generation**: Anthropic Claude Haiku via the `@anthropic-ai/sdk` npm package. Call Claude from a Next.js API route (`/api/generate-script`). Use language-specific system prompts — not translated prompts, but natively written instructions per language that understand local marketing conventions, tone, urgency, and CTA style. The API route accepts: `{ productName, description, price, currency, language }` and returns: `{ hook, featureLines[], priceCallout, cta }`.

**Product URL Scraping**: Use `puppeteer` (or `playwright`) in a Next.js API route (`/api/extract-product`) running on a serverless function. Extraction strategy:
1. Navigate to the URL with a headless browser.
2. Parse JSON-LD (`<script type="application/ld+json">`) for Schema.org `Product` markup.
3. If no JSON-LD, parse Open Graph meta tags (`og:title`, `og:image`, `og:description`).
4. If neither, fall back to platform-specific DOM selectors for Shopify, Salla, Zid, WooCommerce, Amazon.
5. Language detection: read `<html lang>` attribute first, then run text content through `franc` npm library for confirmation.

**Payments**: Stripe for subscription billing. Use Stripe Checkout for initial subscription, Stripe Customer Portal for plan management and invoice history, and Stripe Webhooks (`/api/webhooks/stripe`) for handling `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_succeeded` events. Store `stripe_customer_id` and `stripe_subscription_id` on the user's subscription record in Supabase.

**Email**: Resend (`resend` npm package) for transactional emails: welcome email, render complete notification, monthly usage summary, payment receipts. Use React Email templates for consistent styling.

**State Management**: No external state library. Use React Server Components for data fetching where possible. Use `useState` / `useReducer` for local UI state. Use React Context for shared client-side state (current video project in editor, theme, locale). Use `nuqs` for URL-based search/filter state on the My Videos page.

**Animations**: Framer Motion (`motion` package) for page transitions, the landing page animated showcase, staggered reveal animations, and micro-interactions. CSS animations (via Tailwind `animate-` utilities) for simple states like skeleton loading, pulse, and spin.

---

## Design System — Mandatory (Must Be Followed Exactly)

**IMPORTANT INSTRUCTION FOR THE AI AGENT**: When implementing any page, component, or UI element, you MUST read and follow the rules defined in the `/mnt/skills/public/frontend-design/SKILL.md` skill file BEFORE writing any frontend code. This skill file contains critical best practices for creating distinctive, production-grade interfaces. Apply its guidelines to every design task in this project — the landing page, the dashboard, all components, modals, and every visual element.

The following design system is extracted from the approved ProductToVideo.ai brand identity. Every token, color, font, spacing value, and visual pattern below is the source of truth and must be implemented exactly.

### Brand Logo

The logo is an SVG mark consisting of a 2×2 grid of squares with decreasing opacity, followed by the wordmark:

```svg
<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M3 3L11 3L11 11L3 11Z" fill="#00E5A0" opacity="0.9"/>
  <path d="M11 3L19 3L19 11L11 11Z" fill="#00E5A0" opacity="0.4"/>
  <path d="M3 11L11 11L11 19L3 19Z" fill="#00E5A0" opacity="0.4"/>
  <path d="M11 11L19 11L19 19L11 19Z" fill="#00E5A0" opacity="0.15"/>
</svg>
```

The wordmark reads: **ProductToVideo** (white/dark text) + **.ai** (in the primary brand green `#00E5A0`). Font: Outfit, weight 800. The logo mark and wordmark always appear together horizontally with a 10px gap.

### Color Palette

Define all colors as CSS custom properties in `:root` and `.dark` scopes. The application defaults to dark mode but must support both.

**Dark Theme (default):**

| Token | Value | Usage |
|---|---|---|
| `--background` | `#0B1120` | Page/app background |
| `--background-secondary` | `#0E1524` | Cards, panels, elevated surfaces |
| `--background-tertiary` | `rgba(255,255,255,0.02)` | Subtle surface elevation (card bg) |
| `--background-hover` | `rgba(255,255,255,0.035)` | Card/item hover state |
| `--foreground` | `#E8ECF1` | Primary text, headings |
| `--foreground-secondary` | `#C0CDD8` | Body text, descriptions |
| `--foreground-muted` | `#6B7A8D` | Secondary descriptions, helper text |
| `--foreground-subtle` | `#5A6577` | Tertiary text, counters, labels |
| `--foreground-ghost` | `#3E4F60` | Placeholder text, disabled states |
| `--foreground-dim` | `#2A3444` | Very low emphasis text, dividers text |
| `--primary` | `#00E5A0` | Brand green — CTAs, active states, accents |
| `--primary-hover` | `#00B87A` | Primary button hover, darker green |
| `--primary-gradient` | `linear-gradient(135deg, #00E5A0, #00B87A)` | Primary buttons, active nav, progress bars |
| `--primary-glow` | `linear-gradient(135deg, #00E5A0, #7DFFC9, #00E5A0)` | Animated glow text effect (hero headline), with `background-size: 200% 200%` and a 5s infinite gradient shift animation |
| `--primary-soft` | `rgba(0,229,160,0.06)` | Tinted backgrounds (badges, icon boxes) |
| `--primary-soft-border` | `rgba(0,229,160,0.12)` | Soft border for badges, featured cards |
| `--primary-soft-hover` | `rgba(0,229,160,0.15)` | Hover border for cards |
| `--primary-text-on-bg` | `#5A8A75` | Green text on dark backgrounds (low emphasis) |
| `--accent-blue` | `#60A5FA` | Secondary accent — info badges, Phase 2 tags |
| `--accent-yellow` | `#FBBF24` | Warning, time indicators, Phase 3 tags |
| `--accent-red` | `#ff5f57` | Error states, destructive actions, failed states |
| `--border` | `rgba(255,255,255,0.05)` | Default card/component borders |
| `--border-hover` | `rgba(255,255,255,0.08)` | Hover state borders |
| `--border-active` | `rgba(0,229,160,0.4)` | Active/selected element borders |
| `--ring` | `rgba(0,229,160,0.3)` | Focus ring / box-shadow glow |
| `--input-bg` | `rgba(255,255,255,0.05)` | Input field backgrounds |
| `--input-border` | `rgba(255,255,255,0.08)` | Input field borders |

**Light Theme** (`[data-theme="light"]` or `.light` class):

| Token | Value | Usage |
|---|---|---|
| `--background` | `#FAFBFC` | Page background |
| `--background-secondary` | `#FFFFFF` | Card/panel backgrounds |
| `--background-tertiary` | `#F4F5F7` | Subtle surfaces |
| `--background-hover` | `#EBEDF0` | Card hover |
| `--foreground` | `#111827` | Primary text |
| `--foreground-secondary` | `#374151` | Body text |
| `--foreground-muted` | `#6B7280` | Helper text |
| `--foreground-subtle` | `#9CA3AF` | Labels |
| `--foreground-ghost` | `#D1D5DB` | Placeholders |
| `--primary` | `#00C48C` | Brand green (slightly deeper for light bg contrast) |
| `--primary-hover` | `#00A676` | Hover green |
| `--border` | `#E5E7EB` | Borders |
| `--input-bg` | `#FFFFFF` | Input backgrounds |
| `--input-border` | `#D1D5DB` | Input borders |

### Typography

**English (LTR) Font Stack:**
- Display / Headings: `'Outfit'`, weights: 300, 400, 600, 700, 800. Load from Google Fonts.
- Monospace / Code / Labels: `'DM Mono'`, weights: 400, 500. Load from Google Fonts.
- Body fallback: `'Segoe UI', system-ui, sans-serif`.

**Arabic (RTL) Font Stack:**
- Display / Headings / Body: `'Noto Kufi Arabic'`, weights: 400, 600, 700, 800. Load from Google Fonts.
- Monospace: `'IBM Plex Sans Arabic'` or fall back to `'DM Mono'` for code elements.
- The font family switches based on the current locale. Define in `globals.css`: when `html[lang="ar"]`, override `font-family` to `'Noto Kufi Arabic'`.

**Type Scale:**
| Role | Size | Weight | Line Height |
|---|---|---|---|
| Hero headline | 36px (2.25rem) | 800 | 1.2 |
| Section title | 24px (1.5rem) | 800 | 1.3 |
| Card title | 15-16px | 700 | 1.4 |
| Body | 13-14px | 400 | 1.75 |
| Small / label | 10-11px | 700 | 1.5 |
| Code / mono | 10-12px | 400 | 1.5 |
| Section label (overline) | 10px | 700 | 1 (with `letter-spacing: 2px`) |

### Spacing & Layout

- Border radius (cards, panels): `14px` (`rounded-[14px]`)
- Border radius (buttons, inputs): `8px` (`rounded-lg`)
- Border radius (badges, pills): `20px` (`rounded-full`)
- Border radius (icon boxes): `12px` (`rounded-xl`)
- Card padding: `22px`
- Section padding (main content): `28px 32px`
- Top bar / header padding: `10px 24px`
- Icon box size: `48×48px`
- Step number circle: `36×36px`, rounded full
- Max content width (landing page sections): `920px` centered
- Gap between cards in grids: `12-14px`
- Gap between sidebar and content: the sidebar is fixed width (260px desktop), collapses on mobile

### Background Effects (Dark Theme)

The dark theme uses layered background effects for depth:
1. **Base**: Solid `#0B1120`
2. **Noise texture overlay**: SVG feTurbulence noise at `opacity: 0.025`, `position: fixed`, covers full viewport. This adds subtle grain.
3. **Gradient orb (top-right)**: `radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 65%)`, 600×600px, positioned top: -250px right: -150px.
4. **Gradient orb (bottom-left)**: `radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 65%)`, 700×700px, positioned bottom: -300px left: -200px.

All orbs are `pointer-events: none` and `position: fixed`. They create a subtle ambient color glow behind the content.

### Component Patterns

**Cards**: `background: var(--background-tertiary)`, `border: 1px solid var(--border)`, `border-radius: 14px`, `padding: 22px`. On hover: `border-color: var(--primary-soft-hover)`, `background: var(--background-hover)`. Transition: `all 0.3s ease`.

**Feature cards (on hover)**: Add `transform: translateY(-3px)` and `box-shadow: 0 8px 24px rgba(0,229,160,0.08)`.

**Primary buttons**: `background: var(--primary-gradient)`, `color: #0B1120`, `border: none`, `font-weight: 700`, `border-radius: 8px`. On hover: `box-shadow: 0 4px 12px var(--ring)`.

**Ghost/secondary buttons**: `background: rgba(255,255,255,0.04)`, `border: 1px solid var(--border-hover)`, `color: var(--foreground-subtle)`. On hover: `background: rgba(255,255,255,0.08)`, `color: var(--foreground-muted)`.

**Badge / pill**: `background: var(--primary-soft)`, `border: 1px solid var(--primary-soft-border)`, `border-radius: 20px`, `padding: 6px 18px`, `font-family: monospace`, `font-size: 10px`, `letter-spacing: 1px`.

**Nav pills (landing page)**: Default: transparent bg, `color: var(--foreground-ghost)`. Hover: `background: rgba(0,229,160,0.04)`, `border-color: rgba(0,229,160,0.1)`. Active: `background: var(--primary-gradient)`, `color: #0B1120`, `font-weight: 700`, `box-shadow: 0 2px 10px var(--ring)`.

**Input fields**: `background: var(--input-bg)`, `border: 1px solid var(--input-border)`, `border-radius: 8px`. Focus: `border-color: var(--primary)`, `ring: var(--ring)`.

**Toast notifications**: Use shadcn `Sonner` integration. Position: top-right. Style with brand colors.

**Progress bar**: Track: `rgba(255,255,255,0.05)`, height: `3px`, border-radius: `2px`. Fill: `var(--primary-gradient)`. Transition: `width 0.4s ease`.

### Animations

- **fadeInUp**: `from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) }` — duration 0.35-0.4s ease.
- **Staggered entry**: Elements within a section use incrementing delays: 0.05s, 0.12s, 0.19s, 0.26s, 0.33s.
- **Glow text** (hero headline): animated gradient (`--primary-glow`) with `background-clip: text` and `5s infinite` gradient position animation.
- **Pulse**: `0% { opacity: 0.3 } 50% { opacity: 1 } 100% { opacity: 0.3 }` — used for live status indicators.
- **Spin**: Standard 360deg rotation for loading spinners.
- **Card hover**: `transition: all 0.3s ease` on border-color and background.
- **Feature card hover lift**: `transform: translateY(-3px)` with `box-shadow` transition.

---

## Responsive Breakpoints

Use Tailwind's default breakpoints and design mobile-first:

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile (default) | < 768px | Single column layouts. Sidebar becomes hamburger Sheet. Video editor stacks vertically. Landing showcase simplifies. Nav collapses. |
| Tablet (`md`) | 768-1023px | Two-column where appropriate. Sidebar still collapsed or slim. Editor may begin side-by-side. |
| Desktop (`lg`) | 1024px+ | Full layout: fixed sidebar, split-screen editor, multi-column grids, full animated showcase. |

The landing page animated showcase must remain auto-playing on all viewports. On mobile, it should reduce from a wide layout to a vertically stacked or single-column animation while preserving the 5-scene loop.

The video editor split-screen (60/40) applies at `lg` and above. Below `lg`, it stacks: preview player on top (100% width), editing controls below (100% width, scrollable).

The dashboard sidebar (260px fixed) is visible at `lg` and above. Below `lg`, it becomes a shadcn `Sheet` (drawer) triggered by a hamburger icon in the top bar.

---

## Project Directory Structure

```
src/
├── app/
│   ├── [locale]/                    # next-intl locale wrapper
│   │   ├── (marketing)/             # Landing page route group
│   │   │   └── page.tsx             # Landing page
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/             # Authenticated route group
│   │   │   ├── layout.tsx           # Sidebar + top bar layout
│   │   │   ├── new-video/page.tsx   # Core video generation flow
│   │   │   ├── my-videos/page.tsx
│   │   │   ├── bulk/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── layout.tsx               # Root locale layout (fonts, theme, dir)
│   ├── api/
│   │   ├── extract-product/route.ts
│   │   ├── generate-script/route.ts
│   │   ├── render-video/route.ts
│   │   └── webhooks/stripe/route.ts
│   └── layout.tsx                   # Root layout
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── landing/                     # Landing page sections
│   │   ├── hero.tsx
│   │   ├── animated-showcase.tsx
│   │   ├── how-it-works.tsx
│   │   ├── platforms.tsx
│   │   ├── languages.tsx
│   │   ├── templates-gallery.tsx
│   │   ├── pricing.tsx
│   │   ├── faq.tsx
│   │   └── footer.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── top-bar.tsx
│   │   └── video-card.tsx
│   ├── editor/
│   │   ├── video-preview.tsx        # Remotion Player wrapper
│   │   ├── text-panel.tsx
│   │   ├── colors-panel.tsx
│   │   ├── images-panel.tsx
│   │   ├── music-panel.tsx
│   │   └── language-panel.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── google-button.tsx
│   └── shared/
│       ├── theme-toggle.tsx
│       ├── language-switcher.tsx
│       └── logo.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── stripe/
│   │   └── client.ts
│   ├── scraper/
│   │   ├── extract.ts
│   │   ├── json-ld.ts
│   │   └── og-parser.ts
│   ├── ai/
│   │   └── generate-script.ts
│   └── utils/
│       ├── language-detection.ts
│       └── font-for-language.ts
├── remotion/
│   ├── compositions/
│   │   ├── MinimalLuxury.tsx
│   │   ├── BoldSale.tsx
│   │   ├── ProductShowcase.tsx
│   │   ├── StorySwipe.tsx
│   │   └── CleanModern.tsx
│   ├── components/                  # Shared Remotion elements
│   └── Root.tsx                     # Remotion project root
├── messages/
│   ├── en.json                      # English translations
│   └── ar.json                      # Arabic translations
├── styles/
│   └── globals.css                  # CSS variables, theme tokens, base styles
├── hooks/
│   ├── use-video-project.ts
│   └── use-render-status.ts
└── types/
    └── index.ts                     # Shared TypeScript interfaces
```

---

## Additional Technical Notes

- **Google OAuth**: Must be configured in Supabase dashboard (Authentication > Providers > Google). Requires a Google Cloud Console project with OAuth 2.0 credentials (client ID + secret). The authorized redirect URL is `https://<project-ref>.supabase.co/auth/v1/callback`. On the frontend, the "Continue with Google" button calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/en/new-video' } })`.

- **Theme persistence**: Use `next-themes` package with `attribute="class"` strategy. Store preference in `localStorage`. Sync with Supabase user profile for cross-device persistence.

- **Locale persistence**: Store in cookie via `next-intl` middleware. Also save to Supabase user profile on change.

- **Font loading**: Use `next/font/google` to load Outfit, DM Mono, and Noto Kufi Arabic with `display: 'swap'`. Apply the Arabic font conditionally based on locale in the root locale layout.

- **Remotion integration in Next.js**: Remotion components live in `/remotion/` and are imported into the editor page. The `<Player>` component from `@remotion/player` is a client component and must be wrapped in `'use client'` boundaries. For rendering, trigger the API route which calls `renderMedia()` or dispatches to Lambda.

- **Environment variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `REMOTION_AWS_*` (if using Lambda).