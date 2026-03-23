import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    template: '%s | TOLZY Canvas',
    default: 'TOLZY Canvas - صمم واجهات المستخدم بالذكاء الاصطناعي في ثوانٍ',
  },
  description: 'منصة TOLZY Canvas المتطورة لتوليد وتصميم واجهات المستخدم (UI/UX) باستخدام الذكاء الاصطناعي. اكتب وصفك واحصل على كود برمجي جاهز وقابل للتصدير فوراً.',
  keywords: ['تصميم واجهات', 'ذكاء اصطناعي', 'توليد أكواد', 'UI/UX', 'برمجة', 'React', 'HTML', 'TOLZY'],
  authors: [{ name: 'Tolzy Team', url: 'https://tolzy.me' }],
  creator: 'Tolzy',
  publisher: 'Tolzy',
  openGraph: {
    title: 'TOLZY Canvas - صمم واجهات المستخدم بالذكاء الاصطناعي',
    description: 'تحول أفكارك إلى واجهات تفاعلية وأكواد برمجية في ثوانٍ معدودة. جرب توليد واجهات المستخدم بالذكاء الاصطناعي الآن.',
    url: 'https://tolzy.me',
    siteName: 'TOLZY Canvas',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOLZY Canvas - صمم واجهات المستخدم بالذكاء الاصطناعي',
    description: 'اكتب وصفك واحصل على كود برمجي جاهز وقابل للتصدير فوراً.',
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
              "name": "TOLZY Canvas",
              "url": "https://tolzy.me",
              "description": "منصة لتوليد وتصميم واجهات المستخدم باستخدام الذكاء الاصطناعي ببساطة عبر الوصف النصي وإنشاء كود برمجي جاهز للعمل.",
              "applicationCategory": "DeveloperApplication",
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
      <body>{children}</body>
    </html>
  );
}
