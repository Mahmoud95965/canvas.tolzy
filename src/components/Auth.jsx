'use client';
import React from 'react'
import { supabase } from '../lib/supabase'
import {
  Sparkles, Eye, EyeOff, Mail, Lock, User,
  Cpu, Code2, Layers, Users
} from 'lucide-react'

const FEATURES = [
  { icon: Layers, title: 'Canvas للتصميم', sub: 'لوحة عمل لا نهائية' },
  { icon: Cpu, title: 'Copilot الذكي', sub: 'نموذج V2.0.1' },
  { icon: Code2, title: 'كود جاهز فوراً', sub: 'HTML احترافي' },
  { icon: Users, title: 'مجتمع تقني', sub: 'مطورون ومصممون' },
]

const Auth = () => {
  const [mode, setMode] = React.useState('login')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [focusedField, setFocusedField] = React.useState(null)

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
        if (error) setError(error.message)
        else setError('تحقق من بريدك الإلكتروني لتفعيل الحساب!')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin + '/dashboard' : '/dashboard' }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      direction: 'rtl', overflow: 'hidden', fontFamily: "'Cairo', 'Inter', sans-serif"
    }}>

      {/* ══════════════════════════
          LEFT PANEL — Brand Side
      ══════════════════════════ */}
      <div style={{
        flex: '0 0 48%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #0f0c29 0%, #1a1050 35%, #24243e 70%, #0f0c29 100%)',
        display: 'flex', flexDirection: 'column', padding: '44px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        {/* BG glow orbs */}
        <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '16px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>TOLZY Canvas</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>AI-Powered UI Builder</div>
          </div>
        </div>

        {/* Main Copy */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 900, color: '#fff',
            letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '14px'
          }}>
            أطلق العنان<br />لإبداعك مع
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #f472b6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              TOLZY Canvas
            </span>
          </div>

          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '340px', marginBottom: '36px' }}>
            انضم إلى النخبة من المطورين والمصممين. صمم واجهاتك بذكاء مع Canvas، واكتب أكوادك بذكاء مع Copilot V2.0.
          </p>

          {/* Feature Grid 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(16px)',
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(99,102,241,0.2)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={17} color="#a5b4fc" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#e0e0f0' }}>{f.title}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{f.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 600
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            Copilot V2.0.1 متصل ونشط
          </div>
        </div>
      </div>

      {/* ══════════════════════════
          RIGHT PANEL — Form Side (Light)
      ══════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fafafa', overflowY: 'auto', padding: '40px 24px',
        direction: 'rtl',
      }}>

        <div style={{
          width: '100%', maxWidth: '420px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(24px)',
          transition: 'opacity 0.5s 0.1s ease, transform 0.5s 0.1s cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* Greeting */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#111', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {mode === 'login' ? '👋 مرحباً، اشتقنا إليك!' : '✨ ابدأ رحلتك الآن!'}
            </h1>
            <p style={{ fontSize: '14px', color: '#888', fontWeight: 500 }}>
              {mode === 'login' ? 'سجل الدخول للمتابعة حيث توقفت.' : 'أنشئ حساباً مجانياً وابدأ التصميم فوراً.'}
            </p>
          </div>

          {/* Social Logins */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {/* GitHub */}
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              background: '#fff', color: '#333',
              border: '1.5px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f5f5ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>

            {/* Google */}
            <button onClick={handleGoogle} disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              background: '#fff', color: '#333',
              border: '1.5px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f5f5ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>أو عن طريق البريد</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Name — signup only */}
            <div style={{ overflow: 'hidden', maxHeight: mode === 'signup' ? '60px' : '0', opacity: mode === 'signup' ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#555', marginBottom: '6px' }}>الاسم الكامل</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="محمد أحمد" value={name} onChange={e => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                    style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', fontSize: '14px', border: `1.5px solid ${focusedField === 'name' ? '#6366f1' : '#e5e7eb'}`, outline: 'none', fontFamily: 'inherit', boxShadow: focusedField === 'name' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none', transition: 'all 0.2s', direction: 'rtl', background: '#fff', color: '#111' }} />
                  <User size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'name' ? '#6366f1' : '#bbb', transition: 'color 0.2s' }} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#555', marginBottom: '6px' }}>البريد الإلكتروني</label>
              <div style={{ position: 'relative' }}>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required
                  style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', fontSize: '14px', border: `1.5px solid ${focusedField === 'email' ? '#6366f1' : '#e5e7eb'}`, outline: 'none', fontFamily: 'inherit', boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none', transition: 'all 0.2s', direction: 'rtl', background: '#fff', color: '#111' }} />
                <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#6366f1' : '#bbb', transition: 'color 0.2s' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#555' }}>كلمة المرور</label>
                {mode === 'login' && <span style={{ fontSize: '12px', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>نسيت كلمة المرور؟</span>}
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} required
                  style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', fontSize: '14px', border: `1.5px solid ${focusedField === 'password' ? '#6366f1' : '#e5e7eb'}`, outline: 'none', fontFamily: 'inherit', boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none', transition: 'all 0.2s', direction: 'ltr', background: '#fff', color: '#111', textAlign: 'right' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#bbb', display: 'flex', transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: error.includes('تحقق') ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${error.includes('تحقق') ? '#bbf7d0' : '#fecaca'}`, color: error.includes('تحقق') ? '#15803d' : '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
              background: loading ? '#c7d2fe' : 'linear-gradient(135deg,#6366f1,#7c3aed)',
              color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(99,102,241,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)'; }}
            >
              {loading
                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <>{mode === 'login' ? 'تسجيل الدخول ←' : 'إنشاء الحساب ←'}</>
              }
            </button>
          </form>

          {/* Switch mode */}
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
            {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} style={{ color: '#6366f1', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {mode === 'login' ? 'انضم إلينا الآن' : 'تسجيل الدخول'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
