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
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  const { user, plan } = useAuth();
  const router = useRouter();
  const [heroPrompt, setHeroPrompt] = useState('');

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
    window.location.href = `https://ai.tolzy.me?prompt=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-x-hidden rtl selection:bg-indigo-500/30">
      
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-fuchsia-600/10 rounded-full blur-[100px] mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-100 contrast-150" />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 z-50 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform duration-500">
            <Cpu size={20} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter aurora-text">
            TOLZY AI
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          {!user && (
            <Link 
              href="/login" 
              className="text-sm font-bold text-zinc-400 hover:text-white transition-colors hidden md:block"
            >
              تسجيل الدخول
            </Link>
          )}
          <Link 
            href={user ? '/dashboard' : '/login'} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black bg-white px-6 py-3 rounded-2xl hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {user ? 'لوحة التحكم' : 'ابدأ الآن'} <ArrowLeft size={16} />
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-20 pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
          >
            <Terminal size={14} />
            <span>الذكاء الاصطناعي الأذكى للإجابة والبرمجة</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black text-white mb-8 leading-[1.1] max-w-5xl tracking-tighter"
          >
            اسأل عن أي شيء، <br />
            <span className="aurora-text">أتقن لغة المستقبل.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed"
          >
            TOLZY AI هو نموذج لغوي متقدم مصمم للإجابة على كافة تساؤلاتك بذكاء فائق، مع تخصص استثنائي في عالم البرمجة، حل المشكلات التقنية، وشرح المفاهيم المعقدة ببساطة.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-3xl mb-12 px-2"
          >
            <div className="hex-glass p-1.5 md:p-2.5 rounded-[2rem] shadow-2xl flex items-center gap-2 group focus-within:border-indigo-500/50 transition-all">
              <input
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHeroEnter()}
                placeholder="اكتب أي سؤال أو كود برمجي هنا لتبدأ..."
                className="flex-1 bg-transparent px-5 py-3 text-sm md:text-base outline-none text-white placeholder:text-zinc-500 font-medium"
              />
              <button
                onClick={handleHeroEnter}
                className="bg-white text-black h-12 md:h-14 px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition active:scale-95 shadow-lg"
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
                    className="hex-glass p-8 rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all"
                 >
                    <div className="text-indigo-400 mb-6">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                 </motion.div>
               ))}
            </div>
        </section>

        {/* ── Journey / Programming Section ── */}
        <section className="py-24 bg-white/5 border-y border-white/5">
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
                            <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{step.title}</h4>
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
                 <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-center">
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
                    href="/pricing" 
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
               <Link href="/pricing" className="hover:text-white transition-colors">الأسعار</Link>
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
e z-10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Layers size={14} />
               </div>
               <span className="font-bold text-lg tracking-tight">HEX AI</span>
            </div>
            
            <div className="flex gap-8 text-xs font-bold text-zinc-500 uppercase tracking-widest">
               <Link href="/pricing" className="hover:text-white transition-colors">الأسعار</Link>
               <Link href="/login" className="hover:text-white transition-colors">الدخول</Link>
               <Link href="/terms" className="hover:text-white transition-colors">الشروط</Link>
               <Link href="/privacy" className="hover:text-white transition-colors">الخصوصية</Link>
            </div>
            
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">
               &copy; 2026 HEX AI. جميع الحقوق محفوظة لـ TOLZY الفريق المالك.
            </p>
         </div>
      </footer>
    </div>
  );
}
