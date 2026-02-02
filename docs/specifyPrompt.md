
---

Build "ProductToVideo.ai" — a SaaS web application that allows e-commerce sellers worldwide to generate professional product promotional videos by simply pasting any product URL from any online store. The system auto-extracts product data, detects the product's language, generates a compelling video script using AI, lets the user pick and customize a video template, and renders a downloadable MP4 video — all within 60 seconds and with zero video editing skills required.

## Product Overview & Why It Exists

Millions of e-commerce sellers on platforms like Shopify, WooCommerce, Salla, Zid, Amazon, and Etsy need product videos daily for social media (Instagram Reels, TikTok, YouTube Shorts). They cannot afford video agencies ($100–500 per video) and don't have time or skills to use traditional video editors. Existing tools are English-only, require manual data entry, and produce inconsistent results.

ProductToVideo.ai solves this by turning any product URL into a branded, professional video — in the product's own language — with one click.

## Application Structure

The application has two main areas:

1. **Marketing Website (Landing Page)** — public-facing page to explain, demonstrate, and convert visitors into users.
2. **Application Dashboard** — authenticated area where users generate, edit, preview, manage, and download their videos.

---

## AREA 1: Marketing Website (Landing Page)

The landing page is a single scrollable page with the following sections in order:

### Section 1: Hero Section
- **Headline**: A bold, clear headline communicating the core value proposition: paste a product URL, get a professional video in seconds.
- **Subtitle**: A supporting line explaining that it works with any e-commerce store, auto-detects language, and requires zero editing skills. Mention the supported language count (8+ languages).
- **Primary CTA Button**: "Generate Your First Video — Free" which links to the signup/app.
- **Secondary CTA**: "Watch How It Works" which smooth-scrolls down to the showcase section.
- **Trust Indicators**: Small text or badges below the CTAs showing "Works with Shopify, WooCommerce, Salla, Zid, Amazon, Etsy & more" with subtle platform logo icons.

### Section 2: Animated Product Showcase (directly below the hero)
This is the most important visual element on the landing page. It is an **auto-playing, infinitely looping animated component** that demonstrates how the product works without any user interaction. The showcase must be self-contained and visually captivating.

The animated showcase cycles through the following sequence continuously:

- **Scene 1 — URL Input** (3 seconds): Shows a simulated browser input field. A product URL types itself character-by-character into the field (typing animation). Then a "Generate" button animates a click state.
- **Scene 2 — Data Extraction** (3 seconds): The URL dissolves and product data appears — a product image fades in, a product name types itself out, a price appears, and a language badge animates in (e.g., "🌐 English detected"). Checkmarks appear next to each extracted item one by one.
- **Scene 3 — Template Selection** (3 seconds): Three video template thumbnails slide in from below. The middle one gets a highlight border and a "Selected" badge animates onto it.
- **Scene 4 — Video Preview** (4 seconds): A simulated video player shows a mini product video playing — with text animations, product image transitions, and a price reveal. A timeline scrubber moves across the bottom.
- **Scene 5 — Export Ready** (3 seconds): Three format badges (9:16, 1:1, 16:9) appear with checkmarks. A "Download MP4" button pulses. Confetti or success particles animate briefly.
- The entire sequence then loops back to Scene 1 seamlessly with a fade transition.

This showcase component should work without any user interaction — it runs on its own as an eye-catching demonstration.

### Section 3: How It Works
Four-step breakdown with icons and short descriptions:
1. Paste any product URL
2. AI detects language and generates script
3. Pick a template and customize
4. Render and download in seconds

### Section 4: Supported Platforms
A visual grid or scrolling logo strip showing e-commerce platform logos that ProductToVideo.ai works with: Shopify, WooCommerce, Salla, Zid, Amazon, Etsy, Noon, Wix, Squarespace, BigCommerce, and a "+any store with a product page" label.

