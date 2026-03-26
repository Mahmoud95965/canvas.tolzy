'use client';
import Link from 'next/link'
import { Sparkles, FileText, ArrowRight, ChevronLeft } from 'lucide-react'

const SECTIONS = [
  {
    title: 'قبول الشروط',
    icon: '✅',
    content: [
      'باستخدامك لمنصة TOLZY Canvas، فإنك تقر بأنك قرأت هذه الشروط وتوافق عليها.',
      'إذا كنت لا توافق على أي من هذه الشروط، يُرجى التوقف عن استخدام المنصة.',
      'نحتفظ بالحق في تعديل هذه الشروط في أي وقت مع إشعار مسبق للمستخدمين.',
    ]
  },
  {
    title: 'استخدام الخدمة',
    icon: '🖥️',
    content: [
      'يحق لك استخدام TOLZY Canvas لإنشاء تصاميم لأغراض شخصية أو تجارية.',
      'يُحظر استخدام المنصة لإنشاء محتوى غير قانوني أو مسيء أو ينتهك حقوق الآخرين.',
      'أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور.',
      'يجب أن يكون عمرك 13 عاماً أو أكثر لاستخدام هذه الخدمة.',
    ]
  },
  {
    title: 'حقوق الملكية الفكرية',
    icon: '©️',
    content: [
      'التصاميم والكود الذي تنشئه عبر المنصة هو ملكك الكاملة.',
      'منصة TOLZY Canvas وتقنياتها وواجهتها محمية بموجب قوانين حقوق الملكية الفكرية.',
      'لا يحق لك نسخ أو توزيع أو بيع نظام TOLZY Canvas أو أجزاء منه.',
    ]
  },
  {
    title: 'قيود المسؤولية',
    icon: '⚠️',
    content: [
      'تُقدَّم الخدمة "كما هي" دون ضمانات من أي نوع سواء صريحة أو ضمنية.',
      'لسنا مسؤولين عن أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام المنصة.',
      'لا نضمن توافر الخدمة باستمرار، وقد تحدث انقطاعات للصيانة أو التحديثات.',
    ]
  },
  {
    title: 'الاشتراكات والمدفوعات',
    icon: '💳',
    content: [
      'بعض الميزات المتقدمة قد تتطلب اشتراكاً مدفوعاً في المستقبل.',
      'خلال الفترة التجريبية (Beta)، جميع الميزات متاحة مجاناً للمستخدمين المسجلين.',
      'ستُبلَّغ بأي تغييرات في سياسة الأسعار قبل 30 يوماً من تطبيقها.',
    ]
  },
  {
    title: 'إنهاء الحساب',
    icon: '🚪',
    content: [
      'يحق لك إغلاق حسابك في أي وقت من خلال إعدادات الحساب.',
      'نحتفظ بالحق في تعليق أو إنهاء حسابات تنتهك هذه الشروط.',
      'عند حذف الحساب، سيتم حذف جميع بياناتك ومشاريعك خلال 30 يوماً.',
    ]
  },
  {
    title: 'القانون المطبق',
    icon: '⚖️',
    content: [
      'تخضع هذه الشروط للقوانين المعمول بها في مقر إقامة مزود الخدمة.',
      'أي نزاعات تنشأ عن هذه الشروط يُسوَّى بالتفاوض الودي أولاً.',
      'للتواصل بشأن أي نزاع قانوني، يُرجى مراسلتنا مباشرة عبر قنوات الدعم.',
    ]
  },
]

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#05050a', color: '#f2f2f5', direction: 'rtl', fontFamily: "'Cairo','Inter',sans-serif" }}>

      {/* Ambient BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '70vw', height: '70vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(5,5,10,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>TOLZY Canvas</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}>
          <ChevronLeft size={15} />
          العودة للرئيسية
        </Link>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '99px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', marginBottom: '20px', fontSize: '12px', fontWeight: 700, color: '#c084fc' }}>
          <FileText size={13} /> الشروط والأحكام
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          الشروط التي تحكم
          <span style={{ display: 'block', background: 'linear-gradient(135deg,#c084fc,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>استخدام المنصة</span>
        </h1>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
          يرجى قراءة هذه الشروط بعناية قبل استخدام TOLZY Canvas. هي تحدد حقوقك والتزاماتك معنا.
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
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <span style={{ fontSize: '22px' }}>{s.icon}</span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>{s.title}</h2>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {s.content.map((item, j) => (
                <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', flexShrink: 0, marginTop: '9px' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Links */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s', textDecoration: 'none' }}>
            اقرأ سياسة الخصوصية ←
          </Link>
          <a href="https://tolzy.me/contact" target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s', textDecoration: 'none' }}>
            تواصل مع الدعم <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </div>
  )
}
