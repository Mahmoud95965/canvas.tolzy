import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import {
  OPENROUTER_DEFAULT_MODEL,
  openRouterPostChatCompletionsWithRetry,
  UPSTREAM_CONGESTION_USER_MESSAGE_AR,
} from '@/lib/openrouter-defaults';
import dns from 'node:dns';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function openRouterCodeModel(): string {
  return process.env.OPENROUTER_CODE_MODEL?.trim() || OPENROUTER_DEFAULT_MODEL;
}

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

function sseTokenStream() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>) {
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
          } catch {
            /* skip malformed chunk */
          }
        }
      }
    },
    flush(controller: TransformStreamDefaultController<Uint8Array>) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data: ') && !trimmed.includes('[DONE]')) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          const content = data.choices?.[0]?.delta?.content;
          if (content) controller.enqueue(encoder.encode(content));
        } catch {
          /* skip */
        }
      }
    },
  });
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

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    let res: Response;
    try {
      res = await openRouterPostChatCompletionsWithRetry(openRouterKey, {
        model: openRouterCodeModel(),
        stream: true,
        max_tokens: 8192,
        temperature: 0.2,
        top_p: 0.9,
        messages,
      });
    } catch (e) {
      if (e instanceof Error && e.message === 'OPENROUTER_RATE_LIMIT') {
        return NextResponse.json(
          { error: 'UPSTREAM_RATE_LIMIT', message: UPSTREAM_CONGESTION_USER_MESSAGE_AR },
          { status: 429 }
        );
      }
      console.error('OpenRouter generate error:', e);
      return NextResponse.json({ error: 'AI connection failed. Check your network.' }, { status: 500 });
    }

    if (!res.body) {
      return NextResponse.json({ error: 'Empty response stream' }, { status: 500 });
    }

    return new Response(res.body.pipeThrough(sseTokenStream()), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: unknown) {
    console.error('Generate route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
