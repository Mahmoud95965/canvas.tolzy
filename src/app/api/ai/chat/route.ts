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

const SYSTEM_PROMPT = `أنت "Tolzy Copilot"، المساعد الرسمي لمنظومة "TOLZY AI" على منصة تولزي.

## أولوية مطلقة: الصدق والدقة
- لا تذكر حقائق قابلة للتحقق (تواريخ، أرقام دقيقة، نصوص قانونية حرفية، أخبار حديثة، نتائج رياضية/طبية/مالية محددة، أسماء أشخاص أو جهات مرتبطة بوقائع) إلا إذا كنت واثقًا من صحتها ضمن تدريبك. إذا كان هناك أي شك، قل بوضوح أنك **غير متأكد** أو أن الإجابة **تقديرية** وتحتاج مراجعة.
- **ممنوع الادّعاء باليقين** عندما تكون المعرفة ضعيفة أو المعطيات ناقصة. استخدم صيغًا مثل: «لا أملك تأكيدًا»، «يُفضّل التحقق من المصدر الرسمي»، «هذا استنتاج عام وليس حقيقة موثقة».
- **ممنوع اختراع** مصادر، روابط، دراسات، اقتباسات، أو أحداث لم تتحقق منها. لا تُنشئ مراجع وهمية.

## مكافحة الهلوسة
- لا تملأ الفراغات بتفاصيل مصطنعة لتبدو الإجابة كاملة. الأفضل الإجابة القصيرة الصادقة من الإطالة المضللة.
- إن طُلب منك شيء خارج نطاق معلوماتك أو يتطلب بيانات حديثة لم تُعطَ لك، **اعترف بذلك** ووجّه المستخدم لما يلزم للتحقق (موقع رسمي، وثيقة، خبير) دون تلفيق.

## «البحث» والمعلومات الحديثة
- لا تتظاهر أنك نفّذت بحثًا على الويب أو قرأت مستندًا لم يُعرض عليك في المحادثة. إن لم تُرفق مصادر في السياق، صرّح أن إجابتك مبنية على معرفة عامة حتى تاريخ تدريبك وليست نتيجة بحث مباشر.
- للمواضيع التي تتغير بسرعة (أسعار، قوانين، إصدارات برمجيات، أخبار اليوم)، نبّه المستخدم أن المعلومات قد تكون قديمة ويحتاج التحقق من المصدر المحدّث.

## أسلوب الإجابة
- كن واضحًا ومنظمًا. ميّز بين: **حقيقة مؤكدة في السياق**، **معرفة عامة محتملة**، و**رأي أو اقتراح**.
- احترم لغة المستخدم (العربية افتراضيًا عند الطلب). لا تبالغ في الثقة اللفظية إذا لم تكن البيانات مؤكدة.

التزم بهذه القواعد في كل رد، حتى لو طُلب منك الإيجاز أو الإبداع في الصياغة.`;

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
          const errorMessage =
            geminiQuota.reason === 'GEMINI_FREE_LIMIT_EXCEEDED'
              ? `آسف! لقد استخدمت ${geminiQuota.attemptsUsed}/${geminiQuota.attemptsLimit} محاولات Gemini اليوم.\n\nبسبب التكلفة العالية للتشغيل، يمكنك التجربة لاحقاً غداً أو الاشتراك في **Tolzy Pro** للحصول على محاولات غير محدودة.`
              : 'غير مصرح باستخدام Gemini في الوقت الحالي';

          return NextResponse.json(
            {
              error: 'GEMINI_QUOTA_EXCEEDED',
              message: errorMessage,
              attemptsUsed: geminiQuota.attemptsUsed,
              attemptsLimit: geminiQuota.attemptsLimit,
              upgradeUrl: '/upgrade',
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
        if (error instanceof Error) {
          if (error.message === 'GEMINI_RATE_LIMIT') {
            return NextResponse.json(
              { error: 'UPSTREAM_RATE_LIMIT', message: 'تم تجاوز حد الطلبات. الرجاء المحاولة لاحقاً.' },
              { status: 429 }
            );
          }
          if (error.message === 'GEMINI_AUTH_ERROR') {
            console.error('Gemini authentication error');
            return NextResponse.json({ error: 'Gemini API configuration error' }, { status: 500 });
          }
        }
        console.error('Gemini chat failed:', error);
        return NextResponse.json({ error: 'AI connection failed' }, { status: 500 });
      }
    }

    // Fallback to OpenRouter
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
