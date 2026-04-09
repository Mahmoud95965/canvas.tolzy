import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL || 'sourceful/riverflow-v2-fast';

async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];

  try {
    if (!adminAuth) return null;
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

function extractImageUrl(apiResponse: any): string | null {
  const data = apiResponse?.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0];
  if (typeof first?.url === 'string' && first.url.length > 0) return first.url;
  if (typeof first?.b64_json === 'string' && first.b64_json.length > 0) {
    return `data:image/png;base64,${first.b64_json}`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const res = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tolzy.me',
        'X-Title': 'Tolzy Imagen',
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: prompt.trim(),
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenRouter image API error:', errorText);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    const data = await res.json();
    const imageUrl = extractImageUrl(data);

    if (!imageUrl) {
      console.error('OpenRouter image empty response:', data);
      return NextResponse.json({ error: 'No image returned from model' }, { status: 502 });
    }

    return NextResponse.json({
      imageUrl,
      model: IMAGE_MODEL,
    });
  } catch (error: any) {
    console.error('Tolzy Imagen API error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