### Section 5: Supported Languages
Display the 8 launch languages with their native names and flag indicators:
- English, Arabic (العربية), Spanish (Español), French (Français), Portuguese (Português), German (Deutsch), Turkish (Türkçe), Indonesian (Bahasa Indonesia).
- Include a note: "Language auto-detected from your product page. You can always override."

### Section 6: Video Template Gallery
Show 5 preview thumbnails of different video template styles (Minimal Luxury, Bold Sale, Product Showcase, Story Swipe, Clean Modern). Each thumbnail should show a static preview image representing the template's visual style. Clicking a template thumbnail does nothing on the landing page — it's for display only.

### Section 7: Pricing
Three pricing tiers displayed as cards side by side:

**Starter — $19/month:**
- 10 video renders per month
- 5 templates
- 720p export quality
- Auto language detection
- Watermarked output

**Growth — $49/month (highlighted as "Most Popular"):**
- 50 video renders per month
- All templates
- 1080p export quality
- No watermark
- Multi-format export (9:16, 1:1, 16:9)
- AI-generated script editing

**Scale — $99/month:**
- 200 video renders per month
- All templates including premium
- 4K export quality
- No watermark
- Multi-format export
- Priority render queue
- Bulk URL processing (up to 20 URLs at once)

Each card has a "Get Started" CTA button. Overage renders cost $0.50 each beyond the plan limit — display this as a small note below the pricing cards.

### Section 8: FAQ
At least 6 frequently asked questions with expandable/collapsible answers:
- What platforms does it work with?
- How does language detection work?
- How long does it take to generate a video?
- Can I edit the AI-generated script?
- What video formats are supported?
- Is there a free trial?

### Section 9: Footer
Standard footer with: logo, navigation links (Home, Pricing, FAQ, Login, Sign Up), social media links, legal links (Privacy Policy, Terms of Service), and copyright notice.

### Landing Page Header/Navigation
Sticky top navigation bar with: logo on the left, navigation links (How It Works, Templates, Pricing, FAQ) in the center that smooth-scroll to their sections, language switcher (EN/AR) on the right, and "Login" and "Get Started" buttons on the right.

---

## AREA 2: Application Dashboard (Authenticated)

### Authentication
- **Sign Up**: Email + password registration. After signup, user is directed to the dashboard.
- **Login**: Email + password login.
- **Forgot Password**: Standard email-based password reset flow.
- No social login in this phase.

### Dashboard Layout
The dashboard uses a sidebar navigation layout:
- **Sidebar** (left side, collapsible on mobile): Contains navigation links — New Video, My Videos, Bulk Generate, Account Settings. Shows the user's current plan name and remaining render count (e.g., "Growth Plan — 38/50 renders left").
- **Main Content Area** (right side): Displays the content for the selected navigation item.
- **Top Bar**: Shows the ProductToVideo.ai logo, a language switcher (EN/AR), a theme toggle (dark/light), and the user's avatar with a dropdown menu (Settings, Billing, Logout).

### Page: New Video (Quick Mode) — This is the core feature

This is the primary user flow and the heart of the application:

**Step 1 — URL Input:**
- A prominent input field with placeholder text "Paste any product URL..."
- A "Generate" button next to the input.
- Below the input: small helper text "Works with Shopify, WooCommerce, Salla, Zid, Amazon, Etsy & more"
- When the user pastes a URL and clicks Generate, the system processes the URL.
- Show a loading state while processing.

**Step 2 — Product Data Review:**
After processing, display the extracted product data for user review:
- Product image(s) — displayed as thumbnails. If multiple images are found, show all. User can select which images to include in the video.
- Product name — editable text field, pre-filled with extracted name.
- Product price — editable text field, pre-filled with extracted price and currency.
- Product description — editable text area, pre-filled with extracted description.
- Detected language — shown as a badge/pill (e.g., "🌐 French detected"). Next to it, a dropdown that allows the user to override the language to any of the 8 supported languages.
- AI-generated script — the system generates a 15-second video script in the detected language. Displayed in an editable text area so the user can modify it. The script should include: a hook/opening line, 2-3 feature highlight lines, a price callout, and a CTA (call to action).
- A "Regenerate Script" button that asks the AI to create a new script variation.
- A "Next: Choose Template" button to proceed.

