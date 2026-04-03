'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Site } from '@/types';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import {
  Sparkles,
  ChevronLeft,
  Loader2,
  User,
  Download,
  Plus,
  Mic,
  BookOpen,
  ArrowUp,
  PanelLeft,
  MonitorPlay,
  Code2,
  Share,
  Lock,
  RefreshCw,
  ArrowUpRight,
  History,
  Home
} from 'lucide-react';

interface SandpackEditorProps {
  site: Site;
}

type ChatMessage = { id: string; role: 'user' | 'ai'; content: string };
type RightView = 'preview' | 'code';

const DEFAULT_FILES: Record<string, string> = {
  '/public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tolzy Flow</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  '/index.js': `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

// Inject Tailwind CDN programmatically to ensure it loads
if (!document.getElementById("tailwind-cdn")) {
  const script = document.createElement("script");
  script.id = "tailwind-cdn";
  script.src = "https://cdn.tailwindcss.com";
  document.head.appendChild(script);
}

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
  '/App.js': `import React from 'react';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center max-w-xl">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={28} className="text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
          Welcome to Tolzy Flow
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Use the AI chat on the left to describe what you want to build. Your React app will appear here in real-time.
        </p>
      </div>
    </div>
  );
}`,
  '/styles.css':
    '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  padding: 0;\n  font-family: system-ui, -apple-system, sans-serif;\n}',
  '/package.json':
    '{\n  "main": "/index.js",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0",\n    "lucide-react": "latest",\n    "framer-motion": "latest"\n  }\n}',
};

