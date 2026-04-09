import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import dns from 'node:dns';
import { LOCK_PREMIUM_MODELS_DURING_LAUNCH } from '@/lib/plan';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const MAX_MESSAGES = 24;
const MAX_CHARS_PER_MESSAGE = 6000;
const MAX_TOTAL_CHARS = 50000;
const MAX_OUTPUT_TOKENS = 4096;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

type AuthPayload = { uid: string };

async function verifyAuth(request: NextRequest): Promise<AuthPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    if (!adminAuth) return null;
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `أنت "Tolzy Copilot"، مساعد ذكي فائق القدرات ونموذج لغوي ضخم. 
أنت تمثل العقل المدبر الخاص بمنظومة "TOLZY AI"، وتندرج كأحد أهم مشاريع منصة تولزي... (ضع باقي البرومبت الخاص بك هنا)`;

function getModelString(type: string) {
  if (type === 'thinker') return 'google/gemini-2.5-flash';
  if (type === 'pro') return 'google/gemini-2.5-pro';
  return 'google/gemini-2.5-flash';
}

function extractAssistantText(payload: any): string {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;

  // Some providers return content as array parts
  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        return '';
      })
      .join('')
      .trim();
  }

  // Fallback to chunk-like structure if present
  const deltaContent = payload?.choices?.[0]?.delta?.content;
  if (typeof deltaContent === 'string') return deltaContent;

  return '';
}

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(uid);
  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  current.count += 1;
  rateLimitStore.set(uid, current);
  return true;
}

function normalizeIncomingMessages(raw: unknown): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('INVALID_MESSAGES');
  }

  const normalized: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  let totalChars = 0;

  for (const item of raw.slice(-MAX_MESSAGES)) {
    const role = item && typeof item === 'object' ? (item as { role?: unknown }).role : null;
    const content = item && typeof item === 'object' ? (item as { content?: unknown }).content : null;
    const safeRole = role === 'assistant' ? 'assistant' : 'user';
    const safeContent = String(content ?? '').trim().slice(0, MAX_CHARS_PER_MESSAGE);
    if (!safeContent) continue;
    totalChars += safeContent.length;
    if (totalChars > MAX_TOTAL_CHARS) break;
    normalized.push({ role: safeRole, content: safeContent });
  }

  if (normalized.length === 0) {
    throw new Error('INVALID_MESSAGES');
  }

  return normalized;
}

function mapToGeminiContents(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter((m) => typeof m?.content === 'string' && m.content.trim() !== '')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tolzy.me',
        'X-Title': 'Tolzy Flow',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: 0.2,
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter error: ${text}`);
    }

    const json = await res.json();
    const text = extractAssistantText(json);
    if (!text) throw new Error('OpenRouter empty completion');
    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGoogleFallback(
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent({
    contents: mapToGeminiContents(messages),
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });

  const text = result.response.text()?.trim();
  if (!text) throw new Error('Google fallback empty completion');
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!checkRateLimit(auth.uid)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const googleApiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!openRouterApiKey && !googleApiKey) {
      return NextResponse.json({ error: 'No AI provider key configured' }, { status: 500 });
    }

    const body = await request.json();
    const modelType = String(body?.modelType ?? 'flash');
    const messages = normalizeIncomingMessages(body?.messages);
    if (LOCK_PREMIUM_MODELS_DURING_LAUNCH && (modelType === 'thinker' || modelType === 'pro')) {
      return NextResponse.json({ error: 'PREMIUM_MODELS_TEMPORARILY_LOCKED' }, { status: 403 });
    }
    const effectiveModelType = 'flash';
    const model = getModelString(effectiveModelType);

    const openRouterMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];
    let text = '';
    let openRouterError: unknown = null;
    if (openRouterApiKey) {
      try {
        text = await callOpenRouter(openRouterApiKey, model, openRouterMessages as Array<{ role: string; content: string }>);
      } catch (error) {
        openRouterError = error;
        console.error('OpenRouter primary failed, trying Google fallback:', error);
      }
    }

    if (!text && googleApiKey) {
      text = await callGoogleFallback(googleApiKey, messages);
    }

    if (!text) {
      console.error('AI providers failed', openRouterError);
      return NextResponse.json({ error: 'AI connection failed' }, { status: 500 });
    }

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error instanceof Error && error.message === 'INVALID_MESSAGES') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}