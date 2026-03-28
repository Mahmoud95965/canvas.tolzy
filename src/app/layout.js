import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileBlocker from "../components/MobileBlocker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://tolzy.me'),
  title: {
    template: '%s | T O L Z Y AI',
    default: 'T O L Z Y AI - منظومة إبداعية متكاملة بالذكاء الاصطناعي',
  },
  description: 'TOLZY هي منصة الجيل القادم للإبداع الرقمي، توفر أدوات متقدمة لتوليد الصور، تصميم الواجهات، والمساعدة الذكية باستخدام أحدث نماذج الذكاء الاصطناعي.',
  keywords: ['TOLZY', 'ذكاء اصطناعي', 'توليد صور', 'تصميم واجهات', 'AI Studio', 'AI Copilot', 'AI Canvas', 'إبداع رقمي'],
  authors: [{ name: 'Tolzy Team', url: 'https://tolzy.me' }],
  creator: 'Tolzy',
  publisher: 'Tolzy',
  openGraph: {
    title: 'T O L Z Y AI - عالمك الإبداعي المطور بالذكاء الاصطناعي',
    description: 'استكشف أدوات TOLZY المتطورة: Studio لتوليد الصور، Copilot للمساعدة الذكية، و Canvas لتصميم الواجهات. كل ما تحتاجه في مكان واحد.',
    url: 'https://tolzy.me',
    siteName: 'T O L Z Y AI',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'T O L Z Y AI - الإبداع بلا حدود',
    description: 'منصة متكاملة تجمع أقوى أدوات الذكاء الاصطناعي للمبدعين والمطورين.',
    creator: '@tolzy_app',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'CvfgfNzJGq2YOnvINe7ljJLpIgW4pDugHzdpbWaPvWY',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f0f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0e' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "T O L Z Y AI",
              "url": "https://tolzy.me",
              "description": "منصة متكاملة تجمع أقوى أدوات الذكاء الاصطناعي للمبدعين والمطورين، تشمل توليد الصور، تصميم الواجهات، والمساعدة الذكية.",
              "applicationCategory": "MultimediaApplication, DesignApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body>
        <MobileBlocker />
        {children}
      </body>
    </html>
  );
}
