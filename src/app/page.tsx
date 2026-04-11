'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  Layers, 
  MessageSquare, 
  Zap, 
  Code2, 
  Shield, 
  Globe, 
  Rocket,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Cpu,
  LogOut,
  Settings,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Check
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function LandingPage() {
  const { user, plan, signOut, usageCount, usageLimit } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [heroPrompt, setHeroPrompt] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const heroState = useMemo(() => {
    if (!user) {
      return {
        subtitle: 'أنشئ حسابك الآن لتجربة TOLZY AI مجاناً.',
        ctaHref: '/login',
        ctaText: 'ابدأ التجربة مجاناً',
      };
    }
    return {
      subtitle: 'أهلاً بك مجدداً! ابدأ محادثة جديدة الآن.',
      ctaHref: '/app',
      ctaText: 'الانتقال إلى المحادثة',
    };
  }, [user]);

  const handleHeroEnter = () => {
    const text = heroPrompt.trim();
    if (!text) return;
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/app?prompt=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex flex-col font-sans overflow-x-hidden rtl selection:bg-indigo-500/30">
      
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1] 
          }}
          className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-fuchsia-600/10 dark:bg-fuchsia-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] brightness-100 contrast-150" />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 z-50 border-b border-zinc-200 dark:border-white/5 bg-background/60 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform duration-500">
            <Cpu size={20} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter aurora-text">
            TOLZY AI
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          {!user ? (
            <>
              <Link 
                href="/login" 
                className="text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-foreground transition-colors hidden md:block"
              >
                تسجيل الدخول
              </Link>
              <Link 
                href="/login" 
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-foreground px-6 py-3 rounded-2xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                ابدأ الآن <ArrowLeft size={16} />
              </Link>
            </>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="group relative flex items-center gap-2 p-1 pr-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors border border-zinc-200 dark:border-white/10"
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                  className="w-8 h-8 rounded-full border border-zinc-200 dark:border-white/20 shrink-0 object-cover bg-zinc-800 ring-2 ring-indigo-500/30"
                  alt="Avatar"
                />
                <ChevronDown size={14} className="text-zinc-500 dark:text-zinc-400 group-hover:text-foreground transition-colors" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setProfileOpen(false)} 
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full left-0 mt-4 w-64 bg-background border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl" 
                      dir="rtl"
                    >
                      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                        <p className="text-sm font-bold text-foreground truncate">{user.displayName || 'مستخدم TOLZY AI'}</p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5 tracking-wider" dir="ltr">{user.email}</p>
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${plan === 'pro' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
                            {plan === 'pro' ? 'TOLZY PRO' : 'خطة فري'}
                          </span>
                        </div>
                        {plan === 'free' && (
                           <div className="mt-4 bg-zinc-100 dark:bg-white/5 rounded-2xl p-3 border border-zinc-200 dark:border-white/5">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.1em]">الاستخدام اليومي</span>
                                 <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{usageCount} / {usageLimit}</span>
                              </div>
                              <div className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (usageCount / usageLimit) * 100)}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" 
                                 />
                              </div>
                              <p className="text-[8px] text-zinc-500 mt-2 font-bold leading-tight uppercase tracking-tighter">يتم تصفير العداد كل 24 ساعة بمشيئة الله.</p>
                           </div>
                        )}
                      </div>
                      
                      <div className="p-2 flex flex-col gap-1">
                        <button onClick={() => setTheme('light')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${theme === 'light' ? 'bg-zinc-100 dark:bg-white/10 text-foreground' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-foreground'}`}>
                          <div className="flex items-center gap-3 text-xs font-bold"><Sun size={14} /> وضع النهار</div>
                          {theme === 'light' && <Check size={12} />}
                        </button>
                        <button onClick={() => setTheme('dark')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-zinc-100 dark:bg-white/10 text-foreground' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-foreground'}`}>
                          <div className="flex items-center gap-3 text-xs font-bold"><Moon size={14} /> الوضع الليلي</div>
                          {theme === 'dark' && <Check size={12} />}
                        </button>
                      </div>

                      <div className="border-t border-zinc-200 dark:border-white/5 p-2 flex flex-col gap-1">
                        <Link href="/app" className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-foreground rounded-xl transition-colors">
                          <MessageSquare size={14} /> بدء الدردشة
                        </Link>
                        {plan === 'free' ? (
                          <button onClick={() => router.push('https://www.tolzy.me/pricing')} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors">
                            <Sparkles size={14} /> ترقية إلى Pro
                          </button>
                        ) : (
                          <button onClick={() => router.push('https://www.tolzy.me/pricing')} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-foreground rounded-xl transition-colors">
                            <Sparkles size={14} /> الخطط والأسعار
                          </button>
                        )}
                        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                          <LogOut size={14} /> تسجيل الخروج
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-20 pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
          >
            <Terminal size={14} />
            <span>الذكاء الاصطناعي الأذكى للإجابة والبرمجة</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black text-foreground mb-8 leading-[1.1] max-w-5xl tracking-tighter transition-colors"
          >
            اسأل عن أي شيء، <br />
            <span className="aurora-text">أتقن لغة المستقبل.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl leading-relaxed transition-colors"
          >
            TOLZY AI هو نموذج لغوي متقدم مصمم للإجابة على كافة تساؤلاتك بذكاء فائق، مع تخصص استثنائي في عالم البرمجة، حل المشكلات التقنية، وشرح المفاهيم المعقدة ببساطة.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-3xl mb-12 px-2"
          >
            <div className="hex-glass p-1.5 md:p-2.5 rounded-[2rem] shadow-xl flex items-center gap-2 group focus-within:border-indigo-500/50 transition-all border border-zinc-200 dark:border-white/10">
              <input
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHeroEnter()}
                placeholder="اكتب أي سؤال أو كود برمجي هنا لتبدأ..."
                className="flex-1 bg-transparent px-5 py-3 text-sm md:text-base outline-none text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
              />
              <button
                onClick={handleHeroEnter}
                className="bg-foreground text-background h-12 md:h-14 px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-wider hover:opacity-90 transition active:scale-95 shadow-lg"
              >
                اسأل
              </button>
            </div>
            <p className="text-[11px] font-bold text-zinc-500 mt-4 uppercase tracking-widest">
              {heroState.subtitle}
            </p>
          </motion.div>
        </section>

        {/* ── Capabilities Highlights ── */}
        <section className="py-20 px-4 flex flex-col items-center">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { 
                   icon: <MessageSquare size={32} />, 
                   title: 'إجابات ذكية وشاملة', 
                   desc: 'تفاعل مع نموذج يفهم السياق بدقة، ويجيبك على كافة أسئلتك في مختلف المجالات العلمية، الأدبية، واليومية.' 
                 },
                 { 
                   icon: <Code2 size={32} />, 
                   title: 'خبير البرمجة الأول', 
                   desc: 'متخصص في كتابة الأكواد، اكتشاف الأخطاء، وشرح الخوارزميات بأكثر من 20 لغة برمجة مختلفة.' 
                 },
                 { 
                   icon: <Zap size={32} />, 
                   title: 'سرعة استجابة فائقة', 
                   desc: 'احصل على إجاباتك وتحليلاتك البرمجية في أجزاء من الثانية بفضل محرك المعالجة المتطور لدينا.' 
                 }
               ].map((item, i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="hex-glass p-8 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm"
                 >
                    <div className="text-indigo-600 dark:text-indigo-400 mb-6">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-4 text-foreground">{item.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                 </motion.div>
               ))}
            </div>
        </section>

        {/* ── Journey / Programming Section ── */}
        <section className="py-24 bg-zinc-100/50 dark:bg-white/5 border-y border-zinc-200 dark:border-white/5">
           <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl font-black mb-6 leading-tight">رفيقك في <br /><span className="text-indigo-500">رحلة التعلم والبرمجة.</span></h2>
                 <p className="text-zinc-400 mb-8 leading-relaxed">سواء كنت مبرمجاً محترفاً تبحث عن تحسين الكود الخاص بك، أو مبتدئاً يحاول فهم أساسيات البرمجية، TOLZY AI مصمم ليكون المعلم والمساعد الشخصي لك على مدار الساعة.</p>
                 
                 <div className="space-y-6">
                    {[
                      { title: 'تحليل الأكواد', desc: 'ارسل الكود الخاص بك ودعنا نكتشف الثغرات ونقترح التحسينات.' },
                      { title: 'إجابات دقيقة', desc: 'نقدم لك أفضل الممارسات المتبعة عالمياً في عالم تطوير البرمجيات.' },
                      { title: 'شرح المفاهيم', desc: 'تبسيط أعقد نظريات الحاسب الآلي والذكاء الاصطناعي.' }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 font-black text-xs">
                            <CheckCircle2 size={16} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-foreground mb-1 uppercase tracking-tight">{step.title}</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">{step.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="relative">
                 <div className="hex-glass p-1 rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800" 
                      alt="Coding and Programming" 
                      className="w-full h-full object-cover rounded-[1.4rem] opacity-60"
                    />
                 </div>
                 <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-6 -left-6 hex-glass px-4 py-2 rounded-xl text-[10px] font-black uppercase text-indigo-400"
                  >
                    Processing Query...
                 </motion.div>
              </div>
           </div>
        </section>

        {/* ── TOLZY Hex Teaser Section ── */}
        <section className="py-24 px-6 max-w-7xl mx-auto w-full">
           <div className="hex-glass-glow hex-glass p-12 rounded-[3.5rem] relative overflow-hidden text-center">
              <div className="relative z-10">
                 <motion.div 
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8"
                 >
                    <Zap size={16} /> قريباً في صيف 2026
                 </motion.div>
                 
                 <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">TOLZY <span className="aurora-text font-black tracking-tighter">Hex</span></h2>
                 <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-center">
                   الجيل القادم من منصات بناء المواقع والتطبيقات بالكامل عبر الذكاء الاصطناعي. استعد لتجربة بناء غير مسبوقة مع معاينة حية فورية ونشر سحابي ذكي.
                 </p>
                 
                 <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                       <span>انتظرونا في التحديث القادم</span>
                       <ArrowLeft size={18} className="text-indigo-500" />
                    </div>
                 </div>
              </div>
              
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-indigo-600/5 pointe-events-none" />
           </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-32 px-6 text-center overflow-hidden relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative z-10"
           >
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">ابدأ محادثتك الذكية <br /> <span className="aurora-text">الآن.</span></h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link 
                    href="/login" 
                    className="bg-white text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all hover:scale-105"
                 >
                    ابدأ الاستخدام
                 </Link>
                 <Link 
                    href="https://www.tolzy.me/pricing" 
                    className="hex-glass text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all font-cairo"
                 >
                    خطط الاشتراك <ChevronRight size={16} className="inline ml-1" />
                 </Link>
              </div>
           </motion.div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-white/5 py-12 px-6 md:px-12 relative z-10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Cpu size={14} />
               </div>
               <span className="font-bold text-lg tracking-tight">TOLZY AI</span>
            </div>
            
            <div className="flex gap-8 text-xs font-bold text-zinc-500 uppercase tracking-widest">
               <Link href="https://www.tolzy.me/pricing" className="hover:text-white transition-colors">الأسعار</Link>
               <Link href="/login" className="hover:text-white transition-colors">الدخول</Link>
            </div>
            
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">
               &copy; 2026 TOLZY AI. جميع الحقوق محفوظة لـ TOLZY الفريق المالك.
            </p>
         </div>
      </footer>
    </div>
  );
}
