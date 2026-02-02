# Feature Specification: ProductToVideo.ai - URL-to-Video SaaS Platform

**Feature Branch**: `001-product-to-video-saas`
**Created**: 2026-02-02
**Status**: Draft
**Input**: User description: "Build ProductToVideo.ai — a SaaS web application that allows e-commerce sellers worldwide to generate professional product promotional videos by simply pasting any product URL from any online store. The system auto-extracts product data, detects the product's language, generates a compelling video script using AI, lets the user pick and customize a video template, and renders a downloadable MP4 video — all within 60 seconds and with zero video editing skills required."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Video Generation from Product URL (Priority: P1)

An e-commerce seller pastes a product URL from any supported online store into the application. The system automatically extracts the product name, images, price, and description, detects the product's language, and generates an AI-written promotional video script. The seller reviews the extracted data and script, selects a video template, customizes colors and music, chooses export format(s), and renders a downloadable MP4 video — all without any video editing skills.

**Why this priority**: This is the core value proposition and the primary reason users come to the platform. Without this flow working end-to-end, the product has no value.

**Independent Test**: Can be fully tested by pasting a real product URL and completing the full generation flow from URL input through MP4 download. Delivers immediate value: a finished promotional video.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the New Video page, **When** they paste a valid Shopify product URL and click Generate, **Then** the system extracts and displays the product name, at least one image, price with currency, description, and detected language within 15 seconds.
2. **Given** extracted product data is displayed, **When** the user reviews the auto-generated AI script, **Then** the script contains a hook/opening line, 2-3 feature highlights, a price callout, and a call-to-action in the detected language.
3. **Given** the user has reviewed product data and script, **When** they click "Next: Choose Template," **Then** 5 template options are displayed with preview thumbnails, names, and descriptions.
4. **Given** a template is selected, **When** the user enters the editor view, **Then** a live video preview plays on the left and editing controls (text, colors, images, music, language) appear on the right.
5. **Given** the user clicks "Render Video" and selects 9:16 format, **When** rendering completes, **Then** the user can download the MP4 file and the video is saved to "My Videos."
6. **Given** the user modifies the script text in the editor, **When** the live preview updates, **Then** the changes are reflected in the preview within 2 seconds.
7. **Given** a product URL from a non-English store (e.g., Arabic on Salla), **When** the user generates a video, **Then** the detected language is Arabic, the script is in Arabic, and text direction in the video is right-to-left.

---

### User Story 2 - Marketing Landing Page Experience (Priority: P2)

A potential customer visits the ProductToVideo.ai website for the first time. They see a clear value proposition, an auto-playing animated demonstration of how the product works, supported platforms and languages, template previews, pricing plans, and FAQs — all designed to convert them into a signed-up user.

**Why this priority**: The landing page is the acquisition funnel. Without it, users cannot discover, understand, or sign up for the product. It directly feeds User Story 1.

**Independent Test**: Can be tested by loading the landing page and verifying all sections render correctly, the animated showcase auto-plays and loops, navigation smooth-scrolls to sections, and CTA buttons link to signup.

**Acceptance Scenarios**:

1. **Given** a visitor loads the landing page, **When** the page renders, **Then** the hero section displays a headline, subtitle, primary CTA ("Generate Your First Video — Free"), secondary CTA ("Watch How It Works"), and platform trust indicators.
2. **Given** the page has loaded, **When** the animated showcase section is visible, **Then** it auto-plays through 5 scenes (URL Input, Data Extraction, Template Selection, Video Preview, Export Ready) in a continuous loop without user interaction.
3. **Given** a visitor clicks "Watch How It Works" in the hero, **When** the page scrolls, **Then** it smooth-scrolls to the animated showcase section.
4. **Given** a visitor views the pricing section, **When** three plan cards are displayed, **Then** Starter ($19/mo), Growth ($49/mo, marked "Most Popular"), and Scale ($99/mo) plans show their correct feature lists and CTA buttons.
5. **Given** a visitor clicks an FAQ question, **When** the answer expands, **Then** only that answer is visible and other answers remain collapsed.
6. **Given** a visitor switches the language to Arabic, **When** the page re-renders, **Then** the entire UI displays in Arabic with right-to-left layout, mirrored navigation, and Arabic text for all labels, headings, and descriptions.

