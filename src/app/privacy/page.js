'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, ArrowRight, ChevronLeft, Lock, Eye, ShieldCheck, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AURORA_KEYFRAMES = `
  @keyframes auroraBG {
    0%, 100% { opacity: 0.2; transform: translate(0,0); }
    50% { opacity: 0.4; transform: translate(20px, -20px); }
  }
`;

const SECTIONS = [
  {
    title: 'جمع المعلومات',
    icon: <Eye size={20} />,
    content: [
      'نجمع المعلومات التي تقدمها أثناء التسجيل مثل الاسم وعنوان البريد الإلكتروني.',
      'نجمع بيانات الاستخدام بشكل تلقائي مثل نوع المتصفح وعنوان IP ووقت الوصول.',
      'يمكننا جمع بيانات عن التصاميم والمشاريع التي تنشئها داخل Tolzy Studio.',
    ]
  },
  {
    title: 'كيفية استخدام المعلومات',
    icon: <Globe size={20} />,
    content: [
      'تشغيل المنصة وتوفير الخدمات المطلوبة وتعزيز تجربة المستخدم.',
      'تحسين جودة الذكاء الاصطناعي وتطوير النماذج بناءً على أنماط الاستخدام المجهولة.',
      'التواصل معك بشأن تحديثات المنصة والميزات الجديدة.',
      'الامتثال للمتطلبات القانونية وحماية حقوق المستخدمين.',
    ]
  },
  {
    title: 'مشاركة المعلومات',
    icon: <ArrowRight size={20} />,
    content: [
      'لا نبيع أو نأجر بياناتك الشخصية لأطراف ثالثة في أي ظرف.',
      'قد نشارك البيانات مع مزودي الخدمة الموثوقين الذين يساعدوننا في تشغيل المنصة.',
      'قد نكشف عن المعلومات إذا طلب ذلك القانون أو لحماية حقوق Tolzy والمستخدمين.',
    ]
  },
  {
    title: 'أمان البيانات',
    icon: <Lock size={20} />,
    content: [
      'نستخدم تشفير SSL/TLS لجميع البيانات المنقولة بين متصفحك وخوادمنا.',
      'نعتمد على تقنيات سحابية آمنة ومعتمدة بمعايير دولية عالية لحماية بياناتك.',
      'نُجري مراجعات أمنية دورية لضمان سلامة بياناتك باستمرار.',
    ]
  },
  {
    title: 'حقوق المستخدم',
    icon: <ShieldCheck size={20} />,
    content: [
      'يحق لك الوصول إلى بياناتك الشخصية وتعديلها أو حذفها في أي وقت.',
      'يمكنك طلب تصدير نسخة كاملة من بياناتك بتنسيق قابل للقراءة.',
      'يمكنك إلغاء حسابك وطلب حذف جميع بياناتك نهائياً.',
    ]
  }
];

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh', background: '#07070a', color: '#fff',
      direction: 'rtl', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: 'relative', overflowX: 'hidden'
    }}>
      <style>{AURORA_KEYFRAMES}</style>

      {/* ── Background Effects ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)', filter: 'blur(100px)', animation: 'auroraBG 15s infinite' }} />
        <div style={{ position: 'absolute', bottom: '0', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)', filter: 'blur(120px)', animation: 'auroraBG 20s infinite reverse' }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', background: 'rgba(7,7,10,0.5)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em' }}>TOLZY</span>
        </div>
        <Link href="/" style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
           <ChevronLeft size={14} /> العودة للرئيسية
        </Link>
      </header>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '100px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', marginBottom: '24px', color: '#818cf8', fontSize: '12px', fontWeight: 700 }}>
          <Shield size={14} /> سياسة الخصوصية والأمان
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.03em' }}>نحن نقدر <span style={{ color: '#818cf8' }}>خصوصيتك</span></h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
          بياناتك هي أمانة لدينا. هذه السياسة توضح كيف نقوم بحماية معلوماتك الشخصية وضمان خصوصيتك أثناء استخدام منصة Tolzy.
        </p>
      </div>

      {/* ── Content ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '0 24px 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{
              padding: '32px', borderRadius: '28px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)', animation: 'fadeUp 0.8s ease backwards'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{s.title}</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {s.content.map((item, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: '10px', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
        © 2026 جميع الحقوق محفوظة لمنصة Tolzy لتقنيات الذكاء الاصطناعي
      </footer>
    </div>
  );
}
