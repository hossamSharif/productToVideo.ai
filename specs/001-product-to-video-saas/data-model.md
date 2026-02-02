# Data Model: ProductToVideo.ai

**Date**: 2026-02-02 | **Branch**: `001-product-to-video-saas`

## Entity Relationship Diagram (Text)

```
auth.users (Supabase managed)
  └──> profiles (1:1)
  └──> customers (1:1, private Stripe mapping)
  └──> subscriptions (1:1 active)
  └──> video_projects (1:N)
        └──> rendered_videos (1:N)
  └──> bulk_jobs (1:N)
        └──> bulk_job_items (1:N)
              └──> video_projects (1:1)
  └──> user_usage (1:N, per billing period)

products (Stripe-synced, public read)
  └──> prices (1:N, Stripe-synced, public read)
```

## Tables

### profiles

Extends `auth.users` with application-specific data.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, FK → auth.users.id, ON DELETE CASCADE | User ID |
| full_name | text | | Display name |
| avatar_url | text | | Profile picture URL |
| ui_language | text | DEFAULT 'en', CHECK in ('en','ar') | Interface language preference |
| theme | text | DEFAULT 'system', CHECK in ('dark','light','system') | Theme preference |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**RLS:** Users can SELECT/UPDATE own row only.
**Trigger:** Auto-create on `auth.users` INSERT (extract `full_name` from user metadata).

### customers

Private mapping table linking Supabase users to Stripe customer IDs.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, FK → auth.users.id, ON DELETE CASCADE | User ID |
| stripe_customer_id | text | UNIQUE, NOT NULL | Stripe customer ID |

**RLS:** No public access. Service role only.

### products

Stripe products synced via webhooks.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | text | PK | Stripe product ID |
| active | boolean | | Whether product is active |
| name | text | | Product name |
| description | text | | Product description |
| metadata | jsonb | | Stripe metadata |

**RLS:** Public read. No public write.

### prices

Stripe prices synced via webhooks.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | text | PK | Stripe price ID |
| product_id | text | FK → products.id | Parent product |
| active | boolean | | Whether price is active |
| unit_amount | bigint | | Price in smallest currency unit (cents) |
| currency | text | | e.g., 'usd' |
| type | pricing_type | | 'one_time' or 'recurring' |
| interval | pricing_plan_interval | | 'month' or 'year' |
| interval_count | integer | | e.g., 1 for monthly |
| metadata | jsonb | | Includes `render_limit` for quota |

**RLS:** Public read. No public write.
**Custom types:** `pricing_type ENUM ('one_time','recurring')`, `pricing_plan_interval ENUM ('day','week','month','year')`

### subscriptions

Active subscription state synced from Stripe.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | text | PK | Stripe subscription ID |
| user_id | uuid | FK → auth.users.id | Owning user |
| status | subscription_status | NOT NULL | Current status |
| price_id | text | FK → prices.id | Active price |
| quantity | integer | | Subscription quantity |
| cancel_at_period_end | boolean | | Whether canceled at period end |
| current_period_start | timestamptz | | Billing period start |
| current_period_end | timestamptz | | Billing period end |
| canceled_at | timestamptz | | When cancellation was requested |
| trial_start | timestamptz | | Trial start |
| trial_end | timestamptz | | Trial end |
| created_at | timestamptz | DEFAULT now() | |

**RLS:** Users can SELECT own subscriptions only.
**Custom type:** `subscription_status ENUM ('trialing','active','canceled','incomplete','incomplete_expired','past_due','unpaid','paused')`

### user_usage

Application-side usage tracking per billing period.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users.id, NOT NULL | |
| billing_period | text | NOT NULL | e.g., '2026-02' |
| renders_used | integer | DEFAULT 0, NOT NULL | Renders consumed this period |
| renders_limit | integer | NOT NULL | Max renders from plan tier |
| overage_renders | integer | DEFAULT 0, NOT NULL | Overage renders billed via Stripe |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**RLS:** Users can SELECT/UPDATE own rows.
**Unique:** `(user_id, billing_period)`
**Index:** `user_id`, `billing_period`

