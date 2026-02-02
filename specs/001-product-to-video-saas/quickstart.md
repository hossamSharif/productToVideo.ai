# Quickstart: ProductToVideo.ai

**Date**: 2026-02-02 | **Branch**: `001-product-to-video-saas`

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase account + project
- Stripe account (test mode)
- Anthropic API key (for Claude Haiku)

## 1. Initialize Next.js 15 Project

```bash
pnpm create next-app@latest producttovideo --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd producttovideo
```

## 2. Install Core Dependencies

```bash
# UI & Styling
pnpm add @radix-ui/react-slot clsx tailwind-merge class-variance-authority
pnpm add next-themes
pnpm add motion                         # Framer Motion

# Internationalization
pnpm add next-intl

# Authentication & Database
pnpm add @supabase/ssr @supabase/supabase-js

# Video Engine
pnpm add remotion @remotion/cli @remotion/player
pnpm add -D @remotion/bundler           # Build-time only

# AI
pnpm add @anthropic-ai/sdk

# Scraping
pnpm add puppeteer-core @sparticuz/chromium-min
pnpm add -D puppeteer                   # Local dev only
pnpm add franc                          # Language detection

# Payments
pnpm add stripe

# Email
pnpm add resend @react-email/components

# URL state
pnpm add nuqs
```

## 3. Initialize shadcn/ui

```bash
pnpm dlx shadcn@latest init
# Select: New York style, Slate base color, CSS variables: yes

# Install required components
pnpm dlx shadcn@latest add button input card dialog dropdown-menu select tabs toast accordion sheet tooltip avatar badge progress skeleton separator
```

## 4. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Resend
RESEND_API_KEY=re_...

# Chromium (for scraping in production)
CHROMIUM_REMOTE_URL=https://github.com/nicolo-ribaudo/nicolo-nicolo/releases/download/1.0.0/chromium-v131-pack.tar
```

## 5. Project Structure Setup

```bash
# Create directory structure
mkdir -p src/app/[locale]/{(marketing),(auth)/{login,signup,reset-password},(dashboard)/{new-video,my-videos,bulk,settings}}
mkdir -p src/app/api/{extract-product,generate-script,render-video,webhooks/stripe,create-checkout-session,create-portal-session,bulk-extract,bulk-render}
mkdir -p src/components/{ui,landing,dashboard,editor,auth,shared}
mkdir -p src/lib/{supabase,stripe,scraper,ai,utils}
mkdir -p src/remotion/{compositions,components}
mkdir -p src/messages src/styles src/hooks src/types
mkdir -p src/i18n
mkdir -p supabase/migrations
```

## 6. Configure next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@remotion/renderer'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.shopify.com' },
    ],
  },
};

const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

module.exports = withNextIntl(nextConfig);
```

## 7. Supabase Setup

```bash
# Install Supabase CLI
pnpm add -D supabase

# Initialize (creates supabase/ directory)
pnpm supabase init

# Link to your project
pnpm supabase link --project-ref YOUR_PROJECT_REF

# Create initial migration
pnpm supabase migration new initial_schema
```

## 8. Stripe Setup

1. Create three Products in Stripe Dashboard:
   - **Starter** ($19/mo) — metadata: `{ "render_limit": "10" }`
   - **Growth** ($49/mo) — metadata: `{ "render_limit": "50" }`
   - **Scale** ($99/mo) — metadata: `{ "render_limit": "200" }`

2. Configure Customer Portal in Stripe Dashboard (Settings > Billing > Customer Portal)

3. Set up webhook endpoint:
   ```bash
   # Local development
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Add webhook endpoint in Stripe Dashboard for production:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

## 9. Development Commands

```bash
# Start Next.js dev server
pnpm dev

# Start Remotion Studio (separate terminal)
pnpm remotion studio src/remotion/index.ts

# Build Remotion bundle (for rendering)
pnpm remotion bundle src/remotion/index.ts --out-dir remotion-bundle

# Run Supabase locally
pnpm supabase start

# Generate types from Supabase schema
pnpm supabase gen types --lang=typescript --local > src/types/supabase.ts
```

## 10. Deployment Notes

- **Frontend**: Vercel (recommended) or any Node.js host
- **Rendering service**: Self-hosted VPS/container with Chromium + FFmpeg installed (cannot run on Vercel due to binary size limits)
- **Database**: Supabase managed PostgreSQL
- **Storage**: Supabase Storage (rendered videos bucket with signed URLs)
- If deploying everything on one server, API routes handle rendering directly
- If splitting: Next.js on Vercel, rendering on a separate Docker container
