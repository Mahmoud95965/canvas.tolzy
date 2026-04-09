'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Eye } from 'lucide-react';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
  imageUrl?: string;
}

interface Props {
  message: ChatMessageData;
  isSharedView?: boolean;
  feedback?: 'like' | 'dislike' | null;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
  onShare?: () => void;
}

// ─── Markdown Parser ───────────────────────────────────────────────
function parseMarkdown(text: string): React.ReactNode[] {
  const blocks = text.split(/\n/);
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const line = blocks[i];

    // Code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < blocks.length && !blocks[i].trim().startsWith('```')) {
        codeLines.push(blocks[i]);
        i++;
      }
      const code = codeLines.join('\n');

      if (lang === 'html') {
        result.push(<HtmlPreview key={`html-${i}`} code={code} />);
      } else {
        result.push(
          <pre key={`code-${i}`} className="my-3 p-4 bg-zinc-100 dark:bg-[#0d0d0d] rounded-xl overflow-x-auto text-[13px] font-mono leading-relaxed text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 scrollbar-hide">
            <code dir="ltr" className="block text-left">{code}</code>
          </pre>
        );
      }
      i++;
      continue;
    }

    // H1
    if (/^# /.test(line)) {
      result.push(<h1 key={i} className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-5 mb-2 tracking-tight">{inlineMarkdown(line.slice(2))}</h1>);
      i++; continue;
    }

    // H2
    if (/^## /.test(line)) {
      result.push(<h2 key={i} className="text-xl font-bold text-zinc-900 dark:text-white mt-4 mb-2 tracking-tight">{inlineMarkdown(line.slice(3))}</h2>);
      i++; continue;
    }

    // H3
    if (/^### /.test(line)) {
      result.push(<h3 key={i} className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mt-3 mb-1.5">{inlineMarkdown(line.slice(4))}</h3>);
      i++; continue;
    }

    // Unordered list
    if (/^[-*] /.test(line.trimStart())) {
      const items: string[] = [];
      while (i < blocks.length && /^[-*] /.test(blocks[i].trimStart())) {
        items.push(blocks[i].replace(/^[-*] /, ''));
        i++;
      }
      result.push(
        <ul key={`ul-${i}`} className="list-none pl-0 my-2 flex flex-col gap-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-zinc-700 dark:text-zinc-200 text-[14.5px] leading-relaxed font-medium">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
              <span>{inlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line.trimStart())) {
      const items: string[] = [];
      while (i < blocks.length && /^\d+\. /.test(blocks[i].trimStart())) {
        items.push(blocks[i].replace(/^\d+\. /, ''));
        i++;
      }
      result.push(
        <ol key={`ol-${i}`} className="pl-0 my-2 flex flex-col gap-1.5 counter-reset-item">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2.5 text-zinc-700 dark:text-zinc-200 text-[14.5px] leading-relaxed font-medium">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs flex items-center justify-center shrink-0 font-bold">
                {idx + 1}
              </span>
              <span>{inlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      result.push(<hr key={i} className="border-white/10 my-3" />);
      i++; continue;
    }

    // Table
    if (line.includes('|') && i + 1 < blocks.length && /^\|?[-| :]+\|?$/.test(blocks[i + 1])) {
      const headers = line.split('|').map(h => h.trim()).filter(Boolean);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < blocks.length && blocks[i].includes('|')) {
        rows.push(blocks[i].split('|').map(c => c.trim()).filter(Boolean));
        i++;
      }
      result.push(
        <div key={`table-${i}`} className="overflow-x-auto my-3 border border-zinc-200 dark:border-white/10 rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 text-left text-zinc-800 dark:text-zinc-300 font-bold bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-zinc-700 dark:text-zinc-400">{inlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      result.push(
        <blockquote key={i} className="border-l-2 border-indigo-500 pl-4 my-2 text-zinc-400 italic text-sm">
          {inlineMarkdown(line.slice(2))}
        </blockquote>
      );
      i++; continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++; continue;
    }

    // Paragraph
    result.push(
      <p key={i} className="text-zinc-700 dark:text-zinc-200 text-[14.5px] leading-[1.8] font-medium my-1.5">
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return result;
}

function extractThinking(text: string): { thinking: string | null, text: string } {
  let thinking = null;
  let remainingText = text;

  const thinkStart = text.indexOf('<think>');
  if (thinkStart !== -1) {
    const thinkEnd = text.indexOf('</think>');
    if (thinkEnd !== -1) {
      thinking = text.slice(thinkStart + 7, thinkEnd).trim();
      remainingText = text.slice(0, thinkStart) + text.slice(thinkEnd + 8);
    } else {
      thinking = text.slice(thinkStart + 7).trim();
      remainingText = text.slice(0, thinkStart);
    }
  }

  return { thinking, text: remainingText };
}

function inlineMarkdown(text: string): React.ReactNode {
  // Split by markdown links, code blocks, bold, italic, and raw URLs
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (!part) return null;

    // Markdown Link [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const braceEnd = part.indexOf(']');
      const pText = part.slice(1, braceEnd);
      const pUrl = part.slice(braceEnd + 2, -1);
      return <a key={i} href={pUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-500 transition-colors">{pText}</a>;
    }

    // Bold
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-zinc-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
    // Italic
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="text-zinc-800 dark:text-zinc-300 italic">{part.slice(1, -1)}</em>;
    // Inline Code
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[12px] font-mono border border-zinc-200 dark:border-transparent" dir="ltr">{part.slice(1, -1)}</code>;
    
    // Raw URL
    if ((part.startsWith('http://') || part.startsWith('https://')) && !part.endsWith(')')) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-500 transition-colors" dir="ltr">{part}</a>;
    }

    return part;
  });
}

// ─── HTML Live Preview ──────────────────────────────────────────────
function HtmlPreview({ code }: { code: string }) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const srcDoc = code;

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-indigo-500/30 bg-[#0d0d0d] shadow-[0_0_30px_rgba(99,102,241,0.1)]">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-500/10 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          </div>
          <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
            <Eye size={11} /> Live Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors border border-white/10 px-2 py-1 rounded shadow-sm bg-white/5"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            {copied ? 'تم النسخ' : 'نسخ الكود خلفياً'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-xl" style={{ height: '450px' }}>
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0 rounded-b-xl"
          title="Live Preview"
        />
      </div>
    </div>
  );
}

// ─── Main ChatMessage ─────────────────────────────────────────────
import { ThumbsUp, ThumbsDown, Share, RotateCw, MoreHorizontal, Download } from 'lucide-react';

export default function ChatMessage({ message, isSharedView = false, feedback = null, onFeedback, onShare }: Props) {
  const isUser = message.role === 'user';
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  }, [message.content]);

  const handleDownloadImage = useCallback(() => {
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = `tolzy-imagen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [message.imageUrl]);

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] flex flex-col gap-2 items-end">
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="max-h-48 max-w-xs rounded-2xl rounded-tl-sm object-cover border border-white/10"
            />
          )}
          {message.content && (
            <div dir="auto" className="bg-indigo-600 text-white dark:bg-zinc-800 dark:text-white px-4 py-3 rounded-2xl rounded-tl-sm text-[15px] font-medium leading-relaxed shadow-sm whitespace-pre-wrap text-right">
              {message.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { thinking, text: cleanText } = extractThinking(message.content);

  return (
    <div className="flex justify-start mb-6 w-full">
      <div className="flex gap-4 max-w-full w-full">
        {/* AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-1">
          
          {thinking && (
            <details className="mb-4 bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden group">
              <summary className="flex items-center gap-2.5 px-4 py-3 text-[14px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none outline-none hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                <span className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full -rotate-90 group-open:rotate-0 transition-transform duration-300">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
                <span className="flex items-center gap-2">
                  طريقة التفكير والتحليل
                  {message.isStreaming && cleanText === '' && (
                    <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin inline-block" />
                  )}
                </span>
              </summary>
              <div className="px-5 pb-5 pt-2 text-[13.5px] text-zinc-600 dark:text-zinc-400 leading-[1.8] font-medium border-t border-zinc-200 dark:border-white/5 whitespace-pre-wrap" dir="auto">
                {thinking}
              </div>
            </details>
          )}

          {message.imageUrl && (
            <div className="mb-3">
              <img
                src={message.imageUrl}
                alt="Generated by Tolzy Imagen"
                className="w-full max-w-[520px] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-md object-cover"
              />
              <div className="mt-2">
                <button
                  onClick={handleDownloadImage}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Download size={13} />
                  تنزيل الصورة
                </button>
              </div>
            </div>
          )}

          {message.isStreaming && message.content === '' && !thinking ? (
            <div className="flex gap-1 mt-2 mb-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            cleanText && (
              <div className="prose-ai mb-2">
                {parseMarkdown(cleanText)}
                {message.isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            )
          )}

          {/* Action Bar */}
          {!message.isStreaming && message.content !== '' && (
            <div className="flex items-center gap-2 mt-3 text-zinc-400 dark:text-zinc-500" dir="rtl">
              <button 
                onClick={handleCopy}
                className="p-1.5 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors"
                title="نسخ الإجابة"
              >
                {copiedResponse ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
              <button
                onClick={() => onFeedback?.(message.id, 'like')}
                disabled={isSharedView || !onFeedback}
                className={`p-1.5 rounded-md transition-colors ${feedback === 'like' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={() => onFeedback?.(message.id, 'dislike')}
                disabled={isSharedView || !onFeedback}
                className={`p-1.5 rounded-md transition-colors ${feedback === 'dislike' ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ThumbsDown size={16} />
              </button>
              <button
                onClick={() => onShare?.()}
                disabled={isSharedView || !onShare}
                className="p-1.5 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Share size={16} />
              </button>
              <button className="p-1.5 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">
                <RotateCw size={16} />
              </button>
              <button className="p-1.5 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
