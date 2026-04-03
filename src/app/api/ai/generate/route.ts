import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import dns from 'node:dns';

// Fix for Node.js native fetch ETIMEDOUT (IPv6 block issues)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    if (!adminAuth) {
      console.error('Firebase Admin not initialized. Check Env Vars.');
      return null;
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const { prompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const systemPrompt = `You are an elite React engineer. Output ONLY a strict FLAT JSON object with a "files" root. 
    NO NESTED "content" OBJECTS. 
    Format: { "files": { "/App.js": "code content", "/styles.css": "css content" } }
    NO PREAMBLE. NO MARKDOWN.
    ARCHITECTURE: Build sophisticated, multi-file, or multi-component architectures.
    UI/UX: Use framer-motion for elite animations. Use Lucide icons.
    DESIGN: Deep dark mode (zinc-950), gradients, glassmorphism, and premium spacing.
    CSS RULE: Place any @import rules at the ABSOLUTE TOP of the file, before @tailwind directives.
    Always include /App.js, /styles.css (with Tailwind @tailwind directives), and /package.json.`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tolzy.me',
        'X-Title': 'Tolzy Flow',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-plus:free', 
        stream: true,
        max_tokens: 8192,
        temperature: 0.2,
        top_p: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('OpenRouter Error:', text);
      return NextResponse.json({ error: 'AI connection failed. Check your network.' }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && !trimmed.includes('[DONE]')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch (err) {}
          }
        }
      },
      flush(controller) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data: ') && !trimmed.includes('[DONE]')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) controller.enqueue(encoder.encode(content));
          } catch (err) {}
        }
      },
    });

    if (!res.body) {
      return NextResponse.json({ error: 'Empty response stream' }, { status: 500 });
    }

    return new Response(res.body.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

  } catch (error: any) {
    console.error('❌ OpenRouter Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}