### video_projects

Represents a single video generation session.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users.id, NOT NULL | Owning user |
| source_url | text | | Original product URL |
| product_name | text | NOT NULL | Extracted or edited product name |
| product_description | text | | Product description |
| product_price | numeric(12,2) | | Product price |
| product_currency | text | | Currency code (e.g., 'USD', 'SAR') |
| product_images | text[] | | Array of image URLs |
| detected_language | text | | ISO 639-3 language code |
| script_hook | text | | AI-generated hook line |
| script_features | text[] | | Feature highlight lines |
| script_price_callout | text | | Price callout line |
| script_cta | text | | Call-to-action line |
| template_id | text | | Selected template identifier |
| primary_color | text | | Hex color |
| secondary_color | text | | Hex color |
| background_color | text | | Hex color |
| music_track_id | text | | Selected music track |
| bulk_job_id | uuid | FK → bulk_jobs.id, nullable | Parent bulk job (if any) |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**RLS:** Users can SELECT/INSERT/UPDATE/DELETE own rows.
**Index:** `user_id`, `created_at DESC`

### rendered_videos

Individual rendered output files per format.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| project_id | uuid | FK → video_projects.id, NOT NULL, ON DELETE CASCADE | Parent project |
| format | text | NOT NULL, CHECK in ('9:16','1:1','16:9') | Export format |
| status | render_status | DEFAULT 'queued', NOT NULL | Render progress |
| file_path | text | | Storage path in Supabase Storage |
| file_size_bytes | bigint | | Rendered file size |
| render_duration_ms | integer | | How long rendering took |
| error_message | text | | Error details if failed |
| created_at | timestamptz | DEFAULT now() | |
| completed_at | timestamptz | | When rendering finished |

**RLS:** Users can SELECT/DELETE via parent video_project ownership join.
**Custom type:** `render_status ENUM ('queued','rendering','complete','failed')`
**Index:** `project_id`, `status`

### bulk_jobs

Batch video generation requests.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users.id, NOT NULL | Owning user |
| template_id | text | | Template applied to all items |
| export_formats | text[] | | Selected formats for all items |
| status | bulk_status | DEFAULT 'processing', NOT NULL | Overall job status |
| total_items | integer | NOT NULL | Total URLs in batch |
| completed_items | integer | DEFAULT 0 | Finished count |
| failed_items | integer | DEFAULT 0 | Failed count |
| created_at | timestamptz | DEFAULT now() | |
| completed_at | timestamptz | | |

**RLS:** Users can SELECT/INSERT/UPDATE/DELETE own rows.
**Custom type:** `bulk_status ENUM ('processing','rendering','complete','partial_failure')`

### bulk_job_items

Individual items within a bulk job.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| bulk_job_id | uuid | FK → bulk_jobs.id, NOT NULL, ON DELETE CASCADE | Parent bulk job |
| source_url | text | NOT NULL | Product URL |
| status | text | DEFAULT 'pending' | 'pending','extracting','extracted','failed','rendering','complete' |
| error_message | text | | Error reason if failed |
| project_id | uuid | FK → video_projects.id, nullable | Created after successful extraction |
| created_at | timestamptz | DEFAULT now() | |

**RLS:** Via parent bulk_job ownership.
**Index:** `bulk_job_id`

## Supabase Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `rendered-videos` | Private (signed URLs) | Rendered MP4 files |
| `product-images` | Private | Uploaded/extracted product images |
| `avatars` | Public | User profile pictures |

## State Transitions

### Render Status
```
queued → rendering → complete
                   → failed (→ queued via retry)
```

### Subscription Status (Stripe-managed)
```
incomplete → active → canceled
                    → past_due → active (payment retry)
                               → canceled
active → paused → active
```

### Bulk Job Status
```
processing → rendering → complete
                       → partial_failure
```