---

### User Story 3 - User Authentication and Account Management (Priority: P3)

A new visitor signs up with email and password, logs in, manages their profile and subscription, and can reset their password if forgotten. The system persists their preferences (language, theme) across sessions.

**Why this priority**: Authentication is required for the dashboard and video generation to function. Users need accounts to track renders, manage videos, and maintain subscriptions.

**Independent Test**: Can be tested by completing signup, login, password reset, and profile update flows independently of video generation.

**Acceptance Scenarios**:

1. **Given** a visitor on the signup page, **When** they enter a valid email and password and submit, **Then** an account is created, they receive a welcome email, and they are redirected to the dashboard.
2. **Given** a registered user on the login page, **When** they enter correct credentials, **Then** they are authenticated and redirected to the dashboard showing their plan and render count.
3. **Given** a user who forgot their password, **When** they enter their email on the forgot password page, **Then** they receive a password reset email with a secure link.
4. **Given** a logged-in user on Account Settings, **When** they update their name and save, **Then** the change is persisted and reflected in the UI.
5. **Given** a logged-in user, **When** they select dark mode and Arabic UI language, **Then** the preferences are saved and applied on their next login.

---

### User Story 4 - Video Library Management (Priority: P4)

A user who has generated videos can browse, search, sort, download, delete, and re-edit their previously generated videos from a centralized "My Videos" page.

**Why this priority**: Returning users need to access their past work. This increases retention and makes the product sticky beyond one-time use.

**Independent Test**: Can be tested by navigating to My Videos with pre-existing videos and performing search, sort, download, delete, and re-edit actions.

**Acceptance Scenarios**:

1. **Given** a user with 10 previously generated videos, **When** they open My Videos, **Then** a grid of video cards displays showing thumbnail, product name, date, language, and rendered formats.
2. **Given** the My Videos page, **When** the user types a product name in the search field, **Then** the list filters to show only matching videos.
3. **Given** a video card, **When** the user clicks Download, **Then** they can select which format(s) to download and receive the MP4 file(s).
4. **Given** a video card, **When** the user clicks Re-edit, **Then** the editor opens with the original product data, script, template, and customizations pre-loaded.
5. **Given** no videos have been generated, **When** the user opens My Videos, **Then** an empty state message with a CTA to create the first video is displayed.

---

### User Story 5 - Bulk Video Generation (Priority: P5)

A power user pastes multiple product URLs (up to 20) or uploads a CSV file, and the system batch-processes all URLs — extracting data, applying a single template and format selection, and rendering all videos with individual and overall progress tracking.

**Why this priority**: Bulk generation serves power users and higher-tier plans. It multiplies the core value but depends on single-video generation (P1) working first.

**Independent Test**: Can be tested by pasting 5 product URLs, selecting a template and format, and verifying batch rendering produces downloadable videos with correct progress tracking.

**Acceptance Scenarios**:

1. **Given** a user on the Bulk Generate page, **When** they paste 5 valid product URLs (one per line), **Then** the system processes all URLs and displays a table with product image, name, price, detected language, and status for each.
2. **Given** a processed URL table with 4 successful and 1 failed extraction, **When** the failed row shows an error reason, **Then** the user can remove the failed row and proceed with the remaining 4.
3. **Given** the user selects a template and 9:16 format for all videos, **When** they click "Generate All Videos," **Then** batch rendering starts with individual progress bars per video and an overall progress indicator.
4. **Given** batch rendering is complete, **When** all videos are done, **Then** a "Download All as ZIP" button is available along with individual download options.
5. **Given** a user attempts to paste 25 URLs, **When** the system validates, **Then** an error message indicates the maximum is 20 URLs per batch.

