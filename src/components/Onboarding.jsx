'use client';
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, LayoutGrid, Code, Download, Zap } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';

const slides = [
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
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const nextStep = () => {
    if (animating) return;
    if (currentStep < slides.length - 1) {
      setAnimating(true);
      setCurrentStep(prev => prev + 1);
      setTimeout(() => setAnimating(false), 800); 
    } else {
      onComplete();
    }
  };

  const slide = slides[currentStep];
  const Icon = slide.icon;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
      backgroundColor: '#0c0c0e', color: '#fff', display: 'flex', flexDirection: 'column'
    }}>
      {/* 3D Background */}
      <ParticlesBackground />
      
      {/* Top Gradient Overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(99,102,241,0.1), transparent 60%)', zIndex: 1, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        
        {/* Unmount/remount standard React trick to re-trigger CSS animations */}
        <div key={currentStep} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px' }}>
          <div className="animate-dramatic-up" style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '32px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)'
          }}>
            <Icon size={40} color="#818cf8" />
          </div>
          
          <h1 className="animate-dramatic-up delay-200 glow-text-strong" style={{
             fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.02em', 
             lineHeight: 1.2, marginBottom: '24px',
             background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
             WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {slide.title}
          </h1>
          
          <p className="animate-dramatic-fade delay-400" style={{
             fontSize: 'clamp(16px, 2vw, 24px)', color: '#9ca3af', lineHeight: 1.6, maxWidth: '600px'
          }}>
            {slide.subtitle}
          </p>
        </div>

      </div>

      {/* Footer Controls */}
      <div style={{ position: 'relative', zIndex: 10, padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Indicators */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {slides.map((s, i) => (
            <div key={s.id} style={{
              width: i === currentStep ? '32px' : '8px', height: '8px', borderRadius: '4px',
              background: i === currentStep ? '#6366f1' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          ))}
        </div>

        {/* Next/Start Button */}
        <button 
          onClick={nextStep}
          className="animate-dramatic-fade delay-600"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px 32px', borderRadius: '99px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff', fontSize: '18px', fontWeight: 600, border: 'none',
            cursor: 'pointer', outline: 'none', transition: 'box-shadow 0.2s',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {currentStep === slides.length - 1 ? 'ابدأ الاستخدام الآن' : 'التالي'}
          {currentStep === slides.length - 1 ? <Sparkles size={20} /> : <ArrowLeft size={20} />}
        </button>
      </div>

    </div>
  );
}
