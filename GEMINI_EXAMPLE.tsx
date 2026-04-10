/**
 * مثال عملي: استخدام Google Gemini مع Search Grounding في Tolzy
 * 
 * يمكنك نسخ هذا الكود إلى أي component في Tolzy لاستخدام Gemini
 */

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export function GeminiChatExample() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'user', content: 'مرحباً' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 1. الحصول على Firebase token
      const token = await user.getIdToken();

      // 2. إرسال الطلب إلى Gemini مع Search Grounding
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'gemini', // ✨ استخدم Gemini
          modelType: 'flash',
          messages: [...messages, userMessage], // إرسال السجل كاملاً
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Chat failed');
      }

      // 3. قراءة الإجابة
      const assistantMessage = await response.text();
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);

      // ✨ معلومات إضافية (إذا أرسلها الخادم)
      const searchUsed = response.headers.get('X-Search-Used');
      if (searchUsed) {
        console.log('✅ تم استخدام Search Grounding');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'حدث خطأ. حاول مرة أخرى.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">💬 Tolzy with Gemini + Search Grounding</h1>

      {/* رسائل المحادثة */}
      <div className="flex-1 space-y-2 bg-zinc-900 p-4 rounded-lg h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 text-zinc-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-zinc-400 italic">جاري الكتابة...</div>}
      </div>

      {/* Input form */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'بحث...' : 'إرسال'}
        </button>
      </form>

      {/* ملاحظة عن Search Grounding */}
      <div className="text-sm text-zinc-400 bg-zinc-900 p-3 rounded border border-zinc-700">
        🔍 <strong>عندما تسأل عن معلومات حية</strong>
        (أسعار، إصدارات برمجيات، أخبار)، Gemini سيبحث في جوجل تلقائياً ويجاوبك بأحدث المعلومات.
      </div>
    </div>
  );
}

/**
 * مثال بسيط بدون UI:
 */

export async function simpleGeminiRequest(userMessage: string, firebaseToken: string) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({
      provider: 'gemini',
      modelType: 'flash',
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) throw new Error('Failed');
  return response.text();
}

/**
 * أمثلة على الأسئلة التي تستفيد من Search Grounding:
 *
 * 1. "ما هو آخر سعر للدولار الأمريكي؟"
 *    → الموديل يبحث عن أسعار الصرف الحالية
 *
 * 2. "أحدث إصدار من Nextjs كم؟"
 *    → يبحث عن إصدار Next.js الأخير
 *
 * 3. "كم سعر آيفون 16 برو ماكس؟"
 *    → يبحث عن الأسعار الحالية
 *
 * 4. "ما آخر أخبار مصر اليوم؟"
 *    → يبحث عن أخبار اليوم
 *
 * 5. "أحسن مطاعم برجر في القاهرة؟"
 *    → يبحث عن التقييمات الحالية والمراجعات
 */