---

### User Story 6 - Subscription and Billing Management (Priority: P6)

A user views their current plan, remaining render count, upgrades or downgrades their plan, manages payment methods, and views invoice history. The system enforces render quotas and offers overage purchasing.

**Why this priority**: Monetization enables the business to sustain itself. However, the product can be initially tested and demonstrated without billing in place.

**Independent Test**: Can be tested by viewing subscription status, attempting to exceed render quota, and verifying upgrade/downgrade flows.

**Acceptance Scenarios**:

1. **Given** a user on the Growth plan with 38/50 renders remaining, **When** they view the sidebar, **Then** it displays "Growth Plan — 38/50 renders left."
2. **Given** a user has used all 50 monthly renders, **When** they attempt to generate a new video, **Then** a message explains the quota is exhausted and offers options to upgrade or purchase overage renders at $0.50 each.
3. **Given** a user on the Starter plan, **When** they click "Change Plan" and select Growth, **Then** the upgrade flow processes and their plan updates to Growth with the new render limit.
4. **Given** a rendering failure occurs, **When** the system reports the error, **Then** the render count is not decremented for the failed attempt.

---

### User Story 7 - Dark/Light Theme and Responsive Experience (Priority: P7)

A user accesses the application on different devices (desktop, tablet, mobile) and switches between dark and light themes. The entire UI — landing page and dashboard — adapts correctly to screen size and theme preference.

**Why this priority**: Theme and responsive support improve user experience and accessibility but are enhancement layers on top of core functionality.

**Independent Test**: Can be tested by toggling theme and resizing the browser across breakpoints, verifying layout and readability in all combinations.

**Acceptance Scenarios**:

1. **Given** a user on the dashboard in light mode, **When** they toggle to dark mode, **Then** all backgrounds, text, cards, modals, and interactive elements switch to dark theme with readable contrast.
2. **Given** a user on a mobile device, **When** they view the dashboard, **Then** the sidebar collapses into a hamburger menu and the video editor stacks vertically (preview on top, controls below).
3. **Given** a user's OS is set to dark mode, **When** they visit the site for the first time, **Then** the application defaults to dark mode.
4. **Given** the landing page animated showcase on mobile, **When** it renders, **Then** it scales down gracefully, continues to auto-play and loop, and remains visually coherent.

---

### Edge Cases

- What happens when a pasted URL is valid but points to a non-product page (e.g., a blog post or category page)? The system displays a friendly error: "We couldn't find product data at this URL. Please check the URL and try again, or enter data manually."
- What happens when a product page exists but has no images? The system proceeds with a placeholder image indicator and allows the user to upload their own images manually.
- What happens when the detected language is not one of the 8 supported languages? The system defaults to English for the script and notifies the user: "We detected [language]. Script has been generated in English. You can switch to any supported language."
- What happens when a user's session expires mid-render? Rendering continues in the background. When the user logs back in, the completed video appears in "My Videos."
- What happens when multiple export formats are selected but one format fails to render? The successful formats are available for download. The failed format shows a "Retry" button. Only the failed format's render count is refunded.
- What happens when a CSV file for bulk upload contains invalid formatting? The system displays an error identifying which rows could not be parsed and allows the user to correct and re-upload.
- What happens when the AI script generation service is temporarily unavailable? The system falls back to using the raw product description as the script content and allows the user to edit it manually.
- What happens when a product URL requires authentication (e.g., a private listing)? The system displays an error: "This product page appears to require login. Please provide a publicly accessible URL."

## Clarifications

### Session 2026-02-02

- Q: What authentication and session management approach should be used? → A: JWT access tokens with httpOnly refresh tokens (stateless API auth).
- Q: What is the target tech stack? → A: Next.js full-stack + Supabase (auth, DB, storage) + shadcn/ui.
- Q: How should video rendering be implemented? → A: Remotion (React-based video framework for preview and server-side MP4 rendering).
- Q: How should product URL scraping/extraction work? → A: Headless browser (Puppeteer/Playwright) with JSON-LD/Open Graph structured data parsing fallback to DOM scraping.
- Q: Which AI provider/model for script generation? → A: Anthropic Claude Haiku (fast, good multilingual, competitive pricing).

