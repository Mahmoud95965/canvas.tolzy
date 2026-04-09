'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/lib/auth-context';
import { PRO_SERVICE_KEY } from '@/lib/plan';

export default function PricingPage() {
  const { plan } = useAuth();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      title: 'Free',
      subtitle: 'الخطة الافتراضية',
      priceLabel: 'مجاني',
      serviceKey: null,
      description:
        'ابدأ مع Tolzy مجاناً واستكشف المزايا الأساسية. الميزات المتقدمة مثل المُفكّر والـ Reasoning المتقدم متاحة في Pro.',
      features: [
        'وصول أساسي إلى Tolzy Copilot.',
        'استخدام النماذج السريعة للمهام اليومية.',
        'ميزات Pro المتقدمة مغلقة حتى الترقية.',
      ],
      cta: plan === 'free' ? 'الخطة الحالية' : 'بدء مجاني',
    },
    {
      title: 'Tolzy Pro',
      subtitle: 'شريكك الذكي في النجاح 🚀',
      priceLabel: '299 ج.م / شهرياً',
      serviceKey: PRO_SERVICE_KEY,
      description:
        'خطة احترافية للإنجاز السريع مع أداء أعلى وتجربة متقدمة بدون تعقيد.',
      features: [
        'عقل "المفكر": Reasoning متقدم',
        'حرية بلا قيود بعدد طلبات كبير',
        'أولوية وسرعة أعلى',
        'اقتراح أدوات جديدة للمشتركين',
        'وصول تلقائي لمنصة TOLZY AI عند الإطلاق',
        'دعم VIP',
      ],
      cta: plan === 'pro' ? 'خطتك الحالية' : 'اشترك الآن',
    },
  ];

  const handleCheckout = async (serviceKey: string | null) => {
    if (!serviceKey) return;
    setLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        window.location.href = '/login?redirect=/pay';
        return;
      }

      const token = await currentUser.getIdToken();

      // تم التعديل إلى رابط واجهة برمجة التطبيقات النسبي ليعمل بشكل صحيح سواء محلياً أو بعد الرفع
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceKey,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      console.error('Checkout error:', data.error);
      alert('حدث خطأ أثناء إعداد الدفع.');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ غير متوقع.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-16 px-4 relative" dir="rtl">
      {loading && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl px-6 py-4 text-black font-semibold shadow-lg">
            جاري تجهيز الدفع...
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">الخطط والأسعار</h1>
          <p className="text-gray-600">اختر الخطة المناسبة وابدأ رحلتك مع Tolzy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.title} className="border border-gray-200 rounded-2xl p-6 bg-white flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
              <div className="text-3xl font-extrabold text-gray-900 mt-4 mb-4">{plan.priceLabel}</div>
              <p className="text-gray-700 mb-5 text-sm leading-7">{plan.description}</p>

              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2">أبرز المميزات</h3>
                <ul className="space-y-2 text-sm text-gray-700 leading-7">
                  {plan.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
              </div>

              {plan.serviceKey ? (
                <button
                  onClick={() => handleCheckout(plan.serviceKey)}
                  disabled={plan.cta === 'خطتك الحالية'}
                  className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {plan.cta}
                </button>
              ) : (
                <a
                  href="/app"
                  className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition text-center block"
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
