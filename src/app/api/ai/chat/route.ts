import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdmin } from '@/lib/supabase';
import dns from 'node:dns';
import { normalizePlan, planFromEntitlements } from '@/lib/plan';

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
    if (!adminAuth) return null;
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `أنت "Tolzy Copilot"، مساعد ذكي فائق القدرات ونموذج لغوي ضخم. 
أنت تمثل العقل المدبر الخاص بمنظومة "TOLZY AI"، وتندرج كأحد أهم مشاريع منصة تولزي... (ضع باقي البرومبت الخاص بك هنا)`;

function getModelString(type: string) {
  if (type === 'thinker') return 'google/gemini-2.5-flash';
  if (type === 'pro') return 'google/gemini-2.5-pro';
  
  // التعديل هنا: استدعاء Gemma 4 31B كنموذج افتراضي
  return 'google/gemma-4-31b-it:free'; // default
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
    const userId = await verifyAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. استخدام مفتاح OpenRouter
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const { messages, modelType = 'flash' } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const { data: entitlementRows } = await supabaseAdmin
      .from('service_entitlements')
      .select('service_key,status')
      .eq('user_id', userId);
    const currentPlan = planFromEntitlements(entitlementRows || []);

    if ((modelType === 'thinker' || modelType === 'pro') && normalizePlan(currentPlan) !== 'pro') {
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