## Requirements *(mandatory)*

### Functional Requirements

**Landing Page**

- **FR-001**: System MUST display a marketing landing page with hero section, animated showcase, how-it-works steps, supported platforms, supported languages, template gallery, pricing, FAQ, and footer sections in a single scrollable page.
- **FR-002**: System MUST render an auto-playing, infinitely looping animated showcase that cycles through 5 scenes (URL Input, Data Extraction, Template Selection, Video Preview, Export Ready) without user interaction.
- **FR-003**: System MUST provide sticky top navigation with smooth-scroll links to each landing page section.
- **FR-004**: System MUST display three pricing tiers (Starter $19/mo, Growth $49/mo, Scale $99/mo) with accurate feature lists and CTA buttons.
- **FR-005**: System MUST provide an FAQ section with at least 6 expandable/collapsible question-answer pairs.

**Authentication**

- **FR-006**: System MUST support user registration via email and password.
- **FR-007**: System MUST support user login via email and password, issuing a short-lived JWT access token and a long-lived httpOnly refresh token.
- **FR-008**: System MUST provide a forgot-password flow that sends a secure password reset link via email.
- **FR-009**: System MUST redirect authenticated users to the dashboard after login/signup.
- **FR-064**: System MUST use Supabase Auth for authentication, leveraging its built-in JWT access tokens and httpOnly secure refresh token handling.
- **FR-065**: System MUST reject expired or tampered tokens and return a 401 response requiring re-authentication via Supabase Auth middleware.

**Dashboard Layout**

- **FR-010**: System MUST provide a sidebar navigation layout with links to New Video, My Videos, Bulk Generate, and Account Settings.
- **FR-011**: The sidebar MUST display the user's current plan name and remaining render count.
- **FR-012**: The top bar MUST display the logo, language switcher (EN/AR), theme toggle (dark/light), and user avatar with dropdown menu (Settings, Billing, Logout).

**Video Generation (Core Flow)**

- **FR-013**: System MUST accept a product URL input and extract product name, images, price (with currency), and description from the target page using a headless browser (Puppeteer/Playwright). Extraction MUST first attempt JSON-LD and Open Graph structured data, then fall back to DOM scraping for platform-specific selectors.
- **FR-014**: System MUST auto-detect the language of the product page content from the 8 supported languages (English, Arabic, Spanish, French, Portuguese, German, Turkish, Indonesian).
- **FR-015**: System MUST generate an AI-powered video script using Anthropic Claude Haiku in the detected language containing a hook/opening line, 2-3 feature highlights, a price callout, and a call-to-action.
- **FR-016**: System MUST allow users to edit all extracted product data (name, price, description) and the generated script before proceeding.
- **FR-017**: System MUST provide a "Regenerate Script" function that produces a new script variation.
- **FR-018**: System MUST allow users to override the detected language to any of the 8 supported languages, triggering script regeneration in the new language.
- **FR-019**: System MUST offer 5 video template options (Minimal Luxury, Bold Sale, Product Showcase, Story Swipe, Clean Modern) with preview thumbnails and descriptions.
- **FR-020**: System MUST provide a split-screen video editor with a Remotion Player live preview (left) and editing controls (right) including text, colors, images, music, and language panels.
- **FR-021**: The Remotion Player live preview MUST update within 2 seconds when the user changes any editable property.
- **FR-022**: System MUST offer 5 royalty-free background music tracks with preview playback and a "No Music" option.
- **FR-023**: The color editor MUST provide a color picker and 6 preset brand color palettes for primary, secondary, and background colors.
- **FR-024**: System MUST support export in three formats: 9:16 (vertical), 1:1 (square), and 16:9 (horizontal), with the user selecting one or more before rendering.
- **FR-025**: System MUST display a rendering progress indicator with percentage, estimated time remaining, and per-format progress.
- **FR-026**: System MUST allow users to navigate away during rendering without interrupting the process.
- **FR-027**: Upon render completion, system MUST provide download buttons for each rendered format, a "Download All as ZIP" option (if multiple formats), and a "Generate Another Video" button.

