import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Tolzy Pages — Build Beautiful Websites Visually',
  description:
    'Create stunning websites without code. Drag, drop, and publish in minutes with Tolzy Pages visual website builder.',
  keywords: ['website builder', 'drag and drop', 'no code', 'tolzy', 'visual editor'],
  openGraph: {
    title: 'Tolzy Pages — Build Beautiful Websites Visually',
    description: 'Create stunning websites without code.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
