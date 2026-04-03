'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handlePromptSubmit = () => {
    if (prompt.trim()) {
      // Pass the prompt via localStorage or query params to dashboard later if needed
      router.push('/login');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  return (
    <div className="lovable-landing">
      {/* Dynamic Background Mesh */}
      <div className="mesh-bg">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
      </div>

      {/* Navigation */}
      <nav className="lovable-nav">
        <div className="lovable-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ec4899', fill: '#ec4899' }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          Tolzy
        </div>
        
        <div className="lovable-links">
          <a href="#">Solutions <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></a>
          <a href="#">Resources <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></a>
          <a href="#">Enterprise</a>
          <a href="#">Pricing</a>
          <a href="#">Community</a>
          <a href="#">Security</a>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'white', fontSize: '14px', textDecoration: 'none', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
            Log in
          </Link>
          <Link href="/login" style={{ color: 'black', fontSize: '14px', textDecoration: 'none', padding: '8px 16px', background: 'white', borderRadius: '6px', fontWeight: 500 }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="lovable-hero">
        <h1 className="lovable-h1">Build something Tolzy</h1>
        <p className="lovable-p">Create apps and websites by chatting with AI</p>

        {/* AI Prompt Box */}
        <div className="lovable-prompt-box">
          <textarea
            className="lovable-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Tolzy to create a..."
            autoFocus
          />

          <div className="lovable-prompt-actions">
            <button className="лов-icon-btn" title="Add File">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="лов-icon-btn" style={{ background: 'transparent', border: 'none', opacity: 0.7 }}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
              <button className="лов-icon-btn" style={{ background: 'transparent', border: 'none', opacity: 0.7 }}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12 2.1 7.1"/></svg>
              </button>
              <button className="лов-submit-btn" onClick={handlePromptSubmit}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