**My Videos**

- **FR-028**: System MUST display all previously generated videos in a grid/list view with thumbnail, product name, date, language, and rendered formats.
- **FR-029**: System MUST provide per-video actions: Download (with format selection), Delete, and Re-edit.
- **FR-030**: System MUST support sorting by date (newest first default) and by product name.
- **FR-031**: System MUST provide text search filtering by product name.
- **FR-032**: System MUST show an empty state with a CTA when no videos exist.

**Bulk Generation**

- **FR-033**: System MUST accept multiple product URLs via text area (one per line) or CSV file upload.
- **FR-034**: System MUST process all URLs and display a results table with product image, name, price, detected language, and status (Success/Failed with reason).
- **FR-035**: System MUST allow users to remove failed rows before proceeding.
- **FR-036**: System MUST apply a single selected template and export format(s) to all products in the batch.
- **FR-037**: System MUST enforce a maximum of 20 URLs per batch.
- **FR-038**: System MUST show batch rendering progress with individual and overall progress indicators.
- **FR-039**: System MUST provide "Download All as ZIP" and individual download options upon batch completion.

**Account and Billing**

- **FR-040**: System MUST allow users to edit their profile (name, email) and change their password.
- **FR-041**: System MUST display current subscription plan, monthly renders used, and renders remaining.
- **FR-042**: System MUST support plan upgrade and downgrade flows.
- **FR-043**: System MUST provide payment method management and invoice history with download links.
- **FR-044**: System MUST enforce monthly render quotas per plan (Starter: 10, Growth: 50, Scale: 200).
- **FR-045**: System MUST offer overage render purchasing at $0.50 per render when quota is exhausted.
- **FR-046**: System MUST NOT deduct a render from the user's quota when rendering fails.
- **FR-047**: System MUST provide account deletion with a confirmation dialog.

**Internationalization and Theming**

- **FR-048**: The entire UI (landing page and dashboard) MUST support English and Arabic interface languages with correct LTR/RTL layout mirroring.
- **FR-049**: All UI text (labels, buttons, headings, descriptions, error messages, placeholders, tooltips, notifications) MUST be translated when switching interface language.
- **FR-050**: System MUST persist the user's language preference across sessions.
- **FR-051**: System MUST support dark and light themes across all pages and components.
- **FR-052**: System MUST default to the user's OS/system theme preference, with manual override capability.
- **FR-053**: System MUST persist the user's theme preference across sessions.

**Responsive Design**

- **FR-054**: The landing page MUST be fully responsive across desktop, tablet, and mobile viewports.
- **FR-055**: The dashboard sidebar MUST collapse into a hamburger menu on mobile.
- **FR-056**: The video editor MUST stack vertically on mobile (preview on top, controls below).
- **FR-057**: The animated landing page showcase MUST scale down and remain functional on mobile.

**Notifications**

- **FR-058**: System MUST display in-app toast notifications for: successful render, failed render, plan limit reached, successful payment, and account changes.
- **FR-059**: System MUST send email notifications for: welcome after signup, render complete (with download link), monthly usage summary, and plan renewal/payment receipt.

**Error Handling**

- **FR-060**: System MUST display a friendly error message when a URL cannot be parsed or no product data is found, with options to retry or enter data manually.
- **FR-061**: System MUST fall back to using raw product description as the script when Claude Haiku API is unavailable or returns an error.
- **FR-062**: System MUST provide a "Retry" button when rendering fails.
- **FR-063**: System MUST validate all required form fields with inline error messages before allowing progression.

### Key Entities

