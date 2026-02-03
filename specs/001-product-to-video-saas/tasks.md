# Tasks: ProductToVideo.ai — URL-to-Video SaaS Platform

**Input**: Design documents from `/specs/001-product-to-video-saas/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested in spec — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and directory structure

- [X] T001 Initialize Next.js 15 project with TypeScript, Tailwind CSS, ESLint, App Router, and src directory via `pnpm create next-app@latest`
- [X] T002 Install all core dependencies per quickstart.md (shadcn/ui, next-intl, @supabase/ssr, remotion, @anthropic-ai/sdk, puppeteer-core, stripe, motion, next-themes, resend, franc, nuqs)
- [X] T003 Initialize shadcn/ui and install required components (button, input, card, dialog, dropdown-menu, select, tabs, sonner, accordion, sheet, tooltip, avatar, badge, progress, skeleton, separator)
- [X] T004 Create full directory structure per plan.md (app/[locale]/(marketing), (auth), (dashboard), api routes, components/, lib/, remotion/, i18n/, messages/, hooks/, types/, supabase/migrations/)
- [X] T005 [P] Create `.env.local.example` with all required environment variables (Supabase, Stripe, Anthropic, Resend, Chromium)
- [X] T006 [P] Configure `next.config.ts` with serverExternalPackages for @remotion/renderer, image remote patterns, and next-intl plugin per research.md
- [X] T007 [P] Create `src/app/globals.css` with CSS variables, theme tokens (dark/light), base Tailwind imports, and animation keyframes
- [X] T008 [P] Create shared TypeScript interfaces in `src/types/index.ts` (ProductData, VideoScript, VideoProject, RenderedVideo, BulkJob, Template, MusicTrack, UserProfile, Subscription, UserUsage)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create Supabase initial migration SQL in `supabase/migrations/001_initial_schema.sql` with all custom types (pricing_type, pricing_plan_interval, subscription_status, render_status, bulk_status) and all 10 tables (profiles, customers, products, prices, subscriptions, user_usage, video_projects, rendered_videos, bulk_jobs, bulk_job_items) with RLS policies, indexes, and triggers per data-model.md
- [X] T010 [P] Create Supabase browser client helper in `src/lib/supabase/client.ts` using `createBrowserClient` from @supabase/ssr
- [X] T011 [P] Create Supabase server client helper in `src/lib/supabase/server.ts` using `createServerClient` with cookie handling
- [X] T012 [P] Create Supabase middleware helper in `src/lib/supabase/middleware.ts` for token refresh in middleware
- [X] T013 Create next-intl routing configuration in `src/i18n/routing.ts` with defineRouting (locales: ['en', 'ar'], defaultLocale: 'en', localePrefix: 'as-needed')
- [X] T014 [P] Create next-intl request configuration in `src/i18n/request.ts` with getRequestConfig loading messages per locale
- [X] T015 Create composed middleware in `src/middleware.ts` combining next-intl locale handling and Supabase auth token refresh with dashboard route protection per research.md
- [X] T016 [P] Create English translation messages in `src/messages/en.json` covering all namespaces (common, landing, auth, dashboard, editor, videos, bulk, settings, errors)
- [X] T017 [P] Create Arabic translation messages in `src/messages/ar.json` mirroring all English namespaces with Arabic translations
- [X] T018 Create root layout in `src/app/layout.tsx` (minimal HTML shell)
- [X] T019 Create locale layout in `src/app/[locale]/layout.tsx` with font loading, html dir attribute (rtl for ar), ThemeProvider (next-themes), NextIntlClientProvider, and Toaster
- [X] T020 [P] Create Stripe client helper in `src/lib/stripe/client.ts` with initialized Stripe instance
- [X] T021 [P] Create Remotion project root in `src/remotion/Root.tsx` registering all 5 compositions with Composition declarations
- [X] T022 [P] Create Remotion entry point in `src/remotion/index.ts` with registerRoot
- [X] T023 [P] Create Remotion bundle script in `scripts/bundle-remotion.ts` using @remotion/bundler to pre-build compositions to `remotion-bundle/`
- [X] T024 [P] Create theme toggle component in `src/components/shared/theme-toggle.tsx` using next-themes useTheme
- [X] T025 [P] Create language switcher component in `src/components/shared/language-switcher.tsx` switching between en/ar with URL locale update
- [X] T026 [P] Create logo component in `src/components/shared/logo.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Single Video Generation from Product URL (Priority: P1) 🎯 MVP

