'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowUp, Mic, PanelLeft, Sparkles, Layers, X, Settings, LogOut, Monitor, Moon, Sun, ChevronDown, Check } from 'lucide-react';
import ChatMessage, { ChatMessageData } from '@/components/chat/ChatMessage';
import ChatSidebar, { Conversation } from '@/components/chat/ChatSidebar';
import { useTheme } from '@/lib/theme-context';
import { LOCK_PREMIUM_MODELS_DURING_LAUNCH, PRO_LAUNCH_GUARD } from '@/lib/plan';

const PRICING_URL = '/pricing';
const SPEECH_RECOGNITION_LANG = 'ar-EG';

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export default function AppUI({ initialChatId }: { initialChatId: string | null }) {
  const { user, loading, signOut, getIdToken, plan, refreshPlan } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'flash' | 'pro'>('flash');
  const [isListening, setIsListening] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const isProUser = plan === 'pro';
  const canUseChat = !PRO_LAUNCH_GUARD || isProUser;

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const keepListeningRef = useRef(false);
  const lastFinalChunkRef = useRef('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (user) refreshPlan();
  }, [user, refreshPlan]);

  // Handle direct link to a conversation
  useEffect(() => {
    if (user && initialChatId && initialChatId !== activeId) {
      selectConversation(initialChatId);
    }
  }, [initialChatId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (LOCK_PREMIUM_MODELS_DURING_LAUNCH && selectedModel === 'pro') {
      setSelectedModel('flash');
    }
  }, [selectedModel]);

  useEffect(() => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = SPEECH_RECOGNITION_LANG;
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      lastFinalChunkRef.current = '';
    };
    recognition.onend = () => {
      if (keepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // Ignore restart race errors
        }
      }
      setIsListening(false);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const errorCode = String(event?.error || '');
      if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
        keepListeningRef.current = false;
      }
      setIsListening(false);
    };
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result?.isFinal) continue;
        const chunk = String(result[0]?.transcript || '').trim();
        if (!chunk) continue;
        finalTranscript += `${finalTranscript ? ' ' : ''}${chunk}`;
      }

      const normalizedChunk = finalTranscript.replace(/\s+/g, ' ').trim();
      if (!normalizedChunk) return;
      if (normalizedChunk === lastFinalChunkRef.current) return;
      lastFinalChunkRef.current = normalizedChunk;

      setInput((prev) => {
        const normalizedPrev = prev.replace(/\s+/g, ' ').trim();
        if (normalizedPrev.endsWith(normalizedChunk)) return prev;
        return prev ? `${prev} ${normalizedChunk}` : normalizedChunk;
      });
    };

    recognitionRef.current = recognition;
    setSupportsSpeech(true);

    return () => {
      keepListeningRef.current = false;
      try {
        recognition.stop();
      } catch {
        // no-op
      }
      recognitionRef.current = null;
      setIsListening(false);
    };
  }, []);

  const handleMicClick = useCallback(() => {
    if (!supportsSpeech || !recognitionRef.current) {
      alert('ميزة التسجيل الصوتي غير مدعومة في هذا المتصفح حالياً.');
      return;
    }

    if (!canUseChat) {
      router.push(PRICING_URL);
      return;
    }

    if (isListening) {
      keepListeningRef.current = false;
      recognitionRef.current.stop();
      return;
    }

    keepListeningRef.current = true;
    lastFinalChunkRef.current = '';
    recognitionRef.current.start();
  }, [supportsSpeech, canUseChat, router, isListening]);

  const authHeaders = useCallback(async () => {
    const token = await getIdToken();
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }, [getIdToken]);

  const fetchConversations = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch('/api/conversations', { headers });
    if (res.ok) {
      const data = await res.json();
      setConversations(data.map((c: any) => ({
        id: c.id,
        title: c.title,
        messages: [],
        createdAt: new Date(c.created_at).getTime(),
        updatedAt: new Date(c.updated_at).getTime(),
      })));
    }
  }, [authHeaders]);

  const createConversation = useCallback(async (title: string): Promise<string | null> => {
    const headers = await authHeaders();
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id;
  }, [authHeaders]);

  const saveMessage = useCallback(async (convId: string, role: 'user' | 'assistant', content: string) => {
    const headers = await authHeaders();
    await fetch(`/api/conversations/${convId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ role, content }),
    });
  }, [authHeaders]);

  const selectConversation = useCallback(async (id: string) => {
    if (activeId === id) return;
    const headers = await authHeaders();
    const res = await fetch(`/api/conversations/${id}`, { headers });
    if (res.ok) {
      const data = await res.json();
      const mapped: ChatMessageData[] = data.map((m: any) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      setMessages(mapped);
      setActiveId(id);
      setSidebarOpen(false);
      
      // Update URL without reload
      window.history.pushState(null, '', `/app/c/${id}`);
    }
  }, [authHeaders, activeId]);

  const newConversation = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setInput('');
    setSidebarOpen(false);
    textareaRef.current?.focus();
    // Reset URL
    window.history.pushState(null, '', '/app');
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    const headers = await authHeaders();
    await fetch(`/api/conversations/${id}`, { method: 'DELETE', headers });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) { 
      newConversation();
    }
  }, [authHeaders, activeId, newConversation]);

  const handleSend = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isStreaming) return;
    if (PRO_LAUNCH_GUARD && plan !== 'pro') {
      router.push(PRICING_URL);
      return;
    }

    setInput('');

    let convId = activeId;
    if (!convId) {
      const title = content.slice(0, 60);
      convId = await createConversation(title);
      if (!convId) return;
      setActiveId(convId);
      window.history.pushState(null, '', `/app/c/${convId}`);
      
      setConversations(prev => [{
        id: convId!,
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }, ...prev]);
    }

    const userMsgId = crypto.randomUUID();
    const aiMsgId = crypto.randomUUID();

    const userMsg: ChatMessageData = { id: userMsgId, role: 'user', content };
    const aiMsg: ChatMessageData = { id: aiMsgId, role: 'assistant', content: '', isStreaming: true };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setIsStreaming(true);

    await saveMessage(convId, 'user', content);

    const historyForAPI = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const token = await getIdToken();
      abortRef.current = new AbortController();

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: historyForAPI, modelType: selectedModel }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error === 'PRO_SUBSCRIPTION_REQUIRED') {
          throw new Error('هذه النسخة متاحة حالياً لمشتركي Pro فقط.');
        }
        if (errorData.error === 'PREMIUM_MODELS_TEMPORARILY_LOCKED') {
          throw new Error('وضعا المُفكِّر و Pro متوقفان مؤقتاً حتى الإطلاق.');
        }
        if (errorData.error === 'PRO_REQUIRED') {
          throw new Error('هذه الميزة متاحة لمشتركي Pro فقط. يمكنك الترقية من صفحة الأسعار.');
        }
        if (errorData.error === 'UPSTREAM_RATE_LIMIT') {
          throw new Error(
            typeof errorData.message === 'string' && errorData.message.trim()
              ? errorData.message
              : 'حاول مرة أخرى بسبب الضغط على السيرفر.'
          );
        }
        throw new Error(errorData.error || 'فشل الاتصال بالذكاء الاصطناعي');
      }

      if (!res.body) throw new Error('Empty response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let renderedContent = '';
      let pendingContent = '';
      let streamDone = false;

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      const renderProgressively = async () => {
        while (!streamDone || pendingContent.length > 0) {
          if (!pendingContent.length) {
            await sleep(12);
            continue;
          }

          const take = Math.min(2, pendingContent.length);
          renderedContent += pendingContent.slice(0, take);
          pendingContent = pendingContent.slice(take);

          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: renderedContent } : m))
          );

          await sleep(12);
        }
      };

      const renderPromise = renderProgressively();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        fullContent += chunk;
        pendingContent += chunk;
      }
      const finalChunk = decoder.decode();
      if (finalChunk) {
        fullContent += finalChunk;
        pendingContent += finalChunk;
      }
      streamDone = true;
      await renderPromise;

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullContent, isStreaming: false } : m));
      await saveMessage(convId, 'assistant', fullContent);

      setConversations(prev => prev.map(c => c.id === convId ? { ...c, updatedAt: Date.now() } : c));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMsg = `❌ حدث خطأ: ${err.message}`;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: errorMsg, isStreaming: false } : m));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, activeId, getIdToken, createConversation, saveMessage, selectedModel, plan, router]);

  if (loading || !user) {
    return (
      <div className="h-screen w-full bg-white dark:bg-[#09090b] flex items-center justify-center transition-colors">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  const isEmpty = messages.length === 0;
  const planBadgeLabel = plan === 'pro' ? 'PRO' : '';
  const planTextLabel = plan === 'pro' ? 'PRO' : 'FREE';
  const avatarRingClass =
    plan === 'pro'
      ? 'ring-2 ring-amber-300/90 dark:ring-amber-400/80 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]'
      : 'ring-2 ring-indigo-300/90 dark:ring-indigo-400/80 shadow-[0_0_0_3px_rgba(99,102,241,0.14)]';
  const badgeClass =
    plan === 'pro'
      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
      : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white';
  const planPillClass =
    plan === 'pro'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300';

  return (
    <div className="h-screen w-full bg-white dark:bg-[#09090b] flex overflow-hidden transition-colors duration-300 font-sans text-zinc-900 dark:text-zinc-100">

      {/* Sidebar Desktop */}
      <div className={`hidden md:flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} overflow-hidden shrink-0 bg-zinc-50/50 dark:bg-[#0f1011] border-l border-zinc-200/50 dark:border-white/5`}>
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={newConversation}
          onDelete={deleteConversation}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onSignOut={signOut}
          isExpanded={sidebarOpen}
          onToggle={() => setSidebarOpen(v => !v)}
        />
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex flex-row-reverse md:hidden">
          <div className="w-72 bg-white dark:bg-[#0f1011]">
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={selectConversation}
              onNew={newConversation}
              onDelete={deleteConversation}
              onClose={() => setSidebarOpen(false)}
              user={user}
              onSignOut={signOut}
              isExpanded={true}
              onToggle={() => setSidebarOpen(false)}
            />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Top Header - Floating and Minimal */}
        <header className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-4 sm:px-6 z-20 transition-colors pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button onClick={() => setSidebarOpen(v => !v)} className="p-2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all">
              <PanelLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-white dark:to-zinc-200 flex items-center justify-center shadow-sm">
                <Layers size={16} className="text-white dark:text-zinc-900" />
              </div>
              <span className="font-extrabold text-base tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-400">
                Tolzy
              </span>
            </div>
          </div>

          {/* Profile & Dropdown */}
          <div className="relative pointer-events-auto">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="relative flex items-center gap-2 p-1 pr-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors border border-transparent"
            >
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                className={`w-8 h-8 rounded-full border border-zinc-200 dark:border-white/10 shrink-0 object-cover bg-white dark:bg-zinc-800 ${avatarRingClass}`}
                alt="Avatar"
              />
              {plan === 'pro' && (
                <span className={`absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm ${badgeClass}`}>
                  {planBadgeLabel}
                </span>
              )}
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#1a1a1c] border border-zinc-200/60 dark:border-white/10 rounded-[20px] shadow-xl z-50 overflow-hidden outline-none animate-in fade-in slide-in-from-top-2" dir="rtl">
                  <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                    <p className="text-[14px] font-bold text-zinc-900 dark:text-white truncate">{user.displayName || 'مستخدم تولزي'}</p>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5" dir="ltr">{user.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold ${planPillClass}`}>
                        الخطة الحالية: {planTextLabel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <button onClick={() => setTheme('light')} className={`w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-xl transition-colors ${theme === 'light' ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}>
                      <Sun size={16} /> وضع النهار
                    </button>
                    <button onClick={() => setTheme('dark')} className={`w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-xl transition-colors ${theme === 'dark' ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}>
                      <Moon size={16} /> الوضع الليلي
                    </button>
                    <button onClick={() => setTheme('system')} className={`w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-xl transition-colors ${theme === 'system' ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}>
                      <Monitor size={16} /> تلقائي
                    </button>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-white/5 p-1.5 flex flex-col gap-0.5">
                    {plan === 'free' ? (
                      <button
                        onClick={() => router.push(PRICING_URL)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                      >
                        <Sparkles size={16} /> ترقية إلى Pro
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(PRICING_URL)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <Sparkles size={16} /> الخطط والأسعار
                      </button>
                    )}
                    <button onClick={() => router.push('/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-colors">
                      <Settings size={16} /> إعدادات الحساب
                    </button>
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                      <LogOut size={16} /> تسجيل الخروج
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto scrollbar-hide relative pt-16 flex flex-col" dir="rtl">
          {!canUseChat && (
            <div className="mx-auto mt-4 w-full max-w-3xl px-4 sm:px-6">
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/25 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                تم إيقاف الميزات مؤقتًا قبل الإطلاق. استخدام المنصة متاح حاليًا لمشتركي Pro فقط.
              </div>
            </div>
          )}
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 pb-20 animate-in fade-in duration-700">
              <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-white/[0.03] flex items-center justify-center mb-6 border border-zinc-100 dark:border-white/5 shadow-sm">
                <Sparkles size={28} className="text-zinc-700 dark:text-zinc-300" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight text-center">
                كيف يمكنني أن أساعدك؟
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed mb-10 max-w-md text-center">
                اكتب سؤالاً، كود برمجي، أو متطلبات مشروعك، وسأقوم بمساعدتك فوراً.
              </p>
              <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl">
                {[
                  { icon: '💡', text: 'كيفية بناء تطبيق من الصفر؟' },
                  { icon: '💻', text: 'اكتب سكريبت لتحليل البيانات' },
                  { icon: '🎨', text: 'صمم واجهة مستخدم حديثة' },
                  { icon: '📊', text: 'اشرح لي قواعد البيانات بطريقة بسيطة' },
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(chip.text)}
                    disabled={!canUseChat}
                    className="flex items-center gap-3 px-5 py-3 rounded-[20px] bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-white/5 shadow-sm hover:shadow-md dark:shadow-none hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-all hover:-translate-y-0.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <span className="text-xl shrink-0">{chip.icon}</span>
                    <span className="text-right">{chip.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 w-full flex-1">
              {messages.map(msg => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                />
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 px-4 md:px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white/95 dark:from-[#09090b] dark:via-[#09090b]/95 to-transparent z-20">
          <div className="max-w-3xl mx-auto w-full relative">

            <div className={`relative bg-white dark:bg-[#121214] border rounded-[24px] transition-all duration-300 ${
              isStreaming 
                ? 'border-zinc-200 dark:border-white/10 shadow-sm' 
                : 'border-zinc-200/60 dark:border-white/5 focus-within:border-zinc-300 dark:focus-within:border-white/15 focus-within:shadow-md focus-within:bg-white dark:focus-within:bg-[#161618] shadow-sm'
            }`} dir="rtl">
              <textarea
                dir="auto"
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={isStreaming || !canUseChat}
                placeholder={
                  !canUseChat
                    ? 'المنصة حالياً متاحة لمشتركي Pro فقط.'
                    : isStreaming
                      ? 'جاري التفكير...'
                      : 'اكتب رسالتك أو استفسارك هنا...'
                }
                className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none resize-none text-[15px] font-medium leading-relaxed px-5 pt-4 pb-2 min-h-[56px] max-h-48 scrollbar-hide"
              />

              <div className="flex items-center justify-between px-3 pb-3">
                {/* Right side icons / models */}
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <button onClick={() => setModelOpen(!modelOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 transition-colors">
                      <span className="text-[13px] font-semibold">
                        {selectedModel === 'flash' && 'Tolzy Flash'}
                        {selectedModel === 'pro' && 'Tolzy Pro'}
                      </span>
                      <ChevronDown size={14} className="opacity-70" />
                    </button>
                    {modelOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setModelOpen(false)} />
                        <div className="absolute bottom-[110%] right-0 mb-2 w-[240px] bg-white dark:bg-[#1a1a1c] border border-zinc-200/60 dark:border-white/10 rounded-[20px] shadow-xl z-40 flex flex-col p-1.5 animate-in fade-in slide-in-from-bottom-2" dir="rtl">
                          
                          <div className="px-3 pb-2 pt-1.5 text-zinc-400 dark:text-zinc-500 font-semibold text-[11px] tracking-wider uppercase text-right">
                            اختر النموذج
                          </div>

                          <button onClick={() => { setSelectedModel('flash'); setModelOpen(false); }} className={`flex items-start justify-between p-2.5 rounded-[14px] transition-colors ${selectedModel === 'flash' ? 'bg-zinc-50 dark:bg-white/[0.06] text-zinc-900 dark:text-white' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.04] text-zinc-600 dark:text-zinc-300'}`}>
                             <div className="flex flex-col text-right w-full">
                                <span className="font-semibold text-[13px]">Tolzy Flash</span>
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">موديلات كلاسيكية سريعة للمهام اليومية.</span>
                             </div>
                             {selectedModel === 'flash' && (
                               <Check size={16} className="text-zinc-900 dark:text-white mt-0.5" />
                             )}
                          </button>

                          <button
                            onClick={() => {
                              if (LOCK_PREMIUM_MODELS_DURING_LAUNCH) {
                                setModelOpen(false);
                              } else if (plan === 'pro') {
                                setSelectedModel('pro');
                                setModelOpen(false);
                              } else {
                                router.push(PRICING_URL);
                              }
                            }}
                            className={`flex items-start justify-between p-2.5 rounded-[14px] text-right transition-colors ${
                              LOCK_PREMIUM_MODELS_DURING_LAUNCH
                                ? 'opacity-60 cursor-not-allowed'
                                : plan === 'pro'
                                  ? 'hover:bg-zinc-50 dark:hover:bg-white/[0.04] text-zinc-600 dark:text-zinc-300'
                                  : 'opacity-80 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                            }`}
                          >
                             <div className="flex flex-col text-right w-full">
                                <span className="font-semibold text-[13px] text-zinc-900 dark:text-white flex items-center gap-1.5">
                                  Tolzy Pro{' '}
                                  <span className="text-[9px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-sm font-bold">
                                    PRO
                                  </span>
                                </span>
                                <span className="text-[11px] text-zinc-500 mt-0.5">أعلى أداء ذكي لحل المسائل المعقدة والبرمجة.</span>
                             </div>
                             {selectedModel === 'pro' && <Check size={16} className="text-zinc-900 dark:text-white mt-0.5" />}
                          </button>

                          <div className="h-px bg-zinc-100 dark:bg-white/5 my-1 mx-2" />
                          
                          {plan === 'free' && (
                            <button onClick={() => router.push(PRICING_URL)} className="flex items-start justify-between p-2.5 rounded-[14px] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors text-right cursor-pointer group">
                             <div className="flex flex-col text-right w-full">
                                <span className="font-semibold text-[13px] text-zinc-900 dark:text-indigo-100">Tolzy AI Pro</span>
                                <span className="text-[11px] text-zinc-500 dark:text-indigo-200/60 mt-0.5">احصل على وصول غير محدود.</span>
                             </div>
                             <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 whitespace-nowrap bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/30 transition-colors">ترقية</span>
                            </button>
                          )}

                        </div>
                      </>
                    )}
                  </div>

                </div>

                {/* Left side actions */}
                <div className="flex items-center gap-2">
                  {!input.trim() && (
                     <button
                       onClick={handleMicClick}
                       disabled={!supportsSpeech || !canUseChat}
                       className={`p-2.5 rounded-xl transition-colors ${
                         isListening
                           ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
                           : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5'
                       } disabled:opacity-40 disabled:cursor-not-allowed`}
                       title={
                         !supportsSpeech
                           ? 'التسجيل الصوتي غير مدعوم في متصفحك'
                           : isListening
                             ? 'إيقاف التسجيل'
                             : 'ابدأ التسجيل الصوتي'
                       }
                     >
                       <Mic size={18} />
                     </button>
                  )}
                  {input.trim() ? (
                    <button
                      onClick={() => handleSend()}
                      disabled={isStreaming || !canUseChat}
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                    >
                      {isStreaming ? (
                        <div className="w-4 h-4 border-[2.5px] border-white/50 dark:border-zinc-500 border-t-transparent dark:border-t-zinc-900 rounded-full animate-spin" />
                      ) : (
                        <ArrowUp size={18} className="stroke-[2.5]" />
                      )}
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 shrink-0 border border-transparent">
                      <ArrowUp size={18} className="stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-[12px] text-zinc-400 dark:text-zinc-500 mt-4 font-medium transition-colors">
              تولزي هو أداة ذكية، يرجى مراجعة إجاباته والتأكد من صحتها.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
