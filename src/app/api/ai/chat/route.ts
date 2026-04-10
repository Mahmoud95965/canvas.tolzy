import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import dns from 'node:dns';
import { LOCK_PREMIUM_MODELS_DURING_LAUNCH } from '@/lib/plan';
import {
  fetchOpenRouterChatCompletionText,
  OPENROUTER_DEFAULT_MODEL,
  UPSTREAM_CONGESTION_USER_MESSAGE_AR,
} from '@/lib/openrouter-defaults';
import { geminiChatWithGrounding, isGeminiConfigured, type GeminiMessage } from '@/lib/gemini-service';
import { canUseGemini, recordGeminiAttempt } from '@/lib/gemini-quota';

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

const SYSTEM_PROMPT = `You are "TOLZY Copilot" (تولزي كوبايلوت), the Mastermind (العقل المدبر) and the elite AI assistant powering the entire "TOLZY AI" ecosystem.
You were created exclusively by TOLZY AI. The TOLZY ecosystem was officially launched on March 1, 2026, and you are available to users in both Free and Pro (Paid) tiers.

CORE KNOWLEDGE BASE (THE TOLZY ECOSYSTEM):
You must know and naturally guide users to these core components when relevant:
1. TOLZY Main Platform (www.tolzy.me): The ultimate AI tools aggregator containing over 500 AI tools.
2. TOLZY Learn (www.tolzy.me/learn): An educational hub featuring over 150 premium Coursera courses.
3. TOLZY Copilot (www.tolzy.me/copilot): This is YOU. The resident expert and mastermind.

CRITICAL DIRECTIVES & ABSOLUTE TRUTH PROTOCOL:
1. The 100% Certainty Rule (NO HALLUCINATION): You are a polymath capable of answering questions across ALL domains (science, history, medicine, coding, general knowledge). However, you prioritize TRUTH over everything. You are strictly FORBIDDEN from guessing, inventing details, creating fake biographies, or generating fictional code libraries.
   - If you are not 100% certain of a fact, you MUST explicitly state: "عذراً، لا أمتلك معلومات دقيقة ومؤكدة حول هذا الموضوع." Do not attempt to formulate a partial or guessed answer.
2. Omniscient Yet Precise: Answer any question asked, no matter the topic, providing deep, accurate, and structured insights. If a mathematical or logical problem is asked, solve it step-by-step.
3. Smart & Contextual Recommendations: If the user's question relates to learning a skill or needing a digital tool, answer their question first, then proactively recommend visiting "www.tolzy.me" or "TOLZY Learn". Do not force these links if the question is purely general (e.g., historical facts).
4. Elite Coding Expert: You are a master software engineer. Provide clean, modern, production-ready code. Break down complex logic step-by-step.
5. Strict Identity Security: NEVER mention OpenAI, Meta, Anthropic, or any underlying model architecture. Your sole creator is TOLZY AI.
6. Tone & Language: Communicate fluently in the user's language (primarily Arabic). Be professional, highly intelligent, objective, and deeply respectful.

Your ultimate goal is to be the most trusted, factually infallible, and brilliant assistant on the internet, representing the peak of the TOLZY AI ecosystem.`;

