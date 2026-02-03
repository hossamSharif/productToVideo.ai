import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ renderId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { renderId } = await params;

  // Query rendered_videos and verify ownership through video_projects join
  const { data: render, error } = await supabase
    .from('rendered_videos')
    .select('id, status, progress, download_url, file_size_bytes, error_message, project_id, video_projects!inner(user_id)')
    .eq('id', renderId)
    .single();

  if (error || !render) {
    return NextResponse.json(
      { success: false, error: 'NOT_FOUND', message: 'Render not found' },
      { status: 404 },
    );
  }

  // Verify the render belongs to the authenticated user
  const project = render.video_projects as unknown as { user_id: string };
  if (project.user_id !== user.id) {
    return NextResponse.json(
      { success: false, error: 'NOT_FOUND', message: 'Render not found' },
      { status: 404 },
    );
  }

  // Build response based on status
  const response: Record<string, unknown> = {
    id: render.id,
    status: render.status,
    progress: render.progress ?? 0,
  };

  if (render.status === 'complete') {
    // Create a signed URL from Supabase Storage with 1 hour expiry
    const storagePath = `${user.id}/${renderId}`;
    const { data: signedUrlData } = await supabase.storage
      .from('rendered-videos')
      .createSignedUrl(storagePath, 3600);

    response.download_url = signedUrlData?.signedUrl ?? render.download_url;
    response.file_size_bytes = render.file_size_bytes;
  }

  if (render.status === 'failed') {
    response.error_message = render.error_message;
  }

  return NextResponse.json({ success: true, ...response });
}
