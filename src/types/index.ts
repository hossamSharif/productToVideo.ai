export interface ProductData {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  language: string;
  source_platform: string;
  extraction_method: string;
}

export interface VideoScript {
  hook: string;
  featureLines: string[];
  priceCallout: string;
  cta: string;
}

export interface VideoProject {
  id: string;
  user_id: string;
  source_url: string;
  product_name: string;
  product_description: string | null;
  product_price: number | null;
  product_currency: string | null;
  product_images: string[];
  detected_language: string | null;
  script_hook: string | null;
  script_features: string[] | null;
  script_price_callout: string | null;
  script_cta: string | null;
  template_id: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  background_color: string | null;
  music_track_id: string | null;
  bulk_job_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RenderedVideo {
  id: string;
  project_id: string;
  format: "9:16" | "1:1" | "16:9";
  status: "queued" | "rendering" | "complete" | "failed";
  file_path: string | null;
  file_size_bytes: number | null;
  render_duration_ms: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface BulkJob {
  id: string;
  user_id: string;
  template_id: string | null;
  export_formats: string[];
  status: "processing" | "rendering" | "complete" | "partial_failure";
  total_items: number;
  completed_items: number;
  failed_items: number;
  created_at: string;
  completed_at: string | null;
}

export interface BulkJobItem {
  id: string;
  bulk_job_id: string;
  source_url: string;
  status: string;
  error_message: string | null;
  project_id: string | null;
  created_at: string;
}

export type TemplateId =
  | "MinimalLuxury"
  | "BoldSale"
  | "ProductShowcase"
  | "StorySwipe"
  | "CleanModern";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string;
}

export interface MusicTrack {
  id: string;
  name: string;
  duration: number;
  url: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  ui_language: "en" | "ar";
  theme: "dark" | "light" | "system";
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  quantity: number | null;
  cancel_at_period_end: boolean;
  current_period_start: string;
  current_period_end: string;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  billing_period: string;
  renders_used: number;
  renders_limit: number;
  overage_renders: number;
  created_at: string;
  updated_at: string;
}

export type VideoFormat = "9:16" | "1:1" | "16:9";

export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
}