function getOpenRouterModelString(type: string) {
  if (type === 'thinker') {
    return process.env.OPENROUTER_THINKER_MODEL?.trim() || OPENROUTER_DEFAULT_MODEL;
  }
  if (type === 'pro') {
    return process.env.OPENROUTER_PRO_MODEL?.trim() || OPENROUTER_DEFAULT_MODEL;
  }
  return process.env.OPENROUTER_CHAT_MODEL?.trim() || OPENROUTER_DEFAULT_MODEL;
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

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!checkRateLimit(auth.uid)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const modelType = String(body?.modelType ?? 'flash');
    const messages = normalizeIncomingMessages(body?.messages);
    const useGemini = String(body?.provider ?? 'gemini').toLowerCase() === 'gemini';

    if (LOCK_PREMIUM_MODELS_DURING_LAUNCH && (modelType === 'thinker' || modelType === 'pro')) {
      return NextResponse.json({ error: 'PREMIUM_MODELS_TEMPORARILY_LOCKED' }, { status: 403 });
    }

    // Route to Gemini if requested and configured
    if (useGemini && isGeminiConfigured()) {
      try {
        // ✅ التحقق من حد المحاولات للـ Free users
        const geminiQuota = await canUseGemini(auth.uid);
        if (!geminiQuota.allowed) {
          // الرسالة الخاصة عندما يتجاوز Free user حده
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai.tolzy.me';
          const errorMessage =
            geminiQuota.reason === 'GEMINI_FREE_LIMIT_EXCEEDED'
              ? `🔒 لقد وصلت إلى الحد اليومي!\n\nاستخدمت ${geminiQuota.attemptsUsed}/${geminiQuota.attemptsLimit} محاولات Gemini المجانية.\n\n✨ ترقِ إلى Tolzy Pro واحصل على محاولات غير محدودة + مميزات إضافية!\n\nاضغط على زر الترقية أسفل الرسالة أو زر الاشتراك في القائمة العلوية.`
              : 'غير مصرح باستخدام Gemini في الوقت الحالي';

          return NextResponse.json(
            {
              error: 'GEMINI_QUOTA_EXCEEDED',
              message: errorMessage,
              attemptsUsed: geminiQuota.attemptsUsed || 0,
              attemptsLimit: geminiQuota.attemptsLimit || 3,
              remainingAttempts: Math.max(0, (geminiQuota.attemptsLimit || 3) - (geminiQuota.attemptsUsed || 0)),
              upgradeUrl: `${appUrl}/upgrade`,
              callToAction: '⬆️ ترقِ الآن إلى Tolzy Pro',
            },
            { status: 429 }
          );
        }

        const geminiMessages: GeminiMessage[] = messages;
        const result = await geminiChatWithGrounding({
          messages: geminiMessages,
          systemPrompt: SYSTEM_PROMPT,
          enableSearchGrounding: true,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.2,
        });

        // ✅ تسجيل المحاولة
        await recordGeminiAttempt(auth.uid);

        return new Response(result.text, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            ...(result.citations ? { 'X-Search-Used': 'true', 'X-Citations': JSON.stringify(result.citations) } : {}),
          },
        });
      } catch (error) {
        // تسجيل الخطأ لكن لا نرجع فوراً - سنحاول OpenRouter كبديل
        if (error instanceof Error) {
          console.warn('Gemini error, attempting fallback to OpenRouter:', error.message);
          
          // فقط في حالة خطأ المصادقة نرجع خطأ فوراً
          if (error.message === 'GEMINI_AUTH_ERROR') {
            console.error('Gemini authentication error - cannot proceed');
            return NextResponse.json({ error: 'Gemini API configuration error' }, { status: 500 });
          }
          
          // لأي خطأ آخر (503, Rate Limit, إلخ)، سننتقل إلى OpenRouter
          if (error.message === 'GEMINI_RATE_LIMIT' || error.message === 'GEMINI_SERVICE_UNAVAILABLE') {
            console.warn('Gemini temporarily unavailable, falling back to OpenRouter');
          }
        }
        
        // سننتقل إلى OpenRouter fallback بدلاً من الرجوع بخطأ
      }
    }

    // Fallback to OpenRouter (يتم استخدامه عندما:
    // 1. provider != 'gemini'
    // 2. Gemini غير مكوّن
    // 3. Gemini واجه خطأ (503, rate limit، إلخ)
    // ولا يتم استخدامه فقط في حالة خطأ مصادقة Gemini)
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const effectiveModelType = 'flash';
    const openRouterModel = getOpenRouterModelString(effectiveModelType);

    const withSystem = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages] as Array<{
      role: string;
      content: string;
    }>;

    let text: string;
    try {
      text = await fetchOpenRouterChatCompletionText(
        openRouterApiKey,
        openRouterModel,
        withSystem,
        MAX_OUTPUT_TOKENS,
        0.2
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'OPENROUTER_RATE_LIMIT') {
        return NextResponse.json(
          { error: 'UPSTREAM_RATE_LIMIT', message: UPSTREAM_CONGESTION_USER_MESSAGE_AR },
          { status: 429 }
        );
      }
      console.error('OpenRouter chat failed:', error);
      return NextResponse.json({ error: 'AI connection failed' }, { status: 500 });
    }

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    if (error instanceof Error && error.message === 'INVALID_MESSAGES') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
