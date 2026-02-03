import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { projectId: string; formats: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'INVALID_BODY', message: 'Invalid request body' },
      { status: 400 },
    );
  }

  const { projectId, formats } = body;

  if (!projectId || !Array.isArray(formats) || formats.length === 0) {
    return NextResponse.json(
      { success: false, error: 'INVALID_BODY', message: 'projectId and formats are required' },
      { status: 400 },
    );
  }

  // Check quota: query user_usage for the current billing period
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data: usage, error: usageError } = await supabase
    .from('user_usage')
    .select('id, renders_used, renders_limit')
    .eq('user_id', user.id)
    .gte('period_start', periodStart)
    .lte('period_start', periodEnd)
    .single();

  if (usageError || !usage) {
    return NextResponse.json(
      { success: false, error: 'USAGE_NOT_FOUND', message: 'Could not retrieve usage data' },
      { status: 500 },
    );
  }

  const rendersNeeded = formats.length;
  if (usage.renders_used + rendersNeeded > usage.renders_limit) {
    return NextResponse.json(
      {
        success: false,
        error: 'QUOTA_EXCEEDED',
        message: 'Render quota exceeded for this billing period',
        renders_used: usage.renders_used,
        renders_limit: usage.renders_limit,
        overage_price_cents: 50,
      },
      { status: 403 },
    );
  }

  // Create rendered_videos records (one per format) with status 'queued'
  const renderRecords = formats.map((format) => ({
    project_id: projectId,
    user_id: user.id,
    format,
    status: 'queued' as const,
  }));

  const { data: renders, error: insertError } = await supabase
    .from('rendered_videos')
    .insert(renderRecords)
    .select('id, format, status');

  if (insertError || !renders) {
    return NextResponse.json(
      { success: false, error: 'INSERT_FAILED', message: 'Failed to create render records' },
      { status: 500 },
    );
  }

  // Increment renders_used in user_usage
  const { error: updateError } = await supabase
    .from('user_usage')
    .update({ renders_used: usage.renders_used + rendersNeeded })
    .eq('id', usage.id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: 'UPDATE_FAILED', message: 'Failed to update usage' },
      { status: 500 },
    );
  }

  // Start background rendering (placeholder - simulates rendering with setTimeout)
  // In production this would use @remotion/renderer renderMedia
  for (const render of renders) {
    // Update status to 'rendering' and simulate completion
    void (async () => {
      await supabase
        .from('rendered_videos')
        .update({ status: 'rendering' })
        .eq('id', render.id);

      // Simulate rendering delay (5 seconds placeholder)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await supabase
        .from('rendered_videos')
        .update({ status: 'complete' })
        .eq('id', render.id);
    })();
  }

  return NextResponse.json({ success: true, renders }, { status: 202 });
}