**Goal**: A user pastes a product URL, extracts data, generates AI script, selects template, customizes in editor, and renders a downloadable MP4 video.

**Independent Test**: Paste a real product URL, complete the full flow from URL input through MP4 download.

### Scraping & AI Infrastructure

- [x] T027 [P] [US1] Implement JSON-LD parser in `src/lib/scraper/json-ld.ts` extracting Product schema (name, description, price, currency, images)
- [x] T028 [P] [US1] Implement Open Graph parser in `src/lib/scraper/og-parser.ts` extracting og:title, og:image, product:price:amount
- [x] T029 [P] [US1] Implement platform-specific selectors in `src/lib/scraper/platform-selectors.ts` for Shopify (.json trick), WooCommerce, Amazon, Salla, Zid, Etsy, Noon, Wix, Squarespace, BigCommerce
- [x] T030 [US1] Implement main extraction orchestrator in `src/lib/scraper/extract.ts` with layered strategy: Shopify JSON → JSON-LD → Open Graph → platform-specific DOM → generic DOM, using puppeteer-core with request interception (block images/fonts/CSS), waitUntil: domcontentloaded
- [x] T031 [P] [US1] Implement language detection utility in `src/lib/utils/language-detection.ts` using franc library with html lang fast-path and ISO 639-3 to supported language mapping
- [x] T032 [P] [US1] Implement font-for-language utility in `src/lib/utils/font-for-language.ts` mapping supported languages to appropriate font families (including Arabic fonts)
- [x] T033 [US1] Implement AI script generation in `src/lib/ai/generate-script.ts` using @anthropic-ai/sdk Claude Haiku with prompt for hook, feature highlights, price callout, CTA in detected language, with raw description fallback

### API Routes

- [x] T034 [US1] Implement POST /api/extract-product in `src/app/api/extract-product/route.ts` calling extract.ts, returning ProductData per contract, with error codes (INVALID_URL, NO_PRODUCT_DATA, PAGE_REQUIRES_AUTH, TIMEOUT, EXTRACTION_FAILED)
- [x] T035 [US1] Implement POST /api/generate-script in `src/app/api/generate-script/route.ts` calling generate-script.ts, returning VideoScript per contract, with 503 fallback
- [x] T036 [US1] Implement POST /api/render-video in `src/app/api/render-video/route.ts` creating rendered_videos records, checking quota in user_usage, starting render via @remotion/renderer renderMedia with pre-bundled compositions, uploading to Supabase Storage rendered-videos bucket
- [x] T037 [US1] Implement GET /api/render-video/[renderId]/status in `src/app/api/render-video/[renderId]/status/route.ts` polling render progress from rendered_videos table, returning signed download URL when complete

### Remotion Templates

- [x] T038 [P] [US1] Create shared Remotion components in `src/remotion/components/` (TextOverlay.tsx, ImageSlide.tsx, PriceTag.tsx, CTAOverlay.tsx, BackgroundMusic.tsx) with RTL text support
- [x] T039 [P] [US1] Create MinimalLuxury template composition in `src/remotion/compositions/MinimalLuxury.tsx`
- [x] T040 [P] [US1] Create BoldSale template composition in `src/remotion/compositions/BoldSale.tsx`
- [x] T041 [P] [US1] Create ProductShowcase template composition in `src/remotion/compositions/ProductShowcase.tsx`
- [x] T042 [P] [US1] Create StorySwipe template composition in `src/remotion/compositions/StorySwipe.tsx`
- [x] T043 [P] [US1] Create CleanModern template composition in `src/remotion/compositions/CleanModern.tsx`

### Dashboard Layout (needed for US1 flow)

- [x] T044 [US1] Create dashboard layout shell in `src/app/[locale]/(dashboard)/layout.tsx` with sidebar, top bar, auth guard (getUser check + redirect)
- [x] T045 [P] [US1] Create sidebar component in `src/components/dashboard/sidebar.tsx` with navigation links (New Video, My Videos, Bulk Generate, Settings), plan name, and render count display
- [x] T046 [P] [US1] Create top bar component in `src/components/dashboard/top-bar.tsx` with logo, language switcher, theme toggle, user avatar dropdown (Settings, Billing, Logout)

