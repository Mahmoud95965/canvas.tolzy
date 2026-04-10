/**
 * مثال: التعامل مع رسالة الحد الأقصى للمحاولات
 * 
 * هذا المثال يوضح كيفية التعامل مع الرسالة عندما ينتهي Free user من محاولاته
 */

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export function GeminiQuotaExample() {
  const { user } = useAuth();
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
    attemptsUsed?: number;
    attemptsLimit?: number;
    upgradeUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'gemini',
          modelType: 'flash',
          messages: [{ role: 'user', content: 'السلام عليكم' }],
        }),
      });

      if (!res.ok) {
        const error = await res.json();

        // ✅ حالة: تجاوز الحد
        if (error.error === 'GEMINI_QUOTA_EXCEEDED') {
          setResponse({
            success: false,
            message: error.message,
            attemptsUsed: error.attemptsUsed,
            attemptsLimit: error.attemptsLimit,
            upgradeUrl: error.upgradeUrl,
          });
          return;
        }

        // حالات خطأ أخرى
        setResponse({
          success: false,
          message: error.message || 'حدث خطأ ما',
        });
        return;
      }

      // نجح!
      const text = await res.text();
      setResponse({
        success: true,
        message: text,
      });
    } catch (error) {
      setResponse({
        success: false,
        message: 'خطأ في الاتصال',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={handleSendMessage}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'جاري التحميل...' : 'بدّل المحادثة'}
      </button>

      {response && (
        <div
          className={`p-4 rounded-lg border-2 ${
            response.success
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          {/* الرسالة الأساسية */}
          <div className="whitespace-pre-wrap text-sm">{response.message}</div>

          {/* إذا كانت خطأ الحد، عرض باقي المعلومات والزر */}
          {!response.success &&
            response.attemptsUsed !== undefined &&
            response.upgradeUrl && (
              <div className="mt-4 pt-4 border-t border-red-300 space-y-3">
                {/* عرض الإحصائيات */}
                <div className="text-xs text-gray-600">
                  <p>
                    <strong>محاولات اليوم:</strong> {response.attemptsUsed}/
                    {response.attemptsLimit}
                  </p>
                </div>

                {/* زر الترقية */}
                <a
                  href={response.upgradeUrl}
                  className="block text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                >
                  💎 ترقية إلى Pro الآن
                </a>

                {/* رابط للعودة لقائمة التسعير */}
                <a
                  href="/pricing"
                  className="block text-center px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition"
                >
                  عرض خطط التسعير
                </a>
              </div>
            )}
        </div>
      )}

      {/* ملاحظة تثقيفية */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
        <p>
          <strong>📝 ملاحظة:</strong> Free users لديهم 5 محاولات يومية مع Gemini. Pro users لديهم محاولات غير محدودة.
        </p>
      </div>
    </div>
  );
}

/**
 * Hook مخصص للتحقق من الحد الأقصى
 */
export function useGeminiQuota() {
  const { user } = useAuth();
  const [quota, setQuota] = useState<{
    attemptsUsed: number;
    attemptsLimit: number;
    canUseGemini: boolean;
  } | null>(null);

  const checkQuota = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      // يمكن إنشاء endpoint منفصل للتحقق من الحد فقط
      // بدون استخدام محاولة
      // const res = await fetch('/api/ai/gemini-quota', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await res.json();
      // setQuota(data);
    } catch (error) {
      console.error('Error checking quota:', error);
    }
  };

  return { quota, checkQuota };
}
