import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { extractProduct, ExtractionError } from '@/lib/scraper/extract';

const ERROR_STATUS_MAP: Record<string, number> = {
  INVALID_URL: 400,
  NO_PRODUCT_DATA: 422,
  PAGE_REQUIRES_AUTH: 403,
  TIMEOUT: 408,
  EXTRACTION_FAILED: 500,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { url: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'INVALID_URL', message: 'Invalid request body' },
      { status: 400 },
    );
  }

  // Validate URL format
  try {
    new URL(body.url);
  } catch {
    return NextResponse.json(
      { success: false, error: 'INVALID_URL', message: 'The provided URL is not valid' },
      { status: 400 },
    );
  }

  try {
    const data = await extractProduct(body.url);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ExtractionError) {
      const status = ERROR_STATUS_MAP[error.code] ?? 500;
      return NextResponse.json(
        { success: false, error: error.code, message: error.message },
        { status },
      );
    }

    return NextResponse.json(
      { success: false, error: 'EXTRACTION_FAILED', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
