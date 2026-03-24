'use client';
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Chrome, ArrowRight, Sparkles, Lock } from 'lucide-react'
import ParticlesBackground from './ParticlesBackground'

const Auth = () => {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : ''
        }
      })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'تم إرسال رابط التفعيل، تحقق من بريدك الإلكتروني.' })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : ''
      }
    })
    if (error) setMessage({ type: 'error', text: error.message })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: '#0c0c0e', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Immersive Background */}
      <ParticlesBackground />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(99,102,241,0.05), rgba(12,12,14,0.9) 70%)', pointerEvents: 'none' }} />

      <div className="animate-dramatic-up" style={styles.modal}>
        
        <div style={styles.header}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <h2 style={styles.title}>{mode === 'login' ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}</h2>
          <p style={styles.subtitle}>
            {mode === 'login' ? 'سجل دخولك لاستكمال مشاريعك الإبداعية' : 'ابدأ رحلتك في صناعة الواجهات المعقدة بذكاء'}
          </p>
        </div>

        <div style={styles.body}>
          <button className="auth-btn-google" style={styles.googleBtn} onClick={handleGoogleLogin}>
            <Chrome size={20} />
            المتابعة باستخدام Google
          </button>

          <div style={styles.divider}>
            <div style={styles.line}></div>
            <span style={styles.or}>أو عبر البريد</span>
            <div style={styles.line}></div>
          </div>

          <form onSubmit={handleAuth} style={styles.form}>
            <div style={styles.inputGroup}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                className="auth-input"
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                className="auth-input"
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-btn-primary" style={styles.submitBtn}>
              {loading ? (mode === 'login' ? 'جاري الدخول...' : 'جاري الإنشاء...') : (mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب')}
              <ArrowRight size={20} />
            </button>
          </form>

          {message.text && (
            <div style={{...styles.message, color: message.type === 'error' ? '#ff4d4d' : '#4ade80', background: message.type === 'error' ? 'rgba(255,77,77,0.1)' : 'rgba(74,222,128,0.1)', padding: 12, borderRadius: 8}}>
              {message.text}
            </div>
          )}
        </div>

        <div style={styles.toggleFooter}>
          {mode === 'login' ? (
            <>ليس لديك حساب؟ <span style={styles.toggleLink} onClick={() => setMode('signup')}>مستخدم جديد</span></>
          ) : (
            <>لديك حساب بالفعل؟ <span style={styles.toggleLink} onClick={() => setMode('login')}>تسجيل الدخول</span></>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'rgba(20,20,24,0.6)',
    backdropFilter: 'blur(32px)',
    borderRadius: '32px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.05)',
    zIndex: 10,
    margin: '20px'
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '15px',
    color: '#9ca3af',
    margin: 0,
    lineHeight: 1.5
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '16px',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '4px 0',
  },
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  or: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    right: '16px', /* Flipped for RTL support */
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    zIndex: 2
  },
  input: {
    width: '100%',
    padding: '16px 44px 16px 16px',
    borderRadius: '16px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '16px',
    direction: 'rtl'
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    boxShadow: '0 12px 24px rgba(99,102,241,0.3)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px'
  },
  message: {
    fontSize: '14px',
    textAlign: 'center',
    fontWeight: 500
  },
  toggleFooter: {
    fontSize: '15px',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '8px',
  },
  toggleLink: {
    color: '#a855f7',
    cursor: 'pointer',
    fontWeight: '700',
    marginLeft: '6px',
    transition: 'color 0.2s'
  },
}

export default Auth
