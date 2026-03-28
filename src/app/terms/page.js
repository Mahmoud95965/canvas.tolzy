'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles, FileText, ArrowRight, ChevronLeft, CheckCircle, Scale, CreditCard, LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AURORA_KEYFRAMES = `
  @keyframes auroraBG {
    0%, 100% { opacity: 0.2; transform: translate(0,0); }
    50% { opacity: 0.4; transform: translate(-20px, 20px); }
  }
`;

const SECTIONS = [
  {
    title: 'قبول الشروط',
    icon: <CheckCircle size={20} />,
    content: [
      'باستخدامك لمنصة Tolzy، فإنك تقر بأنك قرأت هذه الشروط وتوافق عليها.',
      'إذا كنت لا توافق على أي من هذه الشروط، يُرجى التوقف عن استخدام المنصة.',
      'نحتفظ بالحق في تعديل هذه الشروط في أي وقت مع إشعار مسبق للمستخدمين.',
    ]
  },
  {
    title: 'استخدام الخدمة',
    icon: <Sparkles size={20} />,
    content: [
      'يحق لك استخدام Tolzy Studio لإنشاء تصاميم لأغراض شخصية أو تجارية.',
      'يُحظر استخدام المنصة لإنشاء محتوى غير قانوني أو مسيء أو ينتهك حقوق الآخرين.',
      'أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور.',
      'يجب أن يكون عمرك 13 عاماً أو أكثر لاستخدام هذه الخدمة.',
    ]
  },
  {
    title: 'حقوق الملكية الفكرية',
    icon: <Shield size={20} />,
    content: [
      'التصاميم التي تنشئها عبر المنصة هي ملكك الكاملة.',
      'منصة Tolzy وتقنياتها وواجهتها محمية بموجب قوانين حقوق الملكية الفكرية.',
      'لا يحق لك نسخ أو توزيع أو بيع نظام Tolzy أو أجزاء منه.',
    ]
  },
  {
    title: 'الاشتراكات والمدفوعات',
    icon: <CreditCard size={20} />,
    content: [
      'بعض الميزات المتقدمة قد تتطلب اشتراكاً مدفوعاً في المستقبل.',
      'خلال الفترة الحالية، تتوفر باقات مجانية لتسهيل تجربة المبدعين.',
      'ستُبلَّغ بأي تغييرات في سياسة الأسعار قبل 30 يوماً من تطبيقها.',
    ]
  },
  {
    title: 'إنهاء الحساب',
    icon: <LogOut size={20} />,
    content: [
      'يحق لك إغلاق حسابك في أي وقت من خلال إعدادات الحساب.',
      'نحتفظ بالحق في تعليق أو إنهاء حسابات تنتهك هذه الشروط.',
      'عند حذف الحساب، سيتم حذف جميع بياناتك ومشاريعك وفقاً لسياسة الأمان الخاصة بنا.',
    ]
  },
  {
    title: 'القانون المطبق',
    icon: <Scale size={20} />,
    content: [
      'تخضع هذه الشروط للقوانين المعمول بها في نطاق تشغيل الخدمة.',
      'أي نزاعات تنشأ عن هذه الشروط يُسوَّى بالتفاوض الودي أولاً.',
    ]
  }
];

export default function TermsPage() {
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
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)', filter: 'blur(100px)', animation: 'auroraBG 15s infinite' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(120px)', animation: 'auroraBG 20s infinite reverse' }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', background: 'rgba(7,7,10,0.5)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: '24px', color: '#c084fc', fontSize: '12px', fontWeight: 700 }}>
          <FileText size={14} /> الشروط والأحكام
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.03em' }}>إطارنا <span style={{ color: '#c084fc' }}>القانوني</span></h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
          قواعد واضحة تضمن حقوقك وحقوق المنصة لتوفير أفضل تجربة إبداعية آمنة للجميع.
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
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(168,85,247,0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{s.title}</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {s.content.map((item, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', marginTop: '10px', flexShrink: 0 }} />
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
