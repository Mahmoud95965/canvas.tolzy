'use client';
import React from 'react';
import { Sparkles, ArrowUp, Zap, Image as ImageIcon, Layout, Code, Mic, Store, Video } from 'lucide-react';

const AURORA_KEYFRAMES = `
  @keyframes auroraLeft {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 60px) scale(1.08); }
    66% { transform: translate(30px, -30px) scale(0.95); }
  }
  @keyframes auroraRight {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(50px, -40px) scale(1.05); }
    66% { transform: translate(-20px, 50px) scale(0.97); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function Onboarding({ onGetStarted }) {
  const [mounted, setMounted] = React.useState(false);
  const [heroTextIndex, setHeroTextIndex] = React.useState(0);
  
  const heroTexts = [
    "ابدأ مشروعك القادم",
    "صمم صوراً مذهلة",
    "اسأل المساعد الذكي",
    "حسن إنتاجيتك الآن"
  ];

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    const interval = setInterval(() => {
      setHeroTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 3000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  const handleHubAction = (path) => {
    if (path === 'studio') onGetStarted?.(); 
    else if (path === 'copilot') window.open('https://copilot.tolzy.me', '_blank');
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh', background: '#07070a', color: '#fff',
      position: 'relative', overflowX: 'hidden', overflowY: 'auto', display: 'flex',
      flexDirection: 'column', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      direction: 'rtl',
    }}>
      <style>{AURORA_KEYFRAMES}</style>

      {/* ── Fixed Background Effects ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: '5%', left: '-10%', width: '50vw', height: '60vh', borderRadius: '50%', background: 'conic-gradient(from 200deg at 40% 60%, #6200ff 0deg, #0051ff 60deg, #00c3ff 120deg, #7b2fff 180deg, #ff00c8 240deg, #6200ff 360deg)', filter: 'blur(100px)', opacity: 0.3, animation: 'auroraLeft 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-8%', width: '40vw', height: '55vh', borderRadius: '50%', background: 'conic-gradient(from 60deg at 60% 40%, #8b00ff 0deg, #0062ff 80deg, #00e5ff 160deg, #a855f7 220deg, #ff00b8 300deg, #8b00ff 360deg)', filter: 'blur(100px)', opacity: 0.2, animation: 'auroraRight 24s ease-in-out infinite' }} />
      </div>

      {/* ── Topbar ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px',
        background: 'rgba(7,7,10,0.5)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>TOLZY</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', background: 'transparent', border: 'none' }}>المنتجات</button>
          <button style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', background: 'transparent', border: 'none' }}>الأسعار</button>
          <button onClick={onGetStarted} style={{ padding: '8px 22px', borderRadius: '10px', background: '#fff', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.2s' }}>دخول</button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main style={{ position: 'relative', zIndex: 2, minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '160px 24px 100px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '32px', color: '#818cf8', fontSize: '13px', fontWeight: 700, opacity: mounted ? 1 : 0, animation: 'fadeUp 0.8s ease forwards' }}>
          <Zap size={14} fill="#818cf8" /> منظومة Tolzy المتكاملة متوفرة الآن
        </div>
        
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 84px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.1, color: '#ffffff', marginBottom: '24px', maxWidth: '1000px', opacity: mounted ? 1 : 0, animation: 'fadeUp 0.8s 0.2s ease forwards' }}>
          من مجرد فكرة..<br/>
          <span style={{ background: 'linear-gradient(135deg, #fff 30%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>إلى مشروع متكامل</span>
        </h1>
        
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.5)', maxWidth: '650px', lineHeight: 1.6, marginBottom: '48px', fontWeight: 500, opacity: mounted ? 1 : 0, animation: 'fadeUp 0.8s 0.4s ease forwards' }}>
          منظومة ذكاء اصطناعي مصممة لتكون عقل مشروعك القادم. هل تبحث عن الإلهام، تصميم الصور، أو إدارة محادثاتك؟ Tolzy توفر لك كل ما تحتاجه في مكان واحد.
        </p>

        <button
          onClick={onGetStarted}
          style={{
            padding: '16px 48px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff', fontSize: '18px', fontWeight: 800, cursor: 'pointer', border: 'none',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 20px 40px rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', gap: '12px', opacity: mounted ? 1 : 0, animation: 'fadeUp 0.8s 0.6s ease forwards'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
          {heroTexts[heroTextIndex]} <ArrowUp size={20} style={{ transform: 'rotate(90deg)' }} />
        </button>
      </main>

      {/* ── App Hub ── */}
      <section id="apps" style={{ position: 'relative', zIndex: 2, padding: '100px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 900, marginBottom: '24px' }}>صالة عرض الأدوات</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
              تصفح مجموعة تطبيقاتنا المصممة لتغيير طريقتك في العمل والإبداع.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <AppCard 
              icon={<ImageIcon size={30} color="#fff" />}
              title="Tolzy Studio"
              badge="🎨 الأشهر"
              desc="حوّل الكلمات إلى صور وتصميمات احترافية في ثوانٍ. مساحة عملك الإبداعية الجديدة."
              actionText="افتح الأستوديو"
              onClick={() => handleHubAction('studio')}
              gradient="linear-gradient(135deg, #6366f1, #a855f7)"
            />
            
            <AppCard 
              icon={<Zap size={30} color="#fff" />}
              title="Tolzy Copilot"
              badge="🚀 جديد"
              desc="مساعدك الشخصي الشامل لجميع المهام. اسأل المساعد في البرمجة، الكتابة، أو أي مجال."
              actionText="ابدأ المحادثة"
              onClick={() => handleHubAction('copilot')}
              gradient="linear-gradient(135deg, #00c6ff, #0072ff)"
            />

            <AppCard 
              icon={<Layout size={30} color="rgba(255,255,255,0.3)" />}
              title="Tolzy Canvas"
              badge="🚀 قريباً"
              desc="بيئة عمل لا نهائية لإدارة مشاريعك البصرية وتجميع تصاميمك بذكاء في مساحة واحدة."
              actionText="انتظر الإطلاق"
              disabled
              gradient="linear-gradient(135deg, #1a1a2e, #16213e)"
            />

            <AppCard 
              icon={<Code size={30} color="rgba(255,255,255,0.3)" />}
              title="Tolzy Prompts"
              badge="⚡ ترقبوا"
              desc="مكتبة ضخمة من الأوامر الاحترافية الجاهزة للحصول على أفضل النتائج من الذكاء الاصطناعي."
              actionText="قريباً"
              disabled
              gradient="linear-gradient(135deg, #1a1a2e, #16213e)"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 2, padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', opacity: 0.6 }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>© 2026 جميع الحقوق محفوظة لمنصة Tolzy لتقنيات الذكاء الاصطناعي</p>
      </footer>
    </div>
  );
}

function AppCard({ icon, title, desc, actionText, onClick, badge, gradient, disabled }) {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <div 
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={!disabled ? onClick : undefined}
      style={{
        padding: '36px', borderRadius: '28px', background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
        textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '20px',
        transition: 'all 0.4s ease', cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1, transform: hovered ? 'translateY(-10px)' : 'none',
        position: 'relative', overflow: 'hidden'
      }}>
      
      {!disabled && hovered && (
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: '#6366f1', filter: 'blur(90px)', opacity: 0.15 }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '18px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: disabled ? 'none' : '0 10px 20px rgba(0,0,0,0.2)' }}>
          {icon}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, padding: '5px 12px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{badge}</span>
      </div>

      <div>
        <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '10px', color: '#fff' }}>{title}</h3>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
      </div>

      <button 
        style={{
          marginTop: '8px', padding: '10px 20px', borderRadius: '12px',
          background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
          fontSize: '14px', fontWeight: 700, border: 'none', cursor: disabled ? 'default' : 'pointer',
          transition: 'all 0.2s', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px'
        }}
      >
        {actionText} {!disabled && <ArrowUp size={14} style={{ transform: 'rotate(90deg)' }} />}
      </button>
    </div>
  );
}
