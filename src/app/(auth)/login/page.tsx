'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function getReadableAuthError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as any).code) : '';
  const message = err instanceof Error ? err.message : 'Failed to sign in';

  if (code === 'auth/unauthorized-domain') {
    return 'هذا الدومين غير مضاف في Firebase Authorized Domains. أضف gateway.tolzy.me من إعدادات Firebase Authentication.';
  }
  if (code === 'auth/invalid-api-key') {
    return 'Firebase API Key غير صحيح أو غير مطابق للمشروع الحالي.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'طريقة تسجيل الدخول غير مفعلة في Firebase Authentication.';
  }
  if (code === 'auth/popup-blocked') {
    return 'المتصفح حظر نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.';
  }

  return message;
}

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = getReadableAuthError(err);
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="glass-card login-card">
        <div className="login-logo">
          <span className="gradient-text">Tolzy</span> Pages
        </div>
        <p className="login-subtitle">
          Sign in to start building beautiful websites
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'left',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="google-btn"
          id="google-sign-in-btn"
        >
          {isSigningIn ? (
            <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#333' }} />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {isSigningIn ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="login-divider">
          <span>Secure authentication by Google</span>
        </div>

        <p className="login-footer">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
