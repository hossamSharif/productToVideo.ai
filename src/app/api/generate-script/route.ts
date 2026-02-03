import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { generateScript } from '@/lib/ai/generate-script';
import type { VideoScript } from '@/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    productName: string;
    description: string;
    price: string;
    currency: string;
    language: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'INVALID_BODY', message: 'Invalid request body' },
      { status: 400 },
    );
  }

  try {
    const result = await generateScript(body);

    // If the result includes a fallback flag, surface it in the response
    if (result && typeof result === 'object' && 'fallback' in result && result.fallback) {
      return NextResponse.json({ success: true, fallback: true, data: result as VideoScript });
    }

    return NextResponse.json({ success: true, data: result as VideoScript });
  } catch {
    // If generateScript throws completely, return 503 with fallback data
    const fallbackData: VideoScript = {
      scenes: [
        {
          type: 'intro',
          text: body.productName,
          duration: 3,
        },
        {
          type: 'features',
          text: body.description,
          duration: 5,
        },
        {
          type: 'pricing',
          text: `${body.currency} ${body.price}`,
          duration: 3,
        },
        {
          type: 'outro',
          text: body.productName,
          duration: 2,
        },
      ],
    };

    return NextResponse.json(
      { success: true, fallback: true, data: fallbackData },
      { status: 503 },
    );
  }
}