**Step 3 — Template Selection:**
- Display 5 video template options as visual cards.
- Each template card shows: a static preview thumbnail representing the template's visual style, the template name, and a short description of when to use it (e.g., "Best for luxury/premium products").
- The 5 MVP templates are:
  1. **Minimal Luxury** — clean, white/dark background, elegant typography, slow fade transitions.
  2. **Bold Sale** — vibrant colors, large price text, energetic zoom transitions, urgency-focused.
  3. **Product Showcase** — centered product image with rotating angles, subtle background, feature text overlays.
  4. **Story Swipe** — vertical format optimized, slide-left transitions between scenes, Instagram Story aesthetic.
  5. **Clean Modern** — neutral tones, sans-serif typography, smooth slide-up animations, professional feel.
- Clicking a template selects it (visual highlight/border).
- A "Next: Customize" button to proceed.

**Step 4 — Video Editor & Live Preview:**
This is a split-screen view:
- **Left side (60% width)**: Live video preview player. The video plays in real-time showing the current template with the user's product data applied. The user can play/pause, scrub through the timeline, and see changes reflected instantly as they edit on the right side.
- **Right side (40% width)**: Editing controls organized in collapsible panels:
  - **Text Panel**: Edit the script text for each scene. Each scene is a separate editable field.
  - **Colors Panel**: Choose primary color, secondary color, and background color. Provide a color picker and 6 preset brand color palettes.
  - **Images Panel**: Reorder product images via drag-and-drop. Toggle which images appear in which scenes.
  - **Music Panel**: Choose from 5 royalty-free background music tracks. Each track has a play/preview button and a name/mood label (e.g., "Upbeat", "Elegant", "Energetic", "Calm", "Trendy"). User can also choose "No Music."
  - **Language Panel**: Shows current language. User can switch language here, which triggers the AI to regenerate the script in the new language and updates the font and text direction accordingly.
- Below the preview player: a timeline bar showing the video duration (15 seconds) with scene markers.
- A "Render Video" button prominently placed.

**Step 5 — Export Format Selection:**
Before rendering, a modal or inline section appears asking the user to select export formats:
- **9:16 Vertical** (Reels, TikTok, Stories) — checkbox, on by default.
- **1:1 Square** (Instagram Feed, X/Twitter) — checkbox, off by default.
- **16:9 Horizontal** (YouTube, Website) — checkbox, off by default.
- Display a note: "Each format counts as 1 render from your plan."
- A "Start Rendering" confirmation button.

**Step 6 — Rendering Progress:**
- Show a rendering progress screen with:
  - A circular or linear progress indicator with percentage.
  - Estimated time remaining.
  - Which formats are being rendered (with individual progress per format).
  - The user can navigate away — rendering continues in the background.
- When complete:
  - Show a success state with preview thumbnails of each rendered format.
  - "Download" button for each format (downloads MP4 file).
  - "Download All as ZIP" button if multiple formats were rendered.
  - "Generate Another Video" button to start over.
  - The rendered videos are saved to "My Videos" automatically.

### Page: My Videos
- A grid/list view of all previously generated videos.
- Each video card shows: a thumbnail preview, the product name, the date generated, the language used, and which formats were rendered.
- Actions per video: Download (with format selection), Delete, Re-edit (opens the video in the editor with the original settings pre-loaded).
- Sorting options: by date (newest first as default), by product name.
- Search/filter: a text search field that filters by product name.
- If no videos exist yet, show an empty state with a CTA to create the first video.