### Core Video Generation Pages

- [x] T047 [US1] Create use-video-project hook in `src/hooks/use-video-project.ts` managing video generation state (product data, script, template, customization, step navigation)
- [x] T048 [US1] Create New Video page in `src/app/[locale]/(dashboard)/new-video/page.tsx` with multi-step flow: URL input → data review → template selection → editor → render
- [x] T049 [US1] Create video preview component in `src/components/editor/video-preview.tsx` wrapping @remotion/player Player with live preview of selected template and current customization props
- [x] T050 [P] [US1] Create text editing panel in `src/components/editor/text-panel.tsx` for editing script hook, features, price callout, CTA with regenerate button
- [x] T051 [P] [US1] Create colors editing panel in `src/components/editor/colors-panel.tsx` with color picker and 6 preset brand color palettes for primary, secondary, background
- [x] T052 [P] [US1] Create images editing panel in `src/components/editor/images-panel.tsx` for reordering extracted product images
- [x] T053 [P] [US1] Create music editing panel in `src/components/editor/music-panel.tsx` with 5 royalty-free tracks, preview playback, and No Music option
- [x] T054 [P] [US1] Create language editing panel in `src/components/editor/language-panel.tsx` to override detected language (8 supported) triggering script regeneration
- [x] T055 [US1] Create use-render-status hook in `src/hooks/use-render-status.ts` polling /api/render-video/[renderId]/status with progress state
- [x] T056 [US1] Implement render initiation and progress UI in New Video page with format selection (9:16, 1:1, 16:9), progress indicator (percentage, estimated time, per-format), download buttons on completion, Download All as ZIP, and Generate Another Video button

**Checkpoint**: User Story 1 fully functional — paste URL → get downloadable MP4

---

## Phase 4: User Story 2 — Marketing Landing Page Experience (Priority: P2)

**Goal**: A visitor sees a professional landing page with value proposition, animated showcase, supported platforms/languages, template gallery, pricing, FAQ, and CTA to sign up.

**Independent Test**: Load landing page, verify all sections render, animated showcase loops, smooth-scroll navigation, CTA links to signup.

- [x] T057 [US2] Create marketing layout shell in `src/app/[locale]/(marketing)/layout.tsx` with sticky navbar and footer
- [x] T058 [US2] Create landing page in `src/app/[locale]/(marketing)/page.tsx` composing all landing section components in order
- [x] T059 [P] [US2] Create hero section component in `src/components/landing/hero.tsx` with headline, subtitle, primary CTA ("Generate Your First Video — Free"), secondary CTA ("Watch How It Works"), and platform trust indicators
- [x] T060 [US2] Create animated showcase component in `src/components/landing/animated-showcase.tsx` with auto-playing infinite loop cycling 5 scenes (URL Input, Data Extraction, Template Selection, Video Preview, Export Ready) using motion (Framer Motion)
- [x] T061 [P] [US2] Create how-it-works section in `src/components/landing/how-it-works.tsx` with step-by-step visual guide
- [x] T062 [P] [US2] Create supported platforms section in `src/components/landing/platforms.tsx` showing logos/names of top 10 supported e-commerce platforms
- [x] T063 [P] [US2] Create supported languages section in `src/components/landing/languages.tsx` showing 8 supported languages
- [x] T064 [P] [US2] Create templates gallery section in `src/components/landing/templates-gallery.tsx` with preview thumbnails of 5 video templates
- [x] T065 [US2] Create pricing section in `src/components/landing/pricing.tsx` with 3 plan cards (Starter $19/mo, Growth $49/mo "Most Popular", Scale $99/mo) with feature lists and CTA buttons
- [x] T066 [P] [US2] Create FAQ section in `src/components/landing/faq.tsx` with at least 6 expandable/collapsible question-answer pairs using shadcn Accordion
- [x] T067 [P] [US2] Create footer component in `src/components/landing/footer.tsx` with links, copyright, and social icons
- [x] T068 [US2] Implement sticky top navigation in marketing layout with smooth-scroll links to each section and mobile hamburger menu

**Checkpoint**: Landing page complete with all sections, animated showcase, and responsive layout

---

## Phase 5: User Story 3 — User Authentication and Account Management (Priority: P3)

