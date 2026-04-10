import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'TOLZY AI — المساعد اللغوي الذكي للبرمجة والمعرفة',
  description: 'TOLZY AI — نموذج لغوي متقدم للإجابة على كافة تساؤلاتك مع تخصص دقيق في عالم البرمجة وحل المشكلات التقنية.',
  keywords: ['TOLZY AI', 'programming AI', 'مساعد برمجيا', 'ذكاء اصطناعي', 'نموذج لغوي'],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
  title: 'TOLZY AI — ذكاء لغوي فائق للبرمجة',
    description: 'نموذج لغوي متكامل للإجابة على أسئلتك وحل مشاكلك البرمجية.',
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
