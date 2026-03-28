'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles, Book, ChevronLeft, Zap, Code, Layout, Rocket, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AURORA_KEYFRAMES = `
  @keyframes auroraMove {
    0%, 100% { transform: scale(1) translate(0,0); opacity: 0.3; }
    50% { transform: scale(1.1) translate(-20px, 20px); opacity: 0.5; }
  }
`;

const DOC_SECTIONS = [
  {
    title: 'البداية السريعة',
    icon: <Rocket size={22} />,
    content: 'تعلم كيف تبدأ مع Tolzy Studio في أقل من دقيقة. من إنشاء الحساب وحتى توليد أول صورة احترافية لك.'
  },
  {
    title: 'دليل الأوامر (Prompts)',
    icon: <Zap size={22} />,
    content: 'اكتشف سر كتابة الأوامر الفعالة. كيف تصف تخيلاتك بدقة لتحصل على نتائج مبهرة من الذكاء الاصطناعي.'
  },
  {
    title: 'أدوات التحرير',
    icon: <Layout size={22} />,
    content: 'شرح مفصل لجميع أدوات المحرر المطور، وكيفية استخدام فلاتر الأنماط وتغيير الأبعاد والجودة.'
  },
  {
    title: 'المساحة البرمجية',
    icon: <Code size={22} />,
    content: 'للمطورين: كيف يمكنك الاستفادة من التصاميم في مشاريعك البرمجية وفهم هيكلية الكود المولد.'
  }
];

export default function DocsPage() {
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
        <div style={{ position: 'absolute', top: '-5%', right: '5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', filter: 'blur(90px)', animation: 'auroraMove 12s infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '0%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)', filter: 'blur(110px)', animation: 'auroraMove 15s infinite reverse' }} />
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '24px', color: '#818cf8', fontSize: '12px', fontWeight: 700 }}>
          <Book size={14} /> التوثيق والتعليمات
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.03em' }}>تعلم كيف <span style={{ color: '#818cf8' }}>تبدع</span></h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
          دليلك الشامل لاستخدام كل أدوات منظومة Tolzy والوصول لأقصى إمكانيات الذكاء الاصطناعي في مشاريعك.
        </p>
      </div>

      {/* ── Sections ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 24px 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {DOC_SECTIONS.map((s, i) => (
            <div key={i} style={{
              padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>{s.title}</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{s.content}</p>
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 700, fontSize: '14px' }}>
                اقرأ المزيد <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              </div>
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