### Page: Bulk Generate
- A text area where the user can paste multiple product URLs, one per line.
- Alternatively, a file upload button to upload a CSV file containing a column of product URLs.
- After pasting/uploading, the system processes all URLs and displays a table:
  - Columns: #, Product Image (thumbnail), Product Name, Price, Detected Language, Status (Success/Failed).
  - Failed URLs show an error indicator and reason (e.g., "Could not extract product data").
  - User can remove failed rows.
- User selects a single template to apply to all products.
- User selects export format(s) to apply to all products.
- A "Generate All Videos" button starts batch rendering.
- Batch progress view: shows all videos in a list with individual progress bars. Overall progress displayed at the top.
- When complete: "Download All as ZIP" button and individual download options.
- Maximum 20 URLs per batch in the MVP.

### Page: Account Settings
- **Profile**: Edit name, email. Change password.
- **Subscription**: Shows current plan, renders used this month, renders remaining. A "Change Plan" button linking to the pricing plans. Upgrade/downgrade flow.
- **Billing**: Payment method management. Invoice history with download links.
- **Danger Zone**: Delete account (with confirmation dialog).

---

## Global Requirements (apply to the entire application)

### Multi-Language UI (Internationalization)
The entire application UI — both the landing page and the dashboard — must support two interface languages:
- **English (EN)** — left-to-right layout, default.
- **Arabic (AR)** — right-to-left layout. When Arabic is selected, the entire UI mirrors: sidebar moves to the right, text aligns right, navigation order reverses, and all UI labels, buttons, headings, descriptions, error messages, placeholders, tooltips, and system notifications display in Arabic.
- The language switcher is accessible from: the landing page header and the dashboard top bar.
- The user's language preference is persisted across sessions.
- Important: The UI language (English/Arabic) is separate from the video content language (which has 8 options). A user can browse the app in Arabic but generate a video in French.

### Dark Mode & Light Mode
The entire application — landing page and dashboard — must support both a dark theme and a light theme:
- **Light Mode**: Light backgrounds, dark text. Clean, professional appearance.
- **Dark Mode**: Dark backgrounds, light text. Easy on the eyes for extended use.
- A theme toggle control is available in: the landing page header (icon toggle) and the dashboard top bar.
- The user's theme preference is persisted across sessions.
- Default theme follows the user's system/OS preference. User can override.
- All components, cards, modals, forms, badges, and interactive elements must look correct and readable in both themes.

### Responsive Design
- The landing page must be fully responsive: desktop, tablet, and mobile.
- The dashboard must be fully responsive: on mobile, the sidebar collapses into a hamburger menu.
- The video editor on mobile: stacks vertically (preview on top, controls below) instead of the desktop split-screen layout.
- The animated showcase on the landing page should scale down gracefully on mobile — it can simplify its layout but must still auto-play and loop.

### Error Handling & Edge Cases
- If a pasted URL cannot be parsed or no product data is found: show a clear, friendly error message like "We couldn't find product data at this URL. Please check the URL and try again, or use Manual Mode." Offer a link to re-try or enter data manually.
- If the AI script generation fails: show a fallback with the raw product description as the script and let the user edit it.
- If rendering fails: show an error with a "Retry" button. Do not deduct a render from the user's quota if rendering fails.
- If the user has exhausted their monthly render quota: show a clear message explaining they've used all renders. Offer options to upgrade their plan or purchase overage renders at $0.50 each.
- Form validations: all required fields must be validated before proceeding. Show inline error messages.

### Notifications
- In-app toast notifications for: successful video render, failed render, plan limit reached, successful payment, and account changes.
- Email notifications for: welcome email after signup, video render complete (with download link), monthly usage summary, and plan renewal/payment receipt.

---

## Out of Scope for This Phase (explicitly excluded)
- No social media direct publishing (users download the video and upload manually).
- No AI voiceover generation (text-only scripts for now).
- No auto-captioning or subtitle generation.
- No template marketplace or community templates.
- No API access for developers.
- No team/multi-user collaboration.
- No video scheduling or content calendar.
- No mobile native app (web-only, but responsive).
- No social login (Google, Apple, etc.) — email/password only.