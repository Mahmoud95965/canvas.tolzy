import AppUI from '@/components/app/AppUI';

export default function AppChatRoute({ params }: { params: { chatId: string } }) {
  return <AppUI initialChatId={params.chatId} />;
}