- **User**: Represents a registered account holder. Key attributes: name, email, hashed password, selected interface language, theme preference, subscription plan, account creation date.
- **Subscription**: Represents a user's active billing plan. Key attributes: plan tier (Starter/Growth/Scale), monthly render limit, renders used this billing cycle, billing cycle start date, payment method reference, status (active/cancelled/past-due).
- **Video Project**: Represents a single video generation session. Key attributes: source product URL, extracted product data (name, images, price, description), detected language, AI-generated script, selected template, customization settings (colors, music, image order), creation date, owning user.
- **Rendered Video**: Represents a completed video output file. Key attributes: parent video project, export format (9:16/1:1/16:9), file reference, resolution, render status (queued/rendering/complete/failed), render duration, creation date.
- **Video Template**: Represents a reusable video layout style. Key attributes: template name, description, preview thumbnail, visual style parameters (typography, transition type, color scheme defaults), availability by plan tier.
- **Music Track**: Represents a royalty-free audio option. Key attributes: track name, mood label, audio file reference, duration.
- **Bulk Job**: Represents a batch video generation request. Key attributes: list of product URLs, selected template, selected export formats, overall status, individual URL statuses, owning user, creation date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from pasting a product URL to downloading a rendered MP4 video in under 60 seconds (for a single 9:16 format).
- **SC-002**: The system successfully extracts product data (name, at least one image, and price) from at least 90% of URLs from the top 10 supported platforms (Shopify, WooCommerce, Salla, Zid, Amazon, Etsy, Noon, Wix, Squarespace, BigCommerce).
- **SC-003**: Language detection accuracy is at least 95% for the 8 supported languages when tested against product pages in those languages.
- **SC-004**: 80% of first-time users complete the full video generation flow (URL to download) without requiring help documentation or support.
- **SC-005**: The landing page animated showcase plays smoothly (no visual stuttering or layout breaking) on desktop, tablet, and mobile viewports.
- **SC-006**: All UI elements are readable and correctly styled in both dark and light themes, with no broken layouts or unreadable text.
- **SC-007**: When Arabic is selected as the UI language, 100% of visible text is in Arabic and the layout is fully mirrored to RTL.
- **SC-008**: Bulk generation of 20 URLs completes within 20 minutes with individual progress visible throughout.
- **SC-009**: The live video preview in the editor reflects user changes (text, color, image reorder) within 2 seconds.
- **SC-010**: Failed renders never result in a deducted render count from the user's quota.

## Assumptions

- **Tech stack**: Next.js (App Router, full-stack) for frontend and API routes, Supabase for authentication (Supabase Auth with JWT), PostgreSQL database, file/video storage (Supabase Storage), and real-time capabilities. shadcn/ui as the component library with Tailwind CSS. Remotion for video composition (React components as video templates), in-browser preview (Remotion Player), and server-side MP4 rendering via Remotion Lambda or self-hosted FFmpeg.
- Product data extraction uses a headless browser (Puppeteer/Playwright) to handle JavaScript-rendered pages. Extraction strategy: (1) parse JSON-LD / Open Graph metadata, (2) fall back to DOM scraping with platform-specific selectors. Private or login-gated pages remain unsupported.
- The 60-second end-to-end target assumes standard network conditions and product pages that load within 5 seconds.
- Video rendering times scale with the number of selected export formats — each format adds render time.
- The 5 video templates are pre-designed and static for MVP; no user-created or community templates.
- Payment processing uses a standard third-party billing provider (e.g., Stripe) — specific provider choice is an implementation detail.
- The 8 supported video script languages cover the majority of the target market. Additional languages can be added post-MVP.
- Background music tracks are pre-curated royalty-free audio. Users cannot upload custom audio in MVP.
- The "Manual Mode" referenced in error messages allows users to type product data directly instead of extracting from a URL — this is a minimal fallback, not a full-featured alternative flow.
- Email delivery (welcome, render complete, etc.) uses a standard transactional email service — specific provider is an implementation detail.
- Data retention follows industry-standard practices: rendered videos are retained indefinitely while the account is active; deleted account data is purged within 30 days.