**Goal**: Users can sign up, log in, reset password, and manage profile preferences (name, language, theme).

**Independent Test**: Complete signup, login, password reset, and profile update flows.

- [x] T069 [US3] Create auth layout shell in `src/app/[locale]/(auth)/layout.tsx` with centered card design
- [x] T070 [P] [US3] Create signup form component in `src/components/auth/signup-form.tsx` with email/password fields, validation, and Supabase signUp call
- [x] T071 [P] [US3] Create login form component in `src/components/auth/login-form.tsx` with email/password fields, validation, and Supabase signInWithPassword call
- [x] T072 [P] [US3] Create Google OAuth button component in `src/components/auth/google-button.tsx` using Supabase signInWithOAuth (Google, PKCE)
- [x] T073 [US3] Create signup page in `src/app/[locale]/(auth)/signup/page.tsx` composing signup-form and google-button
- [x] T074 [US3] Create login page in `src/app/[locale]/(auth)/login/page.tsx` composing login-form and google-button
- [x] T075 [US3] Create reset password page in `src/app/[locale]/(auth)/reset-password/page.tsx` with email input and Supabase resetPasswordForEmail call
- [x] T076 [US3] Create OAuth PKCE callback route in `src/app/[locale]/(auth)/auth/callback/route.ts` exchanging code for session via exchangeCodeForSession
- [x] T077 [US3] Create settings page in `src/app/[locale]/(dashboard)/settings/page.tsx` with profile editing (name, avatar), password change, UI language selection, theme selection, and account deletion with confirmation dialog
- [x] T078 [US3] Implement welcome email sending via Resend in signup flow using `resend` library

**Checkpoint**: Full auth flow (signup, login, reset, OAuth, profile management) working independently

---

## Phase 6: User Story 4 — Video Library Management (Priority: P4)

**Goal**: Users browse, search, sort, download, delete, and re-edit their previously generated videos.

**Independent Test**: Navigate to My Videos with existing videos, perform search, sort, download, delete, and re-edit.

- [x] T079 [P] [US4] Create video card component in `src/components/dashboard/video-card.tsx` displaying thumbnail, product name, date, language, rendered formats, with action buttons (Download, Delete, Re-edit)
- [x] T080 [US4] Create My Videos page in `src/app/[locale]/(dashboard)/my-videos/page.tsx` with grid/list view of video cards, search by product name (nuqs for URL state), sort by date/name, empty state with CTA to create first video
- [x] T081 [US4] Implement download action with format selection, generating signed URLs from Supabase Storage rendered-videos bucket
- [x] T082 [US4] Implement delete action with confirmation dialog, removing video_project and associated rendered_videos and storage files
- [x] T083 [US4] Implement re-edit action navigating to New Video page with pre-loaded project data (product data, script, template, customizations)

**Checkpoint**: My Videos page fully functional with all CRUD operations

---

## Phase 7: User Story 5 — Bulk Video Generation (Priority: P5)

**Goal**: Power users paste multiple URLs (up to 20) or upload CSV, batch-extract, apply single template/format, and render all with progress tracking.

**Independent Test**: Paste 5 URLs, select template/format, verify batch rendering with progress and downloads.

- [ ] T084 [US5] Implement POST /api/bulk-extract in `src/app/api/bulk-extract/route.ts` accepting up to 20 URLs, creating bulk_job and bulk_job_items records, processing extractions, returning results per contract
- [ ] T085 [US5] Implement POST /api/bulk-render in `src/app/api/bulk-render/route.ts` starting rendering for all successful items in a bulk job with selected template/formats per contract
- [ ] T086 [US5] Implement GET /api/bulk-render/[bulkJobId]/status in `src/app/api/bulk-render/[bulkJobId]/status/route.ts` returning per-item and overall progress per contract
- [ ] T087 [US5] Create Bulk Generate page in `src/app/[locale]/(dashboard)/bulk/page.tsx` with URL text area input (one per line), CSV upload option, 20-URL max validation, results table (image, name, price, language, status), remove failed rows, template/format selection, Generate All button, individual + overall progress bars, Download All as ZIP + individual downloads

**Checkpoint**: Bulk generation flow complete with extraction, rendering, progress, and downloads

---

## Phase 8: User Story 6 — Subscription and Billing Management (Priority: P6)

