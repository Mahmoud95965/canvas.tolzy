'use client';
import React, { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth'
import {
  Sparkles, Eye, EyeOff, Mail, Lock, User,
  ArrowRight, ShieldCheck, Zap, Palette, Monitor
} from 'lucide-react'

const BACKGROUNDS = [
  '/auth-bg/bg1.png',
  '/auth-bg/bg2.png',
  '/auth-bg/bg3.png'
];

const GREETINGS = [
  "ماذا سنصنع اليوم؟",
  "جاهز لإبهار العالم؟",
  "مرحباً بك مجدداً في استوديو الإبداع",
  "أفكارك تنتظر أن تصبح واقعاً"
];

const Auth = () => {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [bgIndex, setBgIndex] = useState(0)
  const [greetingIndex, setGreetingIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    setBgIndex(Math.floor(Math.random() * BACKGROUNDS.length))
    setGreetingIndex(Math.floor(Math.random() * GREETINGS.length))
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName: name })
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error(err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      direction: 'rtl', overflow: 'hidden', fontFamily: "'Cairo', 'Inter', sans-serif",
      background: '#040404'
    }}>
      
      {/* ── Left Side: Cinematic AI Showcase ── */}
      <div style={{
        flex: '1.2', position: 'relative', overflow: 'hidden',
        display: 'none', // Hidden on mobile, handled via media query logic in a real app but keeping for split layout
        md: { display: 'block' } // conceptual
      }} className="auth-showcase">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BACKGROUNDS[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 10s ease-out',
          transform: mounted ? 'scale(1.1)' : 'scale(1)',
        }} />
        
        {/* Overlay Gradients */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to right, rgba(4,4,4,1) 0%, rgba(4,4,4,0.3) 30%, transparent 100%)' 
        }} />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to top, rgba(4,4,4,0.8) 0%, transparent 40%)' 
        }} />

        {/* Content on Image */}
        <div style={{ 
          position: 'absolute', bottom: '40px', right: '40px',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <div style={{ 
             padding: '6px 14px', borderRadius: '8px', 
             background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
             border: '1px solid rgba(255,255,255,0.1)',
             display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Sparkles size={14} color="#a855f7" />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>تم توليدها بواسطة Tolzy Studio</span>
          </div>
        </div>

        {/* Brand Logo Floating */}
        <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Tolzy</span>
        </div>
      </div>

      {/* ── Right Side: Glassmorphism Form ── */}
      <div style={{
        flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', zIndex: 10
      }}>
        {/* Glass Container */}
        <div style={{
          width: '100%', maxWidth: '440px',
          padding: '48px', borderRadius: '32px',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>

          {/* Dynamic Welcome Message (Login Only) */}
          {mode === 'login' && (
            <div style={{ 
              marginBottom: '12px', fontSize: '14px', fontWeight: 700, 
              color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Zap size={14} fill="#a855f7" /> {GREETINGS[greetingIndex]}
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '-0.03em' }}>
              {mode === 'login' ? 'عُد إلى مساحة إبداعك' : 'افتح أبواب خيالك مع Tolzy Studio'}
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              {mode === 'login' 
                ? 'أدواتك السحرية جاهزة، والاستوديو في انتظار أفكارك الجديدة. سجل دخولك لاستكمال روائعك الفنية.' 
                : 'انضم لمجتمع المبدعين، وحوّل كلماتك إلى تحف فنية وتصميمات احترافية في ثوانٍ معدودة.'}
            </p>
          </div>

          {/* Bullets (Signup Only) */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <Bullet icon={<ShieldCheck size={16} />} text="وصول فوري لأقوى موديلات الذكاء الاصطناعي" />
              <Bullet icon={<Palette size={16} />} text="مساحة احترافية مصممة لراحتك وتركيزك" />
              <Bullet icon={<Monitor size={16} />} text="من الفكرة إلى اللوحة الفنية بضغطة زر" />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mode === 'signup' && (
              <InputBlock label="الاسم الكامل" icon={<User size={18} />} placeholder="محمد أحمد" value={name} onChange={setName} />
            )}
            <InputBlock label="البريد الإلكتروني" icon={<Mail size={18} />} placeholder="you@example.com" value={email} onChange={setEmail} type="email" />
            <InputBlock 
              label="كلمة المرور" 
              icon={<Lock size={18} />} 
              placeholder="••••••••" 
              value={password} 
              onChange={setPassword} 
              type={showPassword ? 'text' : 'password'}
              toggleShow={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
            />

            {error && (
              <div style={{ 
                padding: '12px 16px', borderRadius: '12px', 
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171', fontSize: '13px', fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: '10px', width: '100%', padding: '16px', borderRadius: '14px',
              background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff', fontSize: '16px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
            }}
             onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
             onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <div style={{ width: 22, height: 22, border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>{mode === 'login' ? 'الدخول للاستوديو' : 'أنشئ مساحتك الإبداعية الآن'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Social / Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '32px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>أو تابع عبر</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <button onClick={handleGoogle} style={{
             width: '100%', padding: '14px', borderRadius: '14px',
             background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
             color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
             transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>

          {/* Footer Text */}
          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'login' ? 'جديد في عالمنا؟ ' : 'لديك مساحة عمل بالفعل؟ '}
            <span 
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} 
              style={{ color: '#fff', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              {mode === 'login' ? 'ابدأ رحلتك الإبداعية مجاناً' : 'ادخل إلى الاستوديو'}
            </span>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .auth-showcase { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function Bullet({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ 
        width: 28, height: 28, borderRadius: '8px', 
        background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7'
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{text}</span>
    </div>
  );
}

function InputBlock({ label, icon, placeholder, value, onChange, type = 'text', toggleShow, showPassword }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', paddingRight: '4px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input 
          type={type} placeholder={placeholder} value={value} 
          onChange={e => onChange(e.target.value)} 
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ 
            width: '100%', padding: '14px 44px 14px 16px', borderRadius: '14px', 
            background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: '#fff', fontSize: '14px', outline: 'none', transition: 'all 0.2s',
            fontFamily: 'inherit', textAlign: 'right', direction: 'rtl'
          }} 
        />
        <div style={{ 
          position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#6366f1' : 'rgba(255,255,255,0.2)', transition: 'color 0.2s'
        }}>
          {icon}
        </div>
        {toggleShow && (
          <button type="button" onClick={toggleShow} style={{ 
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' 
          }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default Auth
