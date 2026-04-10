'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { AlertCircle, Phone, Send, Wallet, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PRO_SERVICE_KEY } from '@/lib/plan';

export default function PricingPage() {
  const { plan } = useAuth();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  const plans = [
    {
      title: 'Free',
      subtitle: 'الخطة الافتراضية',
      priceLabel: 'مجاني',
      serviceKey: null,
      description:
        'ابدأ مع TOLZY AI مجاناً واستكشف المزايا الأساسية للإجابة والبرمجة.',
      features: [
        '10 طلبات يومياً مجاناً.',
        'وصول أساسي إلى TOLZY AI.',
        'خبير في الإجابة والبرمجة.',
        'ميزات Pro المتقدمة مغلقة حتى الترقية.',
      ],
      cta: plan === 'free' ? 'الخطة الحالية' : 'بدء مجاني',
    },
    {
      title: 'TOLZY Pro',
      subtitle: 'القوة الكاملة بين يديك 🚀',
      priceLabel: '299 ج.م / شهرياً',
      serviceKey: PRO_SERVICE_KEY,
      description:
        'خطة احترافية للإنجاز السريع مع أداء أعلى وتجربة متقدمة بدون تعقيد.',
      features: [
        'وصول غير محدود (حتى 5000 طلب شهرياً)',
        'عقل "المفكر": Reasoning متقدم',
        'أولوية وسرعة معالجة قصوى',
        'دخول حصري لمنصة TOLZY Hex القادمة',
        'دعم فني VIP مباشر',
      ],
      cta: plan === 'pro' ? 'خطتك الحالية' : 'اشترك الآن',
    },
  ];

  const handleCheckout = async (serviceKey: string | null) => {
    if (!serviceKey) return;
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        window.location.href = '/login?redirect=/pay';
        return;
      }
      setCustomerEmail(currentUser.email ?? '');
      setIsTransferModalOpen(true);

      // Stripe checkout is temporarily disabled.
      // const token = await currentUser.getIdToken();
      //
      // const response = await fetch('/api/billing/checkout', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     serviceKey,
      //   }),
      // });
      //
      // const data = await response.json();
      // if (data.url) {
      //   window.location.href = data.url;
      //   return;
      // }
      //
      // console.error('Checkout error:', data.error);
      // alert('حدث خطأ أثناء إعداد الدفع.');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ غير متوقع.');
    }
  };

  const whatsappMessage = `أهلاً Tolzy، قمت بتحويل 299 جنيه للاشتراك في خطة Pro. الإيميل الخاص بي في الموقع هو: ${
    customerEmail || '[إيميل العميل]'
  } ومرفق صورة الإيصال.`;
  const whatsappHref = `https://wa.me/201026795965?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1120] py-16 px-4 relative" dir="rtl">
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 dark:bg-white/10 shadow-2xl backdrop-blur-xl p-5 md:p-6 text-white relative">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl md:text-2xl font-bold mb-4">تفعيل اشتراك TOLZY Pro</h2>

            <div className="rounded-xl border border-orange-200/70 bg-orange-100/90 text-orange-900 p-4 flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm leading-7">
                بوابة الدفع الآلي (Stripe) تخضع لتحديثات حالياً. يمكنك تفعيل حسابك فوراً وبشكل آمن عبر
                التحويل المباشر.
              </p>
            </div>

            <div className="rounded-xl bg-black/25 border border-white/10 p-4 mb-3">
              <p className="text-sm text-white/80 mb-1">مبلغ الاشتراك الشهري</p>
              <p className="text-2xl font-extrabold">299 ج.م</p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="rounded-xl bg-black/25 border border-white/10 p-4">
                <p className="text-sm text-white/80 mb-2">فودافون كاش</p>
                <p className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">01026795965</span>
                </p>
              </div>
              <div className="rounded-xl bg-black/25 border border-white/10 p-4">
                <p className="text-sm text-white/80 mb-2">إنستاباي (InstaPay)</p>
                <p className="font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span dir="ltr">mahmoud159208@instapay</span>
                </p>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 transition py-3 px-4 font-bold"
            >
              <Send className="h-4 w-4" />
              إرسال الإيصال عبر واتساب
            </a>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">الخطط والأسعار</h1>
          <p className="text-gray-600 dark:text-white/70">اختر الخطة المناسبة وابدأ رحلتك مع TOLZY AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className="border border-gray-200 dark:border-white/15 rounded-2xl p-6 bg-white dark:bg-white/5 dark:backdrop-blur-lg flex flex-col"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.title}</h2>
              <p className="text-sm text-gray-500 dark:text-white/70 mt-1">{plan.subtitle}</p>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 mb-4">{plan.priceLabel}</div>
              <p className="text-gray-700 dark:text-white/80 mb-5 text-sm leading-7">{plan.description}</p>

              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">أبرز المميزات</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-white/80 leading-7">
                  {plan.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
              </div>

              {plan.serviceKey ? (
                <button
                  onClick={() => handleCheckout(plan.serviceKey)}
                  disabled={plan.cta === 'خطتك الحالية'}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {plan.cta}
                </button>
              ) : (
                <a
                  href="/app"
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold hover:opacity-90 transition text-center block"
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
