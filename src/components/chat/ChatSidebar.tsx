'use client';

import { MessageSquare, Plus, Trash2, Clock, X, Settings, SquarePen, Menu } from 'lucide-react';
import { User } from 'firebase/auth';

export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
}

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  user: User | null;
  onSignOut: () => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

function groupByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const now = Date.now();
  const DAY = 86400000;

  const groups: Record<string, Conversation[]> = {
    'اليوم': [],
    'أمس': [],
    'هذا الأسبوع': [],
    'عناصر أقدم': [],
  };

  for (const c of conversations) {
    const age = now - c.updatedAt;
    if (age < DAY) groups['اليوم'].push(c);
    else if (age < 2 * DAY) groups['أمس'].push(c);
    else if (age < 7 * DAY) groups['هذا الأسبوع'].push(c);
    else groups['عناصر أقدم'].push(c);
  }

  return groups;
}

export default function ChatSidebar({ conversations, activeId, onSelect, onNew, onDelete, onClose, user, onSignOut, isExpanded = true, onToggle }: Props) {
  const groups = groupByDate(conversations);

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors" dir="rtl">
      {/* Mobile Close Button / Desktop Toggle */}
      <div className={`pt-3 ${isExpanded ? 'px-3 flex justify-between' : 'flex justify-center'}`}>
        {/* Toggle Button (Desktop Only) */}
        <button
          onClick={onToggle}
          className="hidden md:flex p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <Menu size={18} />
        </button>
        {/* Close Button (Mobile Only) */}
        {isExpanded && (
          <button
            onClick={onClose}
            className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 rounded-full transition-colors ml-auto"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* New Chat Button (Gemini Style) */}
      <div className={`py-4 md:pt-6 ${isExpanded ? 'px-4' : 'flex justify-center'}`}>
        <button
          onClick={onNew}
          className={`flex items-center justify-center gap-3 py-3 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-bold transition-all ${isExpanded ? 'px-4 w-fit text-[15px]' : 'w-10 h-10 px-0'}`}
          title="محادثة جديدة"
        >
          <SquarePen size={18} className="shrink-0" />
          {isExpanded && <span>محادثة جديدة</span>}
        </button>
      </div>

      {/* Conversation List */}
      <div className={`flex-1 overflow-y-auto pb-4 scrollbar-hide mt-2 ${isExpanded ? 'px-3 block' : 'hidden'}`}>
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 dark:text-zinc-600 text-xs px-4">
            <MessageSquare size={28} className="mx-auto mb-3 opacity-40" />
            <p>لا توجد دردشات سابقة.</p>
          </div>
        ) : (
          Object.entries(groups).map(([label, convs]) => {
            if (convs.length === 0) return null;
            return (
              <div key={label} className="mb-6">
                <div className="px-2 mb-2">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500 tracking-wider">
                    {label}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {convs.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => onSelect(conv.id)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeId === conv.id
                          ? 'bg-zinc-200/80 dark:bg-white/10 text-zinc-900 dark:text-white font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                        <MessageSquare size={14} className="shrink-0 opacity-60" />
                        <span className="text-[13.5px] truncate leading-tight mt-0.5">{conv.title}</span>
                      </div>
                      <button
                         onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                         className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all shrink-0"
                         title="حذف المحادثة"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settings (Bottom) */}
      <div className={`p-4 mt-auto border-t border-zinc-200 dark:border-white/5 ${isExpanded ? '' : 'flex justify-center'}`}>
        <button 
          className={`flex items-center justify-center gap-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all font-semibold ${isExpanded ? 'px-3 w-full text-[14px]' : 'w-10 h-10 px-0'}`}
          title="الإعدادات"
        >
          <Settings size={18} className="shrink-0" />
          {isExpanded && <span>الإعدادات</span>}
        </button>
      </div>
    </div>
  );
}
