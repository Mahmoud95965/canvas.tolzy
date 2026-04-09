'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Sparkles, ArrowLeft, Layers, MessageSquare, Zap, Target } from 'lucide-react';

export default function LandingPage() {
  const { user, loading, plan } = useAuth();
  const router = useRouter();
  const [heroPrompt, setHeroPrompt] = useState('');

  const heroState = useMemo(() => {
    if (!user) {
      return {
        subtitle: 'أنشئ حسابك أو سجل الدخول لتجربة Tolzy Copilot.',
        ctaHref: '/login',
        ctaText: 'تسجيل الدخول',
      };
    }
    if (plan === 'pro') {
      return {
        subtitle: 'اكتب طلبك واضغط Enter للمتابعة مباشرة إلى TOLZY AI.',
        ctaHref: '/app',
        ctaText: 'الانتقال إلى Copilot',
      };
    }
    return {
      subtitle: 'للوصول إلى القدرات المتقدمة، قم بالترقية إلى Tolzy Pro.',
      ctaHref: '/pricing',
      ctaText: 'ترقية إلى Pro',
    };
  }, [user, plan]);

  const handleHeroEnter = () => {
    const text = heroPrompt.trim();
    if (!text) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (plan === 'pro') {
      window.location.href = `https://ai.tolzy.me?prompt=${encodeURIComponent(text)}`;
      return;
    }
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden rtl relative">
      
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="h-20 flex items-center justify-between px-6 md:px-12 relative z-10 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Layers size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-white to-zinc-400">
            Tolzy AI
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-4 py-2"
          >
            تسجيل الدخول
          </Link>
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-sm font-bold text-black bg-white px-5 py-2.5 rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            ابدأ الآن <ArrowLeft size={16} />
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-20 pb-32">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
          <Sparkles size={16} />
          <span>الذكاء الاصطناعي الأكثر تطوراً في العالم العربي</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.2] max-w-4xl tracking-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          مساعدك الذكي لإنجاز <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 via-fuchsia-400 to-pink-400">
            كل شيء في ثوانٍ.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          سواء كنت تبحث عن إجابات، أو تحتاج إلى كتابة أكواد برمجية معقدة، أو حتى تصميم واجهات مستخدم مذهلة ورؤيتها تعمل مباشرة. Tolzy هو الحل المتكامل.
        </p>

        <div className="w-full max-w-2xl mb-5 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2 flex items-center gap-2">
            <input
              value={heroPrompt}
              onChange={(event) => setHeroPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleHeroEnter();
                }
              }}
              placeholder="اكتب فكرة أو سؤال... ثم اضغط Enter"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-white placeholder:text-zinc-400"
              dir="rtl"
            />
            <button
              onClick={handleHeroEnter}
              className="text-xs font-bold bg-white text-black px-4 py-2 rounded-xl hover:bg-zinc-200 transition"
            >
              إرسال
            </button>
          </div>
          <p className="text-sm text-zinc-400 mt-3">
            {heroState.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Link 
            href={heroState.ctaHref}
            className="flex items-center gap-2 text-lg font-bold text-white bg-indigo-600 px-8 py-4 rounded-full hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            {heroState.ctaText} <ArrowLeft size={20} />
          </Link>
        </div>

        {/* ── Features Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full px-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-right backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">محادثات ذكية</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">اطرح أي سؤال وسيجيبك Tolzy بأسلوب دقيق، موجز وداعم بالكامل للغة العربية.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-right backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">تصميم واجهات فوري</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">اطلب تصميم صفحة وسيولدها لك فحصاً مباشراً عبر محاكي حي (Live Preview) داخل المحادثة.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-right backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">تحليل الصور</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">ارفع أي صورة واطلب من تولزي شرحها واستخراج البيانات أو الأكواد منها بدقة متناهية.</p>
          </div>
        </div>
      </main>

    </div>
  );
}
