'use client';
import { useState } from 'react';
import { Monitor, Copy, Check } from 'lucide-react';

export default function MobileBlocker() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mobile-blocker-overlay">
      <div className="mobile-blocker-card">
        <div className="mobile-blocker-icon">
          <Monitor size={48} color="#6366f1" />
        </div>
        <h2 className="mobile-blocker-title">تجربة أفضل على الشاشات الكبيرة!</h2>
        <p className="mobile-blocker-text">
          أداة Tolzy Canvas مصممة لبناء وتوليد واجهات معقدة، يرجى فتح الرابط من جهاز الكمبيوتر أو اللاب توب الخاص بك للاستمتاع بالتجربة الكاملة.
        </p>
        <button onClick={handleCopy} className="mobile-blocker-btn">
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span>{copied ? 'تم نسخ الرابط!' : 'انسخ الرابط'}</span>
        </button>
      </div>
    </div>
  );
}
