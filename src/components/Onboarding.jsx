'use client';
import React from 'react'
import { Sparkles, Zap, Code, Layers, Star, ChevronRight, Sun, Moon, ArrowDown } from 'lucide-react'

const VIDEO_URL = 'https://umenbzifffhrsqbupwkm.supabase.co/storage/v1/object/sign/video/Custom%20recording%202026-03-24%2002-01-41.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NzdlYjhiYy00ZWVmLTRiY2UtOGJkNy05MzA1OWZlOWYyYTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby9DdXN0b20gcmVjb3JkaW5nIDIwMjYtMDMtMjQgMDItMDEtNDEubXA0IiwiaWF0IjoxNzc0NTA1MzkzLCJleHAiOjE4MDYwNDEzOTN9.-su-IZFQYiyna2orMLbfurXIQRy-Ebi72c9MNHfT66E'

const FEATURES = [
  {
    icon: Sparkles,
    badge: 'الذكاء الاصطناعي',
    title: 'صِف.. وشاهد التصميم يُولد.',
    sub: 'TOLZY Copilot V2.0 يحوّل أفكارك إلى واجهات كاملة، تفاعلية، جاهزة للنشر — في ثوانٍ معدودة.',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    glow: 'rgba(99,102,241,0.4)',
  },
  {
    icon: Layers,
    badge: 'بيئة العمل',
    title: 'لوحة عمل لا نهائية.',
    sub: 'مساحة عمل تفاعلية تدعم عدة إطارات، سحب بسهولة، تكبير وتصغير سلس — كل شيء تحت أصابعك.',
    gradient: 'linear-gradient(135deg, #06b6d4, #6366f1)',
    glow: 'rgba(6,182,212,0.4)',
  },
  {
    icon: Code,
    badge: 'الكود',
    title: 'كود نظيف، جاهز للاستخدام.',
    sub: 'كل تصميم مرفق بـ HTML و CSS كامل، احترافي — جاهز للنسخ أو التنزيل في لحظة.',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    glow: 'rgba(16,185,129,0.4)',
  },
  {
    icon: Zap,
    badge: 'السرعة',
    title: 'من الفكرة إلى المنتج.',
    sub: 'بدلاً من ساعات في Figma أو كتابة كود من الصفر — صِف ما تريده وكن مستعداً خلال دقيقة واحدة.',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    glow: 'rgba(245,158,11,0.4)',
  },
]

