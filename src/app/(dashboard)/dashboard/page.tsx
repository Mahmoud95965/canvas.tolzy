'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Sparkles, Send, Layers, History, MoreVertical, Globe, Trash2 } from 'lucide-react';
import { Site } from '@/types';

export default function DashboardPage() {
  const { user, loading, signOut, getIdToken } = useAuth();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Sites state for the history panel
  const [sites, setSites] = useState<Site[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && showHistory) {
      fetchSites();
    }
  }, [user, showHistory]);

  const fetchSites = async () => {
    const token = await getIdToken();
    if (!token) return;
    try {
      const res = await fetch('/api/sites', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateSite = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      // 1. Create physical site in database securely
      const randomId = Math.random().toString(36).substring(2, 7);
      const siteRes = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: 'Generated Site', subdomain: `draft-${randomId}` }),
      });

      if (!siteRes.ok) throw new Error("Failed to create site in database");
      
      const site = await siteRes.json();

      // 2. Redirect straight to the builder with AI prompt in URL
      router.push(`/builder/${site.id}?prompt=${encodeURIComponent(prompt.trim())}`);

    } catch (err: any) {
      showToast(err.message || 'Something went wrong', 'error');
      setIsGenerating(false);
    }
  };

  const deleteSite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this site permanently?')) return;
    try {
      const token = await getIdToken();
      await fetch(`/api/sites/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setSites(prev => prev.filter(s => s.id !== id));
    } catch {}
  };

  if (loading || !user) return (
     <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 relative">
           <div className="absolute inset-0 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
     </div>
  );

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-zinc-300 font-sans flex flex-col overflow-hidden relative">
      
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
         <div className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-violet-600/10 rounded-full blur-[140px] mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
      </div>

      {/* Top Navigation */}
      <header className="h-16 flex items-center justify-between px-6 z-20 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
             <Layers size={16} className="text-white" />
           </div>
           <span className="font-bold text-lg text-white tracking-tight">Tolzy Flow</span>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowHistory(!showHistory)} 
             className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium"
           >
             <History size={14} /> My Sites
           </button>
           <button onClick={signOut} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign Out</button>
           <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-8 h-8 rounded-full border border-white/10" alt="Avatar"/>
        </div>
      </header>

      {/* Main Content (AI Prompt) */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
         
         <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-2xl">
              What do you want to build?
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              Describe your website and our elite AI engineer will instantly generate the entire layout, design, and structure.
            </p>
         </div>

         {/* Giant Prompt Box */}
         <div className={`w-full max-w-3xl bg-zinc-900/80 backdrop-blur-2xl border ${isGenerating ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'border-white/10'} rounded-2xl p-3 flex flex-col shadow-2xl transition-all duration-500`}>
             <textarea 
               className="w-full h-32 bg-transparent text-white placeholder:text-zinc-600 resize-none outline-none p-4 text-lg md:text-xl font-medium"
               placeholder="A modern landing page for a coffee startup with a dark mode theme, featuring massive typography and a sleek menu..."
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               disabled={isGenerating}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleGenerateSite();
                 }
               }}
             />

             <div className="flex items-center justify-between p-2 mt-2 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500 bg-zinc-950/50 rounded-full px-3 py-1">
                   <Sparkles size={12} className="text-violet-400" />
                   GPT-4o & Gemini 1.5 Pro AI
                </div>
                
                <button 
                  onClick={handleGenerateSite}
                  disabled={!prompt.trim() || isGenerating}
                  className="relative group overflow-hidden px-8 py-3 rounded-full bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Designing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                       Generate Site <Send size={16} />
                    </span>
                  )}
                </button>
             </div>
         </div>

         {/* Example Prompts */}
         {!isGenerating && (
           <div className="flex flex-wrap gap-2 justify-center mt-12 max-w-2xl opacity-60">
             {["A minimal portfolio for a photographer", "A SaaS pricing page with 3 tiers", "A vibrant dashboard analytics layout"].map(p => (
               <button 
                 key={p} 
                 onClick={() => setPrompt(p)}
                 className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white transition-colors"
               >
                 {p}
               </button>
             ))}
           </div>
         )}
      </main>

      {/* History Slide-Over Panel */}
      <div className={`fixed top-16 bottom-0 right-0 w-full md:w-96 bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-40 transition-transform duration-500 ease-out flex flex-col ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><History size={18}/> Project History</h2>
            <button onClick={() => setShowHistory(false)} className="text-sm text-zinc-500 hover:text-white">Close</button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {sites.length === 0 ? (
               <div className="text-center text-zinc-500 mt-10 text-sm">No previous sites found.</div>
            ) : (
              sites.map(site => (
                <div 
                  key={site.id} 
                  onClick={() => router.push(`/builder/${site.id}`)}
                  className="p-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800/80 cursor-pointer group transition-colors"
                >
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{site.name}</h3>
                      <button onClick={(e) => deleteSite(site.id, e)} className="p-1 hover:bg-red-500/10 hover:text-red-400 text-zinc-600 rounded">
                         <Trash2 size={14} />
                      </button>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-zinc-500">
                      {site.is_published ? <span className="flex items-center gap-1 text-emerald-400"><Globe size={10}/> Published</span> : <span><div className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block mr-1"/>Draft</span>}
                   </div>
                </div>
              ))
            )}
         </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
           {toast.message}
        </div>
      )}

    </div>
  );
}
