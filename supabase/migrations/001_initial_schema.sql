-- ProductToVideo.ai Initial Schema
-- Custom Types
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
CREATE TYPE render_status AS ENUM ('queued', 'rendering', 'complete', 'failed');
CREATE TYPE bulk_status AS ENUM ('processing', 'rendering', 'complete', 'partial_failure');

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  ui_language text NOT NULL DEFAULT 'en' CHECK (ui_language IN ('en', 'ar')),
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('dark', 'light', 'system')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- customers (private Stripe mapping)
-- ============================================================
CREATE TABLE customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE NOT NULL
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- No public access policies; service role only

-- ============================================================
-- products (Stripe-synced)
-- ============================================================
CREATE TABLE products (
  id text PRIMARY KEY,
  active boolean,
  name text,
  description text,
  metadata jsonb
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT USING (true);

-- ============================================================
-- prices (Stripe-synced)
-- ============================================================
CREATE TABLE prices (
  id text PRIMARY KEY,
  product_id text REFERENCES products(id),
  active boolean,
  unit_amount bigint,
  currency text,
  type pricing_type,
  "interval" pricing_plan_interval,
  interval_count integer,
  metadata jsonb
);

ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prices are publicly readable"
  ON prices FOR SELECT USING (true);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  status subscription_status NOT NULL,
  price_id text REFERENCES prices(id),
  quantity integer,
  cancel_at_period_end boolean,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- ============================================================
-- user_usage
-- ============================================================
CREATE TABLE user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  billing_period text NOT NULL,
  renders_used integer NOT NULL DEFAULT 0,
  renders_limit integer NOT NULL,
  overage_renders integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, billing_period)
);

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON user_usage FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON user_usage FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_billing_period ON user_usage(billing_period);

CREATE TRIGGER user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- video_projects
-- ============================================================
CREATE TABLE video_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  source_url text,
  product_name text NOT NULL,
  product_description text,
  product_price numeric(12,2),
  product_currency text,
  product_images text[],
  detected_language text,
  script_hook text,
  script_features text[],
  script_price_callout text,
  script_cta text,
  template_id text,
  primary_color text,
  secondary_color text,
  background_color text,
  music_track_id text,
  bulk_job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON video_projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON video_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON video_projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON video_projects FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_video_projects_user_id ON video_projects(user_id);
CREATE INDEX idx_video_projects_created_at ON video_projects(created_at DESC);

CREATE TRIGGER video_projects_updated_at
  BEFORE UPDATE ON video_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- rendered_videos
-- ============================================================
CREATE TABLE rendered_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  format text NOT NULL CHECK (format IN ('9:16', '1:1', '16:9')),
  status render_status NOT NULL DEFAULT 'queued',
  file_path text,
  file_size_bytes bigint,
  render_duration_ms integer,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE rendered_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rendered videos"
  ON rendered_videos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM video_projects vp WHERE vp.id = rendered_videos.project_id AND vp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own rendered videos"
  ON rendered_videos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM video_projects vp WHERE vp.id = rendered_videos.project_id AND vp.user_id = auth.uid()
  ));

CREATE INDEX idx_rendered_videos_project_id ON rendered_videos(project_id);
CREATE INDEX idx_rendered_videos_status ON rendered_videos(status);

-- ============================================================
-- bulk_jobs
-- ============================================================
CREATE TABLE bulk_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  template_id text,
  export_formats text[],
  status bulk_status NOT NULL DEFAULT 'processing',
  total_items integer NOT NULL,
  completed_items integer NOT NULL DEFAULT 0,
  failed_items integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE bulk_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bulk jobs"
  ON bulk_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bulk jobs"
  ON bulk_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bulk jobs"
  ON bulk_jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bulk jobs"
  ON bulk_jobs FOR DELETE USING (auth.uid() = user_id);

-- Add FK from video_projects to bulk_jobs (deferred due to creation order)
ALTER TABLE video_projects
  ADD CONSTRAINT fk_video_projects_bulk_job
  FOREIGN KEY (bulk_job_id) REFERENCES bulk_jobs(id);

-- ============================================================
-- bulk_job_items
-- ============================================================
CREATE TABLE bulk_job_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_job_id uuid NOT NULL REFERENCES bulk_jobs(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  project_id uuid REFERENCES video_projects(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bulk_job_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bulk job items"
  ON bulk_job_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bulk_jobs bj WHERE bj.id = bulk_job_items.bulk_job_id AND bj.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own bulk job items"
  ON bulk_job_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM bulk_jobs bj WHERE bj.id = bulk_job_items.bulk_job_id AND bj.user_id = auth.uid()
  ));

CREATE INDEX idx_bulk_job_items_bulk_job_id ON bulk_job_items(bulk_job_id);

-- ============================================================
-- Storage Buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('rendered-videos', 'rendered-videos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload rendered videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'rendered-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own rendered videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'rendered-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own rendered videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'rendered-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
