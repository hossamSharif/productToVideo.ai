# API Contracts: ProductToVideo.ai

**Date**: 2026-02-02 | **Branch**: `001-product-to-video-saas`

All endpoints are Next.js App Router API routes under `app/api/`.

## Authentication

All dashboard API routes require a valid Supabase session. The middleware refreshes tokens automatically. API routes create a server Supabase client from cookies.

Webhook endpoints (`/api/webhooks/stripe`) are excluded from auth.

---

## POST /api/extract-product

Extract product data from a URL.

**Request:**
```json
{
  "url": "https://store.com/products/example"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "Premium Wireless Headphones",
    "description": "Noise-cancelling headphones with 30hr battery",
    "price": 99.99,
    "currency": "USD",
    "images": ["https://cdn.store.com/img1.jpg", "https://cdn.store.com/img2.jpg"],
    "language": "eng",
    "source_platform": "shopify",
    "extraction_method": "json-ld"
  }
}
```

**Response (422):**
```json
{
  "success": false,
  "error": "NO_PRODUCT_DATA",
  "message": "We couldn't find product data at this URL."
}
```

**Error codes:** `INVALID_URL`, `NO_PRODUCT_DATA`, `PAGE_REQUIRES_AUTH`, `TIMEOUT`, `EXTRACTION_FAILED`

---

## POST /api/generate-script

Generate an AI video script from product data.

**Request:**
```json
{
  "productName": "Premium Wireless Headphones",
  "description": "Noise-cancelling headphones with 30hr battery",
  "price": 99.99,
  "currency": "USD",
  "language": "eng"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hook": "Tired of noisy commutes?",
    "featureLines": [
      "Active noise cancellation blocks out the world",
      "30-hour battery lasts your entire week",
      "Premium comfort with memory foam cushions"
    ],
    "priceCallout": "All for just $99.99",
    "cta": "Order yours today — free shipping!"
  }
}
```

**Response (503):** AI service unavailable — returns raw description as fallback.
```json
{
  "success": true,
  "fallback": true,
  "data": {
    "hook": "Premium Wireless Headphones",
    "featureLines": ["Noise-cancelling headphones with 30hr battery"],
    "priceCallout": "$99.99",
    "cta": "Shop now"
  }
}
```

---

## POST /api/render-video

Start rendering a video project.

**Request:**
```json
{
  "projectId": "uuid",
  "formats": ["9:16", "1:1"]
}
```

**Response (202):**
```json
{
  "success": true,
  "renders": [
    { "id": "uuid", "format": "9:16", "status": "queued" },
    { "id": "uuid", "format": "1:1", "status": "queued" }
  ]
}
```

**Error (403):** Quota exceeded.
```json
{
  "success": false,
  "error": "QUOTA_EXCEEDED",
  "message": "You've used all 50 renders this month.",
  "renders_used": 50,
  "renders_limit": 50,
  "overage_price_cents": 50
}
```

---

## GET /api/render-video/[renderId]/status

Poll render progress.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "rendering",
  "progress": 65,
  "estimated_remaining_ms": 12000
}
```

Status values: `queued`, `rendering`, `complete`, `failed`

When complete:
```json
{
  "id": "uuid",
  "status": "complete",
  "progress": 100,
  "download_url": "https://project.supabase.co/storage/v1/object/sign/rendered-videos/...",
  "file_size_bytes": 5242880
}
```

---

## POST /api/create-checkout-session

Create a Stripe Checkout session for subscription.

**Request:**
```json
{
  "priceId": "price_xxx"
}
```

**Response (200):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_xxx"
}
```

---

## POST /api/create-portal-session

Create a Stripe Customer Portal session for plan management.

**Request:** (empty body, user identified from session)

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/p/session/bps_xxx"
}
```

---

## POST /api/webhooks/stripe

Stripe webhook handler. No auth required — verified via signature.

**Handled events:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Response:** Always `200 { received: true }`

---

## POST /api/bulk-extract

Extract product data from multiple URLs.

**Request:**
```json
{
  "urls": [
    "https://store1.com/product-a",
    "https://store2.com/product-b"
  ]
}
```

**Validation:** Max 20 URLs.

**Response (200):**
```json
{
  "bulkJobId": "uuid",
  "results": [
    {
      "url": "https://store1.com/product-a",
      "status": "success",
      "data": { "name": "...", "price": 29.99, "currency": "USD", "images": [...], "language": "eng" }
    },
    {
      "url": "https://store2.com/product-b",
      "status": "failed",
      "error": "TIMEOUT"
    }
  ]
}
```

---

## POST /api/bulk-render

Start rendering all items in a bulk job.

**Request:**
```json
{
  "bulkJobId": "uuid",
  "templateId": "BoldSale",
  "formats": ["9:16"]
}
```

**Response (202):**
```json
{
  "success": true,
  "bulkJobId": "uuid",
  "total_items": 4,
  "status": "rendering"
}
```

---

## GET /api/bulk-render/[bulkJobId]/status

Poll bulk job progress.

**Response (200):**
```json
{
  "bulkJobId": "uuid",
  "status": "rendering",
  "total_items": 4,
  "completed_items": 2,
  "failed_items": 0,
  "items": [
    { "url": "...", "status": "complete", "download_url": "..." },
    { "url": "...", "status": "complete", "download_url": "..." },
    { "url": "...", "status": "rendering", "progress": 45 },
    { "url": "...", "status": "queued" }
  ]
}
```