**Goal**: Users view plan/quota, upgrade/downgrade, manage payment methods, view invoices. System enforces render quotas with overage purchasing.

**Independent Test**: View subscription status, exceed render quota, verify upgrade/downgrade flows.

- [ ] T088 [US6] Implement POST /api/create-checkout-session in `src/app/api/create-checkout-session/route.ts` creating Stripe Checkout session for selected price, linking to Supabase user via customers table per contract
- [ ] T089 [US6] Implement POST /api/create-portal-session in `src/app/api/create-portal-session/route.ts` creating Stripe Customer Portal session for plan management per contract
- [ ] T090 [US6] Implement POST /api/webhooks/stripe in `src/app/api/webhooks/stripe/route.ts` with raw body (request.text()) signature verification, handling checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded (reset usage counters), invoice.payment_failed per research.md
- [ ] T091 [US6] Implement quota enforcement in render-video route: check user_usage.renders_used vs renders_limit before render, return QUOTA_EXCEEDED (403) with overage option, never decrement on failed renders
- [ ] T092 [US6] Implement overage render purchasing via Stripe Billing Meters API (stripe.billing.meterEvents.create) when user opts for overage at $0.50/render
- [ ] T093 [US6] Add billing section to settings page in `src/app/[locale]/(dashboard)/settings/page.tsx` showing current plan, renders used/remaining, Change Plan button (opens Checkout or Portal), payment method management, invoice history with download links
- [ ] T094 [US6] Update sidebar component to display current plan name and renders remaining from user_usage table

**Checkpoint**: Full billing flow with quota enforcement, overage, Stripe integration

---

## Phase 9: User Story 7 — Dark/Light Theme and Responsive Experience (Priority: P7)

**Goal**: Application adapts correctly to dark/light themes and all device sizes (desktop, tablet, mobile).

**Independent Test**: Toggle theme, resize browser across breakpoints, verify layout and readability.

- [ ] T095 [US7] Audit and apply dark theme styles across all components ensuring readable contrast, correct backgrounds, borders, cards, modals, and interactive elements in dark mode
- [ ] T096 [US7] Implement OS-level theme detection defaulting to system preference via next-themes with manual override and persistence
- [ ] T097 [US7] Implement responsive sidebar: collapse to hamburger menu on mobile using Sheet component in `src/components/dashboard/sidebar.tsx`
- [ ] T098 [US7] Implement responsive video editor: stack vertically on mobile (preview on top, controls below) in editor components
- [ ] T099 [US7] Implement responsive landing page: ensure animated showcase scales, all sections stack correctly, navigation becomes mobile hamburger
- [ ] T100 [US7] Verify all landing page sections, dashboard pages, and editor components render correctly across desktop (1280px+), tablet (768-1279px), and mobile (<768px) breakpoints

**Checkpoint**: All pages theme-aware and responsive across all breakpoints

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T101 [P] Implement toast notification system using shadcn Toast for: successful render, failed render, plan limit reached, successful payment, account changes (FR-058)
- [ ] T102 [P] Implement email notifications via Resend for: welcome after signup, render complete with download link, monthly usage summary, plan renewal/payment receipt (FR-059)
- [ ] T103 Implement inline form validation with error messages across all forms (auth, URL input, settings, bulk input) (FR-063)
- [ ] T104 Implement error handling UI: friendly error for unparseable URLs with retry/manual entry option (FR-060), AI fallback indicator (FR-061), render retry button (FR-062)
- [ ] T105 [P] Add edge case handling: non-product URL detection, product page with no images (placeholder + upload), unsupported language fallback to English with notification, session expiry mid-render recovery, partial format render failure with retry, CSV parsing errors in bulk upload, auth-required URL detection
- [ ] T106 Verify all UI text in both en.json and ar.json is complete — no untranslated strings (FR-049)
- [ ] T107 Performance audit: ensure URL-to-MP4 < 60s for single 9:16, live preview updates < 2s, extraction within 15s
- [ ] T108 Run quickstart.md validation — verify fresh setup following quickstart instructions produces a working dev environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–9)**: All depend on Foundational phase completion
  - US1 (Phase 3): No dependencies on other stories
  - US2 (Phase 4): No dependencies on other stories
  - US3 (Phase 5): No dependencies on other stories
  - US4 (Phase 6): Depends on US1 (needs video_projects and rendered_videos to exist)
  - US5 (Phase 7): Depends on US1 (reuses extraction and rendering infrastructure)
  - US6 (Phase 8): Depends on US1 (quota enforcement in render-video route)
  - US7 (Phase 9): Depends on US1+US2 (needs pages to exist for responsive/theme audit)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation only → MVP deliverable
