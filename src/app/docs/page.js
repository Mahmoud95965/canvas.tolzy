import Link from 'next/link'

export const metadata = {
  title: 'التوثيق ودليل الاستخدام',
  description: 'دليلك السريع والشامل لاستخدام منصة Tolzy Canvas. تعلم كتابة أوامر التصميم (Prompts) وهندسة الواجهات وتصدير الأكواد بفاعلية عالية.',
};

export default function DocsPage() {
  return (
    <div style={{minHeight:'100vh', display:'flex', background:'var(--bg-dark)', color:'var(--text-primary)', direction:'rtl'}}>
      {/* Sidebar */}
      <div style={{width:'320px', borderLeft:'1px solid var(--border-color)', padding:'40px 32px', background:'var(--bg-glass)', backdropFilter:'blur(20px)'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'48px'}}>
          <div style={{width:32, height:32, borderRadius:8, background:'linear-gradient(135deg, #6366f1, #a855f7)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </div>
          <span style={{fontSize:'18px', fontWeight:800}}>TOLZY Docs</span>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'16px', color:'var(--text-secondary)'}}>
          <a href="#" style={{color:'var(--accent-color)', fontWeight:600, background:'rgba(99,102,241,0.1)', padding:'8px 12px', borderRadius:'8px'}}>دليل البداية</a>
          <a href="#" style={{padding:'8px 12px', borderRadius:'8px', transition:'background 0.2s', cursor:'pointer'}}>كتابة الطلبات والهندسة النصية</a>
          <a href="#" style={{padding:'8px 12px', borderRadius:'8px', transition:'background 0.2s', cursor:'pointer'}}>اختصارات وضوابط لوحة العمل</a>
          <a href="#" style={{padding:'8px 12px', borderRadius:'8px', transition:'background 0.2s', cursor:'pointer'}}>تصدير المشاريع و HTML</a>
        </div>
        <div style={{marginTop:'auto', paddingTop:'40px'}}>
          <Link href="/">
             <button style={{width:'100%', padding:'12px', borderRadius:'12px', border:'1px solid var(--border-color)', color:'var(--text-secondary)', fontWeight:600, background:'transparent', cursor:'pointer'}}>العودة للرئيسية</button>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{flex:1, padding:'64px 80px', overflowY:'auto'}}>
        <div style={{maxWidth:'800px'}}>
          <div style={{fontSize:'14px', color:'#6366f1', fontWeight:700, marginBottom:'16px', letterSpacing:'1px'}}>الأساسيات</div>
          <h1 style={{fontSize:'56px', fontWeight:800, marginBottom:'24px', letterSpacing:'-1px'}}>دليل الاستخدام السريع</h1>
          <p style={{fontSize:'20px', color:'var(--text-secondary)', marginBottom:'48px', lineHeight:1.7}}>
            تعلم كيف تحقق أقصى استفادة من قدرات Tolzy Canvas لإنشاء واجهات مذهلة، تفاعلية، وقابلة للتصدير في ثوانٍ معدودة باستخدام الذكاء الاصطناعي الخاص بنا.
          </p>
          
          <div style={{padding:'32px', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'24px', marginBottom:'40px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px'}}>
              <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                 <span style={{fontSize:'20px'}}>💡</span>
              </div>
              <h3 style={{fontSize:'20px', fontWeight:700, color:'var(--text-primary)'}}>نصيحة للمحترفين</h3>
            </div>
            <p style={{color:'var(--text-secondary)', lineHeight:1.8, fontSize:'16px'}}>
              استخدم وصفاً دقيقاً ومفصلاً للألوان، والمسافات الداخلية (padding)، وأنواع الخطوط. إذا كنت ترغب بتصميم داكن اكتب "dark mode glassmorphism"، للحصول على نتائج مبهرة من المحاولة الأولى.
            </p>
          </div>

          <h2 style={{fontSize:'32px', fontWeight:700, marginBottom:'24px', marginTop:'64px'}}>أدوات التحكم في الواجهة</h2>
          <p style={{color:'var(--text-secondary)', lineHeight:1.8, fontSize:'16px', marginBottom:'24px'}}>
            بمجرد إنشاء مشروعك، يمكنك النقر بزر الماوس الأيمن على إطار العمل للوصول إلى قائمة السياق (Context Menu). من خلال هذه القائمة تستطيع تشغيل الكود مباشرة بأمان تام في شاشة عرض كاملة، أو تحميله كملف HTML منفصل، أو حتى طلب إعادة صياغة برمجية كاملة مع الاحتفاظ بالنمط الأساسي.
          </p>
          
        </div>
      </div>
    </div>
  )
}
