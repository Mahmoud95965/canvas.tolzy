import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, FIREBASE_INIT_ERROR } from '@/lib/firebase-admin';
import dns from 'node:dns';
import { LOCK_PREMIUM_MODELS_DURING_LAUNCH } from '@/lib/plan';
import {
  fetchOpenRouterChatCompletionText,
  OPENROUTER_DEFAULT_MODEL,
  UPSTREAM_CONGESTION_USER_MESSAGE_AR,
} from '@/lib/openrouter-defaults';
import { geminiChatWithGrounding, isGeminiConfigured, type GeminiMessage } from '@/lib/gemini-service';
import { getUserPlan, recordGeminiAttempt } from '@/lib/gemini-quota';

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

type AuthPayload = { uid: string; email?: string | null };

async function verifyAuth(request: NextRequest): Promise<AuthPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    if (!adminAuth) return null;
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { uid: decodedToken.uid, email: decodedToken.email };
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

function getOpenRouterModelString(type: string, plan: string = 'free') {
  // Free models (The "Old" models)
  const defaultFreeModel = 'google/gemini-flash-1.5-exp:free';
  
  // Pro Model (The Premium Powerhouse)
  const proModel = 'qwen/qwen3.5-flash-02-23';

  if (type === 'pro') {
    // Only return the high-performance model if the plan is pro
    return plan === 'pro' ? proModel : defaultFreeModel;
  }

  return process.env.OPENROUTER_CHAT_MODEL?.trim() || defaultFreeModel;
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
    console.log('📨 Chat API Request received at', new Date().toISOString());

    if (FIREBASE_INIT_ERROR) {
      console.error('❌ Firebase Admin initialization error:', FIREBASE_INIT_ERROR);
    }
    
    const auth = await verifyAuth(request);
    if (!auth) {
      console.error('❌ Authentication failed - no valid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', auth.uid);

    // Get user plan to enforce restrictions
    const userPlan = await getUserPlan(auth.uid, auth.email);
    console.log(`👤 User plan for ${auth.uid}: ${userPlan}`);
    
    if (!checkRateLimit(auth.uid)) {
      console.warn('⚠️ Rate limit exceeded for user:', auth.uid);
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const modelType = String(body?.modelType ?? 'flash');
    const messages = normalizeIncomingMessages(body?.messages);
    const useGemini = String(body?.provider ?? 'gemini').toLowerCase() === 'gemini';

    if (LOCK_PREMIUM_MODELS_DURING_LAUNCH && modelType === 'pro') {
      return NextResponse.json({ error: 'PREMIUM_MODELS_TEMPORARILY_LOCKED' }, { status: 403 });
    }

    /* 
    // Gemini routing is disabled as per user request to rely exclusively on OpenRouter
    if (useGemini && isGeminiConfigured()) {
      // ... Gemini logic ...
    }
    */

    // Fallback to OpenRouter (يتم استخدامه عندما:
    // 1. provider != 'gemini'
    // 2. Gemini غير مكوّن
    // 3. Gemini واجه خطأ (503, rate limit، إلخ)
    // ولا يتم استخدامه فقط في حالة خطأ مصادقة Gemini)
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    if (modelType === 'pro' && userPlan !== 'pro') {
      return NextResponse.json({ 
        error: 'PRO_REQUIRED', 
        message: 'موديل Pro متاح لمشتركي الخطط المدفوعة فقط. ارفع خطتك الآن للحصول على أفضل أداء.' 
      }, { status: 403 });
    }

    const effectiveModelType = modelType === 'pro' ? 'pro' : 'flash';
    const openRouterModel = getOpenRouterModelString(effectiveModelType, userPlan);

    const withSystem = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages] as Array<{
      role: string;
      content: string;
    }>;

    let text: string;
    try {
      console.log(`📡 Calling OpenRouter with model: ${openRouterModel}`);
      text = await fetchOpenRouterChatCompletionText(
        openRouterApiKey,
        openRouterModel,
        withSystem,
        MAX_OUTPUT_TOKENS,
        0.2
      );
    } catch (error) {
      const isCongested = error instanceof Error && 
        (error.message === 'OPENROUTER_RATE_LIMIT' || error.message.includes('busy') || error.message.includes('congested'));

      // ✅ Fallback if model is busy OR not found
      if (isCongested || (error instanceof Error && error.message.includes('404'))) {
        const reason = isCongested ? 'CONGESTED' : 'NOT_FOUND';
        console.warn(`[OpenRouter] Primary model ${openRouterModel} is ${reason}. Falling back to default...`);
        
        try {
          // Use a different model for fallback (ensure they are not the same)
          const fallbackModel = openRouterModel === OPENROUTER_DEFAULT_MODEL 
            ? 'google/gemini-2.0-flash-exp:free' 
            : OPENROUTER_DEFAULT_MODEL;
            
          console.log(`📡 Attempting fallback with: ${fallbackModel}`);
          text = await fetchOpenRouterChatCompletionText(
            openRouterApiKey,
            fallbackModel,
            withSystem,
            MAX_OUTPUT_TOKENS,
            0.2
          );
        } catch (innerError) {
          console.error('❌ OpenRouter all attempts failed:', innerError);
          const finalMsg = innerError instanceof Error ? innerError.message : String(innerError);
          
          return new Response(`عذراً، جميع مسارات الذكاء الاصطناعي مزدحمة حالياً. يرجى المحاولة مرة أخرى خلال دقائق.\n(التفاصيل: ${finalMsg.slice(0, 100)})`, {
            status: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      } else {
        console.error('❌ OpenRouter critical failure:', error);
        return new Response("عذراً، حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصناعي.", {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : String(error);
    
    console.error('❌ Chat API Error:', {
      timestamp: new Date().toISOString(),
      error: errorDetails,
      errorType: error?.constructor?.name,
    });
    
    if (error instanceof Error && error.message === 'INVALID_MESSAGES') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    
    // أرجع رسالة خطأ أكثر تفصيلاً
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