export default function SandpackEditor({ site }: SandpackEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getIdToken } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [rightView, setRightView] = useState<RightView>('preview');
  const [isPublishing, setIsPublishing] = useState(false);

  const [files, setFiles] = useState<Record<string, string>>(() => {
    if (site.react_files && typeof site.react_files === 'object' && Object.keys(site.react_files).length > 0) {
      return site.react_files;
    }
    return DEFAULT_FILES;
  });
  const [sandpackKey, setSandpackKey] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Save Logic
  const handleSave = useCallback(async (filesToSave?: Record<string, string>) => {
    setSaveStatus('saving');
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Auth');
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ react_files: filesToSave || files }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [getIdToken, site.id, files]);

  // Publish Logic
  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: true })
      });
      if (res.ok) {
        alert('Site published successfully!');
      } else {
        alert('Failed to publish site.');
      }
    } catch (e) {
      alert('Error publishing site.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Share Logic
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  // 🛠️ HEALING PARSER: More resilient extraction for elite-tier code
  function parseAIResponse(raw: string): Record<string, string> | null {
    try {
      // 1. Try standard parse first
      const standardResult = tryStandardParse(raw);
      if (standardResult) return standardResult;

      // 2. If failed, try to fix common truncation by adding closing braces
      const fixedRaw = raw.trim() + '\n"}}}'; // Bruteforce closure
      const fixedResult = tryStandardParse(fixedRaw);
      if (fixedResult) return fixedResult;

      // 3. Last resort: Regex extraction for file pairs
      return regexExtractFiles(raw);
    } catch { return null; }
  }

  function tryStandardParse(text: string): Record<string, string> | null {
    try {
      let cleaned = text.trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) return null;
      cleaned = cleaned.substring(start, end + 1);
      
      const parsed = JSON.parse(cleaned);
      const files = parsed.files || parsed;
      if (files && typeof files === 'object') {
        const result: Record<string, string> = {};
        for (const [path, content] of Object.entries(files)) {
          if (typeof content === 'string') result[path] = content;
          else if (content && typeof content === 'object' && (content as any).content) {
            result[path] = (content as any).content;
          }
        }
        return Object.keys(result).length > 0 ? result : null;
      }
    } catch { return null; }
    return null;
  }

  function regexExtractFiles(text: string): Record<string, string> | null {
    const result: Record<string, string> = {};
    // This regex looks for "/path": "content" pattern
    // It handles the most common flat structure
    const regex = /"(\/[^"]+)":\s*"([^]*?)(?=",\s*"\/?|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      let content = match[2];
      // Basic unescape for newlines if they are literal \n
      content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
      result[match[1]] = content;
    }
    return Object.keys(result).length > 0 ? result : null;
  }

  // Stream AI
  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);

    setMessages(prev => [...prev, { id: `u-${crypto.randomUUID()}`, role: 'user', content: prompt }]);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok || !res.body) throw new Error('AI connection failed. Check your network.');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      const streamMsgId = `ai-${crypto.randomUUID()}`;

      setMessages(prev => [...prev, { id: streamMsgId, role: 'ai', content: '🧠 Planning your application components...' }]);
      
      // 🚀 HACKER VIBES: Switch to code view immediately
      setRightView('code');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        
        // 🔄 Real-time Update: Inject current stream into a virtual file 
        setFiles(prev => ({
          ...prev,
          '/Generating...': fullText
        }));
      }

      const parsedFiles = parseAIResponse(fullText);
      
      if (parsedFiles) {
        // Prepare the final file set
        const finalFiles = { ...parsedFiles };
        
        // Ensure standard wrappers exist
        if (!finalFiles['/styles.css']) finalFiles['/styles.css'] = DEFAULT_FILES['/styles.css'];
        finalFiles['/public/index.html'] = DEFAULT_FILES['/public/index.html'];
        finalFiles['/index.js'] = DEFAULT_FILES['/index.js'];
        
        // Ensure package.json is correct and includes elite dependencies
        let pkg: any = { dependencies: {} };
        if (finalFiles['/package.json']) {
          try { pkg = JSON.parse(finalFiles['/package.json']); } catch {}
        }
        pkg.main = "/index.js";
        pkg.dependencies = { 
          ...pkg.dependencies, 
          "react": "^18.0.0", 
          "react-dom": "^18.0.0", 
          "lucide-react": "latest",
          "framer-motion": "latest"
        };
        finalFiles['/package.json'] = JSON.stringify(pkg, null, 2);

        // Remove the temporary file
        delete (finalFiles as any)['/Generating...'];

        setFiles(finalFiles);
        setSandpackKey(k => k + 1);
        setRightView('preview');
        setMessages(prev => prev.map(m => m.id === streamMsgId 
          ? { ...m, content: '✅ Application built successfully! Ready for your elite presentation. 🎊' } 
          : m
        ));
        handleSave(finalFiles);
      } else {
        // Failure or Truncation: Stay in code view so the user can see/fix the raw output
        setRightView('code');
        setMessages(prev => prev.map(m => m.id === streamMsgId 
          ? { ...m, content: '⚠️ Generation truncated or invalid JSON. You can find the raw output in the "/Generating..." file.' } 
          : m
        ));
      }
    } catch (e: any) {
      console.error('Generation Error:', e);
      setMessages(prev => [...prev, { id: `err-${crypto.randomUUID()}`, role: 'ai', content: `❌ Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const p = searchParams.get('prompt');
    if (p) { window.history.replaceState(null, '', `/builder/${site.id}`); handleGenerate(p); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (inputValue.trim()) { const v = inputValue; setInputValue(''); handleGenerate(v); }
  };

  return (
    <div className="h-screen w-full flex bg-white text-gray-900 font-sans overflow-hidden">

      {/* ═══════════════ LEFT PANEL: CHAT ═══════════════ */}
      <div className="w-[360px] shrink-0 flex flex-col border-r border-gray-200 bg-white relative z-10">
        
        {/* Header */}
        <div className="h-[60px] shrink-0 flex flex-col justify-center px-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/dashboard')} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors mr-1" title="Back to Dashboard">
                <Home size={16} />
              </button>
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">{site.name || 'Tolzy Project'}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <History size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[11px] text-gray-500">Previewing last saved version</span>
            {saveStatus === 'saving' && <Loader2 size={10} className="animate-spin text-gray-400" />}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6 scrollbar-hide">
          {messages.length === 0 && (
             <div className="text-sm text-gray-600 leading-relaxed">
               Welcome! I am ready to help you build your project. Describe what you want to create below.
             </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'user' ? (
                <div className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-2xl rounded-tr-sm text-[13px] max-w-[90%]">
                  {msg.content}
                </div>
              ) : (
                <div className="text-[13px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-[#f9fafb] border border-gray-200 rounded-[24px] p-2 flex flex-col shadow-sm focus-within:ring-1 focus-within:ring-gray-300 transition-all">
            <textarea
              rows={2}
              placeholder="Ask Tolzy..."
              className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 outline-none text-[13px] px-2 py-1 resize-none"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                  <Plus size={12} /> Visual edits
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-gray-600 transition-colors"><BookOpen size={16} /></button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors"><Mic size={16} /></button>
                <button 
                  onClick={handleSubmit} 
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gray-900 text-white p-1.5 rounded-full hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900 transition-colors"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ RIGHT PANEL: WORKSPACE ═══════════════ */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Top Navbar */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-md transition-colors">
              <PanelLeft size={18} />
            </button>
          </div>

          {/* Center Toggle (Preview / Code) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200/50">
            <button 
              onClick={() => setRightView('preview')}
              className={`flex items-center gap-2 px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                rightView === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MonitorPlay size={14} /> Preview
            </button>
            <button 
              onClick={() => setRightView('code')}
              className={`flex items-center gap-2 px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                rightView === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code2 size={14} /> Code
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              <Share size={14} /> Share
            </button>
            
            {/* SVG Github Icon */}
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </button>
            
            <button className="text-[13px] font-medium text-purple-700 bg-purple-100 px-3 py-1.5 rounded-md hover:bg-purple-200 transition-colors">
              Upgrade
            </button>
            <button onClick={handlePublish} disabled={isPublishing} className="disabled:opacity-75 flex items-center gap-1.5 text-[13px] font-medium text-white bg-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
              {isPublishing ? <Loader2 size={14} className="animate-spin" /> : null}
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Sandpack Area - Using relative and absolute to force full height */}
        <div className="flex-1 relative bg-[#f9fafb] min-h-0 overflow-hidden">
          <SandpackProvider
            key={sandpackKey}
            template="react"
            files={files}
            theme="light"
            options={{
              activeFile: isLoading ? '/Generating...' : '/App.js',
            }}
          >
            {/* 👁️ PREVIEW VIEW (With Mock Browser Frame) */}
            {rightView === 'preview' && (
              <div className="absolute inset-0 p-4 flex flex-col">
                <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  
                  {/* Mock Browser Header */}
                  <div className="h-12 flex items-center px-4 border-b border-gray-100 bg-[#fcfcfc] shrink-0">
                    <div className="flex gap-1.5 w-20">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 w-1/2 max-w-sm justify-center shadow-sm">
                        <Lock size={12} className="text-gray-400" />
                        <span className="text-[11px] text-gray-500 font-medium">/</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-gray-400 w-20 justify-end">
                      <ArrowUpRight size={14} className="hover:text-gray-600 cursor-pointer" />
                      <RefreshCw size={14} className="hover:text-gray-600 cursor-pointer" />
                    </div>
                  </div>
                  
                  {/* Actual Preview */}
                  <div className="flex-1 relative bg-white">
                    <SandpackPreview
                      style={{ height: '100%', minHeight: '100%', width: '100%' }}
                      showNavigator={false}
                      showOpenInCodeSandbox={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 💻 CODE VIEW */}
            {rightView === 'code' && (
              <div className="absolute inset-0 flex bg-white">
                <SandpackFileExplorer
                  style={{
                    height: '100%',
                    width: '260px',
                    minWidth: '200px',
                    borderRight: '1px solid #e5e7eb',
                    background: '#fff'
                  }}
                />
                <div className="flex-1 relative">
                   <SandpackCodeEditor
                     style={{ height: '100%', minHeight: '100%', width: '100%' }}
                     showTabs
                     showLineNumbers
                     showInlineErrors
                     closableTabs
                   />
                   {/* Top Right Buttons inside Code View */}
                   <div className="absolute top-2 right-4 flex gap-2 z-10">
                     <button className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm hover:bg-gray-50">
                        <Download size={12}/> Download
                     </button>
                   </div>
                </div>
              </div>
            )}
          </SandpackProvider>
        </div>

      </div>
    </div>
  );
}