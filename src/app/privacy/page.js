export const metadata = {
  title: 'سياسة الخصوصية',
  description: 'تعرف على معاييرنا الصارمة في الحفاظ على خصوصية مستخدمينا وحماية بيانات المشاريع البرمجية في منصة Tolzy.',
};

export default function PrivacyPage() {
  return (
    <div style={{minHeight:'100vh', padding:'80px 20px', background:'var(--bg-dark)', color:'var(--text-primary)', direction:'rtl'}}>
       <div style={{maxWidth:'800px', margin:'0 auto'}}>
         <h1 style={{fontSize:'48px', fontWeight:800, marginBottom:'48px', textAlign:'center', background:'linear-gradient(135deg, var(--text-primary), var(--text-muted))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>سياسة الخصوصية</h1>
         <div style={{padding:'40px', background:'var(--bg-glass)', borderRadius:'24px', border:'1px solid var(--border-color)', lineHeight:1.8, boxShadow:'0 24px 80px rgba(0,0,0,0.1)'}}>
           <h2 style={{fontSize:'24px', fontWeight:700, marginBottom:'16px', color:'var(--accent-color)'}}>1. جمع المعلومات والبيانات</h2>
           <p style={{color:'var(--text-secondary)', marginBottom:'32px'}}>نحن نقوم بجمع معلوماتك الأساسية لتحسين تجربة استخدامك لمنصة Tolzy عبر فهم التفاعلات والأوصاف التي تدخلها لبناء واجهات المستخدم وتخصيص تجربتك لتناسـب مساحة عملك بشكل أفضـل.</p>
           
           <h2 style={{fontSize:'24px', fontWeight:700, marginBottom:'16px', color:'var(--accent-color)'}}>2. حماية الخصوصية وتأمين بياناتك</h2>
           <p style={{color:'var(--text-secondary)', marginBottom:'32px'}}>أمان بياناتك وأكوادك البرمجية المعتمدة هو أولويتنا القصوى. نقوم بتبني وتطبيق أحدث تقنيات الأمن السيبراني والتشفير لضمان سرية مشاريعك وتصميماتك وقاعدة بيانات حسابك ضد أي اختراقات.</p>

           <h2 style={{fontSize:'24px', fontWeight:700, marginBottom:'16px', color:'var(--accent-color)'}}>3. مشاركة المحتوى مع الأطراف الثالثة</h2>
           <p style={{color:'var(--text-secondary)'}}>لا نقوم أبداً ببيع بياناتك لأطراف خارجية. تتم مشاركة مطالباتك البرمجية والوصف فقط مع مزودات ونماذج الذكاء الاصطناعي (مثل Qwen وغيرها) بغرض التوليد والاستنتاج البرمجي المباشر فقط.</p>
         </div>
       </div>
    </div>
  )
}
