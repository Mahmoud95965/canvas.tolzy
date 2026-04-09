import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import ChatMessage from '@/components/chat/ChatMessage';

type SharedMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default async function SharedChatPage({ params }: { params: { slug: string } }) {
  const { data: sharedChat } = await supabaseAdmin
    .from('shared_chats')
    .select('title, messages, created_at')
    .eq('share_slug', params.slug)
    .single();

  if (!sharedChat) {
    notFound();
  }

  const messages = Array.isArray(sharedChat.messages) ? (sharedChat.messages as SharedMessage[]) : [];

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-[#0b0b0c] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#131416] border border-zinc-200 dark:border-white/10 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-zinc-900 dark:text-white">{sharedChat.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">تمت المشاركة عبر منصة Tolzy</p>
          </div>
          <a
            href="/app"
            className="inline-flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
          >
            ابدأ محادثتك الخاصة مجاناً
          </a>
        </div>

        <div className="bg-white dark:bg-[#131416] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 sm:p-6">
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <ChatMessage
                key={`${params.slug}-${index}`}
                message={{
                  id: `${params.slug}-${index}`,
                  role: msg.role === 'assistant' ? 'assistant' : 'user',
                  content: msg.content || '',
                }}
                isSharedView
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
