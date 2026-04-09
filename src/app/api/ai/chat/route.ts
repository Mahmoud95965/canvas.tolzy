import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdmin } from '@/lib/supabase';
import dns from 'node:dns';
import {
  LOCK_PREMIUM_MODELS_DURING_LAUNCH,
  PRO_LAUNCH_GUARD,
  normalizePlan,
  planFromPlanRow,
  planFromEntitlements,
} from '@/lib/plan';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type AuthPayload = { uid: string; email: string | null };

async function verifyAuth(request: NextRequest): Promise<AuthPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    if (!adminAuth) return null;
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

async function findPlanRow(auth: AuthPayload): Promise<Record<string, unknown> | null> {
  const tableCandidates = ['plan', 'plans', 'user_plans'];
  const selectors: Array<{ column: string; value: string; mode: 'eq' | 'ilike' }> = [
    { column: 'user_id', value: auth.uid, mode: 'eq' },
    { column: 'uid', value: auth.uid, mode: 'eq' },
    { column: 'userId', value: auth.uid, mode: 'eq' },
  ];

  if (auth.email) {
    selectors.push({ column: 'email', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'user_email', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'email_address', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'mail', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'email', value: auth.email, mode: 'ilike' });
    selectors.push({ column: 'user_email', value: auth.email, mode: 'ilike' });
    selectors.push({ column: 'email_address', value: auth.email, mode: 'ilike' });
    selectors.push({ column: 'mail', value: auth.email, mode: 'ilike' });
  }

  for (const tableName of tableCandidates) {
    for (const selector of selectors) {
      let query = supabaseAdmin.from(tableName).select('*');
      query = selector.mode === 'ilike' ? query.ilike(selector.column, selector.value) : query.eq(selector.column, selector.value);
      const { data, error } = await query.order('updated_at', { ascending: false }).limit(1);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data[0] as Record<string, unknown>;
      }
    }
  }

  return null;
}

function isMissingTableError(error: any): boolean {
  return error?.code === 'PGRST205';
}

async function findUserLimitsRow(auth: AuthPayload): Promise<Record<string, unknown> | null> {
  const selectors: Array<{ column: string; value: string; mode: 'eq' | 'ilike' }> = [
    { column: 'user_id', value: auth.uid, mode: 'eq' },
    { column: 'uid', value: auth.uid, mode: 'eq' },
    { column: 'userId', value: auth.uid, mode: 'eq' },
  ];

  if (auth.email) {
    selectors.push({ column: 'email', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'email', value: auth.email, mode: 'ilike' });
  }

  for (const selector of selectors) {
    let query = supabaseAdmin.from('user_limits').select('*');
    query = selector.mode === 'ilike' ? query.ilike(selector.column, selector.value) : query.eq(selector.column, selector.value);
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(1);
    if (!error && Array.isArray(data) && data.length > 0) {
      return data[0] as Record<string, unknown>;
    }
  }

  return null;
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

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. استخدام مفتاح OpenRouter
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const { messages, modelType = 'flash' } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    let currentPlan: 'free' | 'pro' = 'free';
    const planRow = await findPlanRow(auth);
    if (planRow) {
      currentPlan = planFromPlanRow(planRow);
    } else {
      const limitsRow = await findUserLimitsRow(auth);
      if (limitsRow) {
        currentPlan = planFromPlanRow(limitsRow);
      } else {
        const { data: entitlementRows, error: entitlementError } = await supabaseAdmin
          .from('service_entitlements')
          .select('service_key,status')
          .eq('user_id', auth.uid);
        if (!entitlementError) {
          currentPlan = planFromEntitlements(entitlementRows || []);
        } else if (!isMissingTableError(entitlementError)) {
          throw entitlementError;
        }
      }
    }
    const normalizedPlan = normalizePlan(currentPlan);

    if (PRO_LAUNCH_GUARD && normalizedPlan !== 'pro') {
      return NextResponse.json({ error: 'PRO_SUBSCRIPTION_REQUIRED' }, { status: 403 });
    }

    if (LOCK_PREMIUM_MODELS_DURING_LAUNCH && (modelType === 'thinker' || modelType === 'pro')) {
      return NextResponse.json({ error: 'PREMIUM_MODELS_TEMPORARILY_LOCKED' }, { status: 403 });
    }

    if ((modelType === 'thinker' || modelType === 'pro') && normalizedPlan !== 'pro') {
      return NextResponse.json({ error: 'PRO_REQUIRED' }, { status: 403 });
    }

    const model = getModelString(modelType);

    // 3. تجهيز الرسائل بصيغة OpenRouter/OpenAI القياسية
    // نضع الـ System Prompt كأول رسالة في المصفوفة
    const openRouterMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages // الواجهة الأمامية لديك ترسلها بصيغة متوافقة غالباً
    ];

    // 4. إرسال الطلب إلى OpenRouter (non-stream for reliability)
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tolzy.me", // يفضل كتابته
        "X-Title": "Tolzy Flow", // يظهر في لوحة تحكم OpenRouter
      },
      body: JSON.stringify({
        model: model,
        messages: openRouterMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 8192,
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('OpenRouter Error:', text);
      return NextResponse.json({ error: 'AI connection failed' }, { status: 500 });
    }

    const json = await res.json();
    const text = extractAssistantText(json);
    if (!text) {
      console.error('OpenRouter empty completion:', json);
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}