export default function Onboarding({ onGetStarted }) {
  const [dark, setDark] = React.useState(true)
  const [heroVisible, setHeroVisible] = React.useState(false)
  const sectionRefs = React.useRef([])
  const [sectionVisible, setSectionVisible] = React.useState([])
  const videoRef = React.useRef(null)

  React.useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => {
    const observers = []
    sectionRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setSectionVisible(prev => { const n = [...prev]; n[i] = true; return n })
            obs.disconnect()
          }
        },
        { threshold: 0.15 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  const bg = dark ? '#04040a' : '#f0f0f8'
  const text = dark ? '#f2f2f5' : '#111117'
  const textSub = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const glassCard = dark ? 'rgba(10,10,20,0.65)' : 'rgba(255,255,255,0.75)'
  const glassCardBorder = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const topbarBg = dark ? 'rgba(4,4,10,0.7)' : 'rgba(255,255,255,0.75)'
  const topbarBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const videoBg = dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.25)'

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: bg, color: text, direction: 'rtl', transition: 'background 0.4s, color 0.4s', overflowX: 'hidden' }}>

      {/* ── Sticky Topbar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
        background: topbarBg,
        backdropFilter: 'blur(28px)',
        borderBottom: `1px solid ${topbarBorder}`,
        transition: 'background 0.4s',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.03em' }}>TOLZY Canvas</span>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>Beta</span>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme toggle */}
          <button onClick={() => setDark(!dark)} style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
            title={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* CTA button */}
          <button onClick={onGetStarted} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '99px',
            background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff',
            fontSize: '13px', fontWeight: 700,
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)' }}
          >
            <Sparkles size={14} />
            ابدأ مجاناً
          </button>
        </div>
      </div>

      {/* ── HERO: Gradient & Ambient ── */}
      <section style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>

        {/* Ambient BG */}
        <div style={{ position: 'absolute', inset: 0, background: dark ? '#04040a' : '#f0f0f8', transition: 'background 0.4s' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '80%', background: dark ? 'radial-gradient(ellipse at top, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)' : 'radial-gradient(ellipse at top, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.05) 40%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '15%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 65%)', animation: 'ambientFloat 14s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)', animation: 'ambientFloat 18s ease-in-out infinite reverse', pointerEvents: 'none' }} />

        {/* Star-like dots pattern */}
        {dark && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: '0 0', pointerEvents: 'none', opacity: 0.4 }} />
        )}

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '60px 24px', maxWidth: '900px', width: '100%' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '7px 20px', borderRadius: '99px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            marginBottom: '28px', fontSize: '12px', fontWeight: 700, color: '#818cf8',
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s 0.1s ease',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            TOLZY Copilot V2.0.1 — متصل الآن
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 8vw, 100px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.95,
            marginBottom: '24px', color: text, transition: 'color 0.4s',
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 1s 0.25s cubic-bezier(0.16,1,0.3,1)'
          }}>
            بنِ واجهتك
            <br />
            <span style={{ background: 'linear-gradient(135deg,#818cf8 0%,#c084fc 50%,#f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              بكلماتك.
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 22px)', color: textSub,
            maxWidth: '580px', margin: '0 auto 48px', lineHeight: 1.75,
            opacity: heroVisible ? 1 : 0, transition: 'all 1s 0.45s ease',
          }}>
            صِف ما تريد بناءه، وشاهد TOLZY AI يُنشئ واجهات احترافية جاهزة للنشر في ثوانٍ. لا خبرة برمجية مطلوبة.
          </p>

          {/* CTA */}
          <div style={{ opacity: heroVisible ? 1 : 0, transition: 'all 0.9s 0.6s ease', display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onGetStarted} style={{
              padding: '18px 52px', borderRadius: '99px', fontSize: '18px', fontWeight: 800,
              background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)',
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(99,102,241,0.5)',
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(99,102,241,0.7)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.5)' }}
            >
              <Sparkles size={20} />
              ابدأ مجاناً الآن
            </button>
            <button onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })} style={{
              padding: '18px 36px', borderRadius: '99px', fontSize: '16px', fontWeight: 700,
              background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
              border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
              color: text, cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}
            >
              شاهد كيف يعمل ↓
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '56px', opacity: heroVisible ? 1 : 0, transition: 'all 1s 0.8s ease' }}>
            {[['V2.0.1', 'إصدار Copilot'], ['< 30ث', 'لإنشاء الواجهة'], ['100%', 'كود قابل للنشر']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center', padding: '14px 28px', borderRadius: '16px', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(8px)', transition: 'background 0.4s' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.04em', color: text, transition: 'color 0.4s' }}>{val}</div>
                <div style={{ fontSize: '12px', color: textSub, marginTop: '4px', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO SHOWCASE SECTION ── */}
      <section
        ref={el => sectionRefs.current[-1] !== undefined ? null : (sectionRefs.current[-1] = el)}
        style={{ padding: '80px 40px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* ambient glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Label */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '20px', fontSize: '12px', fontWeight: 700, color: '#818cf8' }}>
          <Sparkles size={12} />
          شاهد TOLZY Canvas في العمل
        </div>

        <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: text, textAlign: 'center', marginBottom: '48px', maxWidth: '600px', transition: 'color 0.4s' }}>
          من وصف بسيط إلى واجهة احترافية — في ثوانٍ.
        </h2>

        {/* Video Frame */}
        <div style={{
          width: '100%', maxWidth: '1100px', position: 'relative', zIndex: 1,
          borderRadius: '24px', overflow: 'hidden',
          border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: dark
            ? '0 0 0 1px rgba(99,102,241,0.15), 0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.1)'
            : '0 24px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.4s',
        }}>
          {/* Fake browser chrome bar */}
          <div style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 18px', background: dark ? 'rgba(20,20,30,0.95)' : '#f3f4f6', borderBottom: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ padding: '5px 24px', borderRadius: '8px', background: dark ? 'rgba(255,255,255,0.07)' : '#fff', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', fontSize: '12px', color: dark ? 'rgba(255,255,255,0.4)' : '#888', fontWeight: 600 }}>
                canvas.tolzy.me/editor
              </div>
            </div>
          </div>

          {/* Video */}
          <video
            src={VIDEO_URL}
            autoPlay muted loop playsInline
            style={{ width: '100%', display: 'block', maxHeight: '620px', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* ── Feature Sections ── */}
      <div id="features">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          const isVisible = sectionVisible[i]
          const isEven = i % 2 === 0

          return (
            <section
              key={i}
              ref={el => sectionRefs.current[i] = el}
              style={{
                minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '80px 40px', position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Section ambient */}
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 50% 60% at ${isEven ? '70%' : '30%'} 50%, ${f.glow.replace('0.4','0.06')} 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <div style={{ maxWidth: '1140px', width: '100%', display: 'flex', alignItems: 'center', gap: '60px', flexDirection: isEven ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>

                {/* Text */}
                <div style={{ flex: 1, minWidth: '280px', opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateX(0)' : `translateX(${isEven ? '-40px' : '40px'})`, transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', borderRadius: '99px', background: f.glow.replace('0.4','0.1'), border: `1px solid ${f.glow.replace('0.4','0.25')}`, marginBottom: '18px', fontSize: '12px', fontWeight: 800, color: '#c4b5fd' }}>
                    <Icon size={12} /> {f.badge}
                  </div>
                  <h2 style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '18px', color: text }}>
                    {f.title}
                  </h2>
                  <p style={{ fontSize: '18px', color: textSub, lineHeight: 1.8, maxWidth: '420px' }}>{f.sub}</p>
                  <button onClick={onGetStarted} style={{ marginTop: '28px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '99px', background: f.gradient, color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: `0 8px 24px ${f.glow}`, transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 16px 32px ${f.glow}` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 8px 24px ${f.glow}` }}
                  >
                    جرّبه الآن <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>

                {/* Visual Card */}
                <div style={{
                  flex: '0 0 440px', height: '300px', borderRadius: '28px',
                  background: glassCard, backdropFilter: 'blur(24px)',
                  border: `1px solid ${glassCardBorder}`,
                  boxShadow: `0 32px 80px ${f.glow.replace('0.4','0.15')}, inset 0 1px 0 ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                  transition: 'all 1.1s 0.15s cubic-bezier(0.16,1,0.3,1)',
                  transition: 'background 0.4s, opacity 0.9s, transform 0.9s'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: f.glow.replace('0.4','0.15'), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 0 40px ${f.glow}`, border: `1px solid ${f.glow}` }}>
                      <Icon size={30} color={dark ? '#fff' : '#333'} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: textSub }}>{f.badge}</div>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* ── CTA Section ── */}
      <section
        ref={el => sectionRefs.current[FEATURES.length] = el}
        style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* Glow BG */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, opacity: sectionVisible[FEATURES.length] ? 1 : 0, transform: sectionVisible[FEATURES.length] ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '18px', color: text }}>
            جاهز للبدء؟
          </div>
          <p style={{ fontSize: '20px', color: textSub, marginBottom: '48px', maxWidth: '480px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            انضم إلى مئات المصممين والمطورين الذين يبنون بـ TOLZY Canvas.
          </p>

          <button onClick={onGetStarted} style={{
            padding: '20px 56px', borderRadius: '99px', fontSize: '20px', fontWeight: 800,
            background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)',
            color: '#fff', cursor: 'pointer',
            boxShadow: '0 8px 40px rgba(99,102,241,0.5)',
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(99,102,241,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.5)' }}
          >
            <Sparkles size={22} />
            ابدأ مجاناً الآن
            <ChevronRight size={22} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <p style={{ marginTop: '24px', fontSize: '13px', color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)' }}>
            لا يتطلب بطاقة بنكية · مجاني تماماً في الفترة التجريبية
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '32px 40px', borderTop: `1px solid ${glassCardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={13} color="#fff" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 800, color: text }}>TOLZY Canvas</span>
        </div>
        <div style={{ fontSize: '13px', color: textSub }}>© 2026 TOLZY. جميع الحقوق محفوظة.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[['سياسة الخصوصية', '/privacy'], ['الشروط والأحكام', '/terms']].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: '13px', color: textSub, cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.color = textSub}
            >{label}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
