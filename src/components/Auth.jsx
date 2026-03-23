'use client';
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Chrome, ArrowRight, X } from 'lucide-react'

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
      else setMessage({ type: 'success', text: 'Check your email for the confirmation link!' })
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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.logo}>Tolzy</div>
          <h2 style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
          <p style={styles.subtitle}>
            {mode === 'login' ? 'Sign in to continue your projects' : 'Start your creative journey with Tolzy'}
          </p>
        </div>

        <div style={styles.body}>
          <button style={styles.googleBtn} onClick={handleGoogleLogin}>
            <Chrome size={20} />
            Continue with Google
          </button>

          <div style={styles.divider}>
            <div style={styles.line}></div>
            <span style={styles.or}>or</span>
            <div style={styles.line}></div>
          </div>

          <form onSubmit={handleAuth} style={styles.form}>
            <div style={styles.inputGroup}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Continue' : 'Create Account')}
              <ArrowRight size={18} />
            </button>
          </form>

          {message.text && (
            <div style={{...styles.message, color: message.type === 'error' ? '#ff4d4d' : '#4caf50'}}>
              {message.text}
            </div>
          )}
        </div>

        <div style={styles.toggleFooter}>
          {mode === 'login' ? (
            <>Don't have an account? <span style={styles.toggleLink} onClick={() => setMode('signup')}>Sign up</span></>
          ) : (
            <>Already have an account? <span style={styles.toggleLink} onClick={() => setMode('login')}>Sign in</span></>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#1a1a1a',
    borderRadius: '24px',
    border: '1px solid #333',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-1px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    margin: 0,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '15px',
    fontWeight: '500',
    border: 'none',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '8px 0',
  },
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: '#333',
  },
  or: {
    fontSize: '13px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputGroup: {
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    borderRadius: '12px',
    backgroundColor: '#222',
    border: '1px solid #333',
    color: '#fff',
    fontSize: '15px',
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#007aff',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '500',
  },
  message: {
    fontSize: '13px',
    color: '#4caf50',
    textAlign: 'center',
  },
  toggleFooter: {
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
    marginTop: '8px',
  },
  toggleLink: {
    color: '#007aff',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: '4px',
  },
}

export default Auth
