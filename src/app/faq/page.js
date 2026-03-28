'use client';
import React from 'react';
import { Sparkles, ArrowRight, HelpCircle, MessageCircle, Zap, ShieldCheck, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AURORA_KEYFRAMES = `
  @keyframes auroraPulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function FAQPage() {
  const router = useRouter();

  const faqs = [
    {
      q: "ما هو T O L Z Y Studio؟",
      a: "هو الجيل القادم من أدوات التصميم المدعومة بالذكاء الاصطناعي، يتيح لك تحويل أفكارك النصية إلى صور وتصاميم فنية واحترافية في ثوانٍ معدودة باستخدام أقوى النماذج العالمية."
    },
    {
      q: "كيف أبدأ مشروعي الأول؟",
      a: "ببساطة قم بتسجيل الدخول، ثم اكتب وصفاً دقيقاً لما تخيله في صندوق الأوامر بلوحة التحكم، وسيقوم النظام بتوليد العمل الفني لك فوراً مع إمكانية التعديل عليه."
    },
    {
      q: "هل يمكنني تصدير أعمالي؟",
      a: "نعم، توفر المنصة ميزة التنزيل المباشر للصور بدقة عالية، كما يمكنك حفظ مشاريعك في سحابة Tolzy للعودة إليها في أي وقت ومن أي جهاز."
    },
    {
      q: "ماهي تكلفة استخدام المنصة؟",
      a: "نحن نوفر باقة مجانية لجميع المبدعين الجدد، كما توفر الباقات الاحترافية حدود إنتاج أعلى ومزايا حصرية للتخصيص الدقيق وجودة الصور الفائقة."
    },
    {
      q: "كيف أتواصل مع الدعم الفني؟",
      a: "فريقنا متاح دائماً عبر البريد الإلكتروني أو من خلال قنوات التواصل الاجتماعي الرسمية لـ Tolzy لمساعدتك في أي استفسار تقني أو فني."
    }
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#07070a', color: '#fff',
      direction: 'rtl', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: 'relative', overflowX: 'hidden'
    }}>
      <style>{AURORA_KEYFRAMES}</style>

      {/* ── Background Effects ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', filter: 'blur(80px)', animation: 'auroraPulse 10s infinite' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)', filter: 'blur(100px)', animation: 'auroraPulse 12s infinite reverse' }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', background: 'rgba(7,7,10,0.4)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em' }}>TOLZY</span>
        </div>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>العودة للمنصة</button>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '24px', color: '#818cf8', fontSize: '13px', fontWeight: 700 }}>
          <HelpCircle size={14} /> مركز المساعدة والدعم
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.04em' }}>كيف يمكننا <span style={{ color: '#818cf8' }}>مساعدتك؟</span></h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>ابحث عن إجابات سريعة للأسئلة الشائعة وتعرف على كل ميزات منظومة Tolzy المتطورة.</p>
      </section>

      {/* ── FAQ List ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '0 24px 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              padding: '28px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)', transition: 'all 0.3s', animation: `slideIn 0.8s ${i * 0.1}s ease backwards`
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div style={{ marginTop: '4px', padding: '8px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>{faq.q}</h3>
                  <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact Section ── */}
        <div style={{ marginTop: '80px', padding: '48px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px' }}>لم تجد إجابتك؟</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>فريق الدعم الفني جاهز لمساعدتك في أي وقت على مدار الساعة.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button style={{ padding: '14px 28px', borderRadius: '14px', background: '#fff', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageCircle size={18} /> تواصل معنا
            </button>
            <button style={{ padding: '14px 28px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} /> التقارير التقنية
            </button>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
        © 2026 جميع الحقوق محفوظة لمنصة Tolzy لتقنيات الذكاء الاصطناعي
      </footer>
    </div>
  );
}
