'use client';
import Link from 'next/link'
import { Sparkles, Shield, ArrowRight, ChevronLeft } from 'lucide-react'

const SECTIONS = [
  {
    title: 'جمع المعلومات',
    icon: '📋',
    content: [
      'نجمع المعلومات التي تقدمها أثناء التسجيل مثل الاسم وعنوان البريد الإلكتروني.',
      'نجمع بيانات الاستخدام بشكل تلقائي مثل نوع المتصفح وعنوان IP ووقت الوصول.',
      'يمكننا جمع بيانات عن التصاميم والمشاريع التي تنشئها داخل TOLZY Canvas.',
    ]
  },
  {
    title: 'كيفية استخدام المعلومات',
    icon: '⚙️',
    content: [
      'تشغيل المنصة وتوفير الخدمات المطلوبة وتعزيز تجربة المستخدم.',
      'تحسين جودة الذكاء الاصطناعي وتطوير النماذج بناءً على أنماط الاستخدام المجهولة.',
      'التواصل معك بشأن تحديثات المنصة والميزات الجديدة.',
      'الامتثال للمتطلبات القانونية وحماية حقوق المستخدمين.',
    ]
  },
  {
    title: 'مشاركة المعلومات',
    icon: '🔗',
    content: [
      'لا نبيع أو نأجر بياناتك الشخصية لأطراف ثالثة في أي ظرف.',
      'قد نشارك البيانات مع مزودي الخدمة الموثوقين الذين يساعدوننا في تشغيل المنصة.',
      'قد نكشف عن المعلومات إذا طلب ذلك القانون أو لحماية حقوق TOLZY والمستخدمين.',
    ]
  },
  {
    title: 'أمان البيانات',
    icon: '🔒',
    content: [
      'نستخدم تشفير SSL/TLS لجميع البيانات المنقولة بين متصفحك وخوادمنا.',
      'نعتمد على Supabase كقاعدة بيانات آمنة ومعتمدة بمعايير دولية عالية.',
      'نُجري مراجعات أمنية دورية لضمان سلامة بياناتك باستمرار.',
    ]
  },
  {
    title: 'حقوق المستخدم',
    icon: '⚖️',
    content: [
      'يحق لك الوصول إلى بياناتك الشخصية وتعديلها أو حذفها في أي وقت.',
      'يمكنك طلب تصدير نسخة كاملة من بياناتك بتنسيق قابل للقراءة.',
      'يمكنك إلغاء حسابك وطلب حذف جميع بياناتك نهائياً.',
    ]
  },
  {
    title: 'ملفات تعريف الارتباط',
    icon: '🍪',
    content: [
      'نستخدم ملفات تعريف الارتباط (Cookies) للحفاظ على جلسة تسجيل الدخول.',
      'بعض ملفات تعريف الارتباط ضرورية لتشغيل المنصة بشكل صحيح.',
      'يمكنك ضبط إعدادات المتصفح لرفض ملفات الارتباط، مع ملاحظة تأثير ذلك على الأداء.',
    ]
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#05050a', color: '#f2f2f5', direction: 'rtl', fontFamily: "'Cairo','Inter',sans-serif" }}>

      {/* Ambient BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '70vw', height: '70vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(5,5,10,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>TOLZY Canvas</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          <ChevronLeft size={15} />
          العودة للرئيسية
        </Link>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '20px', fontSize: '12px', fontWeight: 700, color: '#818cf8' }}>
          <Shield size={13} /> سياسة الخصوصية
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          كيف نحمي بياناتك
          <span style={{ display: 'block', background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>وخصوصيتك</span>
        </h1>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
          نحن نأخذ خصوصيتك بجدية تامة. هذه السياسة توضح بشفافية كاملة ما نجمعه وكيف نستخدمه.
        </p>
        <div style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
          آخر تحديث: مارس 2026
        </div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '0 40px 80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{
            background: 'rgba(14,14,22,0.7)', backdropFilter: 'blur(24px)',
            borderRadius: '20px', padding: '28px 32px',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: `fadeUp 0.6s ${i * 0.06}s both ease`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <span style={{ fontSize: '22px' }}>{s.icon}</span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>{s.title}</h2>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {s.content.map((item, j) => (
                <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: '9px' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.08))', borderRadius: '20px', padding: '32px', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>📩</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>هل لديك أسئلة؟</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', lineHeight: 1.6 }}>
            إذا كانت لديك أي استفسارات حول سياسة الخصوصية، لا تتردد في التواصل معنا.
          </p>
          <a href="https://tolzy.me/contact" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '99px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: '0 8px 24px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}>
            تواصل معنا <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </div>
  )
}
