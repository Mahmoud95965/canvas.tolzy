export const metadata = {
  title: 'الأسئلة الشائعة',
  description: 'كيف يمكننا مساعدتك؟ اكتشف إجابات سريعة للأسئلة المتكررة وتعرف على ميزات منصة Tolzy Canvas المدعومة بالذكاء الاصطناعي.',
};

export default function FAQPage() {
  return (
    <div style={{minHeight:'100vh', padding:'80px 20px', background:'var(--bg-dark)', color:'var(--text-primary)', direction:'rtl'}}>
       <div style={{maxWidth:'800px', margin:'0 auto'}}>
         <h1 style={{fontSize:'48px', fontWeight:800, marginBottom:'24px', textAlign:'center'}}>الأسئلة الشائعة</h1>
         <p style={{fontSize:'18px', color:'var(--text-secondary)', textAlign:'center', marginBottom:'48px'}}>كيف يمكننا مساعدتك اليوم؟ اكتشف إجابات سريعة للأسئلة المتكررة.</p>
         <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
           <div style={{padding:'24px', background:'var(--bg-glass)', borderRadius:'16px', border:'1px solid var(--border-color)', transition:'all 0.3s'}}>
             <h3 style={{fontSize:'18px', fontWeight:700, marginBottom:'12px'}}>ما هو TOLZY Canvas؟</h3>
             <p style={{color:'var(--text-secondary)', lineHeight:1.6}}>منصة متقدمة لإنشاء وتصميم واجهات المستخدم التفاعلية والبرمجية باستخدام الذكاء الاصطناعي، ببساطة عبر وصف ما تريده نصياً لتجد التصميم يظهر أمامك فوراً.</p>
           </div>
           <div style={{padding:'24px', background:'var(--bg-glass)', borderRadius:'16px', border:'1px solid var(--border-color)', transition:'all 0.3s'}}>
             <h3 style={{fontSize:'18px', fontWeight:700, marginBottom:'12px'}}>كيف أستطيع تصدير كود العمل الخاص بي؟</h3>
             <p style={{color:'var(--text-secondary)', lineHeight:1.6}}>هذا بسيط جدًا! قم بالنقر بزر الماوس الأيمن على أي تصميم داخل مساحة العمل، ثم اختر "تنزيل HTML" ليتم تحميل الكود المصدري كاملاً لجهازك لتتمكن من استخدامه فوراً.</p>
           </div>
           <div style={{padding:'24px', background:'var(--bg-glass)', borderRadius:'16px', border:'1px solid var(--border-color)', transition:'all 0.3s'}}>
             <h3 style={{fontSize:'18px', fontWeight:700, marginBottom:'12px'}}>هل يمكن التعديل على تصميم موجود بدلاً من إنشاء واحد جديد؟</h3>
             <p style={{color:'var(--text-secondary)', lineHeight:1.6}}>بالتأكيد. يمكنك النقر بزر الماوس الأيمن على التصميم واختيار "إعادة صياغة كاملة" (Remake)، وسيقوم المولد بتهيئة شريط البحث وتجهيز الكود الأصلي لإجراء التعديلات التي تطلبها بدقة عالية.</p>
           </div>
         </div>
       </div>
    </div>
  )
}
