import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Tolzy AI — مساعدك الذكي المتقدم',
  description: 'Tolzy AI — مساعد ذكي متقدم للإجابة على الأسئلة، كتابة الكود، وتصميم واجهات مذهلة.',
  keywords: ['Tolzy AI', 'AI assistant', 'مساعد ذكاء اصطناعي', 'chatbot', 'code generation'],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
  title: 'Tolzy AI — مساعدك الذكي المتقدم',
    description: 'مساعد ذكي لكل شيء — كود، تصاميم، وأسئلة.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