- **US2 (P2)**: Foundation only → can parallel with US1
- **US3 (P3)**: Foundation only → can parallel with US1/US2
- **US4 (P4)**: Needs US1 complete (video data exists)
- **US5 (P5)**: Needs US1 complete (extraction + rendering pipeline)
- **US6 (P6)**: Needs US1 complete (render quota enforcement)
- **US7 (P7)**: Needs US1 + US2 complete (pages to audit)

### Within Each User Story

- Models/types before services
- Services before API routes
- API routes before UI pages
- Shared components before page compositions
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- US1, US2, US3 can all start in parallel after Foundation
- Within US1: all scraping parsers (T027-T029) in parallel, all Remotion templates (T039-T043) in parallel, all editor panels (T050-T054) in parallel
- Within US2: most landing sections (T059, T061-T067) in parallel
- Within US3: signup/login/OAuth forms (T070-T072) in parallel
- US4, US5, US6 can start in parallel once US1 is complete

---

## Parallel Example: User Story 1

```bash
# Launch all scraping parsers together:
Task: "Implement JSON-LD parser in src/lib/scraper/json-ld.ts"
Task: "Implement Open Graph parser in src/lib/scraper/og-parser.ts"
Task: "Implement platform-specific selectors in src/lib/scraper/platform-selectors.ts"
Task: "Implement language detection utility in src/lib/utils/language-detection.ts"
Task: "Implement font-for-language utility in src/lib/utils/font-for-language.ts"

# Launch all Remotion templates together:
Task: "Create MinimalLuxury template in src/remotion/compositions/MinimalLuxury.tsx"
Task: "Create BoldSale template in src/remotion/compositions/BoldSale.tsx"
Task: "Create ProductShowcase template in src/remotion/compositions/ProductShowcase.tsx"
Task: "Create StorySwipe template in src/remotion/compositions/StorySwipe.tsx"
Task: "Create CleanModern template in src/remotion/compositions/CleanModern.tsx"

# Launch all editor panels together:
Task: "Create text editing panel in src/components/editor/text-panel.tsx"
Task: "Create colors editing panel in src/components/editor/colors-panel.tsx"
Task: "Create images editing panel in src/components/editor/images-panel.tsx"
Task: "Create music editing panel in src/components/editor/music-panel.tsx"
Task: "Create language editing panel in src/components/editor/language-panel.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch independent landing sections together:
Task: "Create hero section in src/components/landing/hero.tsx"
Task: "Create how-it-works section in src/components/landing/how-it-works.tsx"
Task: "Create platforms section in src/components/landing/platforms.tsx"
Task: "Create languages section in src/components/landing/languages.tsx"
Task: "Create templates gallery in src/components/landing/templates-gallery.tsx"
Task: "Create FAQ section in src/components/landing/faq.tsx"
Task: "Create footer in src/components/landing/footer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Paste a real product URL → verify MP4 renders and downloads
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Video Generation) → Test independently → **MVP!**
3. US2 (Landing Page) + US3 (Auth) → can parallel → Deploy with acquisition funnel
4. US4 (Video Library) → Returning user experience
5. US5 (Bulk) + US6 (Billing) → can parallel → Monetization + power users
6. US7 (Theme/Responsive) → Polish layer
7. Phase 10 (Polish) → Production readiness

### Parallel Team Strategy

With multiple developers after Foundation:
- **Developer A**: US1 (core video generation) — critical path
- **Developer B**: US2 (landing page) — can start immediately
- **Developer C**: US3 (auth) — can start immediately
- After US1 completes: redistribute to US4/US5/US6

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Foundation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Remotion compositions must be pre-bundled before rendering works (T023)
- Stripe webhook uses request.text() not request.json() for signature verification
- Stripe Billing Meters API (not legacy usage records) for overage
- next-intl middleware must compose with Supabase middleware in single middleware.ts
