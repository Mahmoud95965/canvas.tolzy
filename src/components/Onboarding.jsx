'use client';
import React, { useEffect } from 'react';
import { Sparkles, LayoutGrid, Download, Zap, ArrowLeft } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';

const sections = [
  {
    id: 1,
    title: 'مرحباً بك في مستقبل تصميم الواجهات',
    subtitle: 'ابنِ واجهات ويب احترافية ومعقدة باستخدام الذكاء الاصطناعي فقط عبر الوصف النصي.',
    icon: Sparkles
  },
  {
    id: 2,
    title: 'TOLZY Copilot V2.0.1',
    subtitle: 'نموذج ذكاء اصطناعي خارق مصمم خصيصاً لفهم متطلبات التصميم وتحويل الشروحات إلى كود جاهز في ثوانٍ معدودة.',
    icon: Zap
  },
  {
    id: 3,
    title: 'تعديل وتخصيص لانهائي',
    subtitle: 'منطقة عمل تفاعلية تسمح لك بتجربة الكود مباشرة، التعديل على النوافذ، وإعادة صياغة الأجزاء المعقدة بسهولة.',
    icon: LayoutGrid
  },
  {
    id: 4,
    title: 'تصدير فوري لكود نظيف',
    subtitle: 'احصل على أكواد HTML & React جاهزة للتطوير، أو قم برفع مشاريعك للاستضافة بضغطة زر واحدة.',
    icon: Download
  }
];

export default function Onboarding({ onComplete }) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0) scale(1)';
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="premium-scrollbar" style={{
      position: 'absolute', inset: 0, zIndex: 9999,
      backgroundColor: '#0c0c0e', color: '#fff',
      overflowY: 'auto', overflowX: 'hidden', direction: 'rtl'
    }}>
      {/* Fixed 3D Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticlesBackground />
        {/* Gradient Overlay for better readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(99,102,241,0.15), rgba(12,12,14,0.85) 80%)', pointerEvents: 'none' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Header/Logo area */}
        <div style={{ width: '100%', padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>TOLZY Canvas</span>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="scroll-reveal" style={{
              minHeight: index === 0 ? '60vh' : '80vh', width: '100%', maxWidth: '1000px', padding: '60px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              opacity: 0, transform: 'translateY(60px) scale(0.95)', transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '30px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 20px 40px rgba(99,102,241,0.15)'
              }}>
                <Icon size={48} color="#818cf8" />
              </div>
              
              <h2 style={{
                 fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-0.02em', 
                 lineHeight: 1.2, marginBottom: '24px',
                 background: 'linear-gradient(to left, #ffffff, #a5b4fc)',
                 WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {section.title}
              </h2>
              
              <p style={{
                 fontSize: 'clamp(18px, 3vw, 24px)', color: '#9ca3af', lineHeight: 1.7, maxWidth: '700px'
              }}>
                {section.subtitle}
              </p>
            </div>
          );
        })}

        {/* Final CTA Section */}
        <div className="scroll-reveal" style={{
          minHeight: '80vh', width: '100%', padding: '60px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transform: 'translateY(60px)', transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            background: 'rgba(20,20,24,0.6)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '60px 40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)', maxWidth: '600px', width: '100%', textAlign: 'center',
            backdropFilter: 'blur(32px)'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Zap size={32} color="#22c55e" />
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>جاهز لصنع المعجزات؟</h3>
            <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '40px' }}>سجل دخولك الآن وابدأ في إنشاء واجهاتك الأولى مجاناً لتنضم إلى المطورين المحترفين.</p>
            <button 
              onClick={onComplete}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '18px 40px', borderRadius: '99px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff', fontSize: '20px', fontWeight: 700, border: 'none',
                cursor: 'pointer', outline: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 12px 40px rgba(99,102,241,0.5)',
                width: '100%', justifyContent: 'center'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(99,102,241,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'; }}
            >
              ابدأ الاستخدام الآن
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        {/* Footer padding */}
        <div style={{ height: '10vh' }}></div>
      </div>
    </div>
  );
}
