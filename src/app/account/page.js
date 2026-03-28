'use client';
import React, { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { supabase } from '../../lib/supabase';
import { LogOut, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [projectsCount, setProjectsCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const mappedUser = { ...fbUser, id: fbUser.uid };
        setUser(mappedUser);
        const { count } = await supabase.from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', mappedUser.id);
        setProjectsCount(count || 0);
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (!user) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#070709', color:'#fff', direction:'rtl'}}>جاري التحميل...</div>;

  return (
    <div style={{minHeight:'100vh', padding:'80px 20px', background:'#070709', color:'#f0f0f2', direction:'rtl'}}>
      <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <Link href="/">
          <button style={{display:'flex', alignItems:'center', gap:'8px', background:'transparent', border:'none', color:'#888', cursor:'pointer', marginBottom:'40px', fontSize:'14px', fontWeight:600, transition:'color 0.2s', ':hover':{color:'#fff'}}}>
            <ArrowRight size={16} /> العودة لمساحة العمل
          </button>
        </Link>

        <h1 style={{fontSize:'36px', fontWeight:800, marginBottom:'32px', letterSpacing:'-0.5px'}}>إعدادات الحساب</h1>

        <div style={{background:'rgba(20,20,24,0.6)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'24px', padding:'40px', backdropFilter:'blur(20px)', boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}>
          <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'40px'}}>
            <div style={{width:'88px', height:'88px', borderRadius:'50%', background:'linear-gradient(135deg, #6366f1, #a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', fontWeight:800, color:'#fff', boxShadow:'0 8px 24px rgba(99,102,241,0.3)'}}>
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:'24px', fontWeight:700}}>
                {user.displayName || user.email.split('@')[0]}
              </div>
              <div style={{color:'#a1a1aa', marginTop:'4px', fontSize:'14px'}}>مصمم واجهات مستقل بمنصة Tolzy</div>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
              <div>
                <div style={{fontSize:'13px', color:'#71717a', fontWeight:600, marginBottom:'8px'}}>عدد المشاريع الفعالة</div>
                <div style={{background:'rgba(255,255,255,0.03)', padding:'14px 16px', borderRadius:'12px', fontSize:'16px', fontWeight:800, color:'#6366f1', border:'1px solid rgba(255,255,255,0.05)'}}>
                  {projectsCount} مشروع
                </div>
              </div>
              <div>
                <div style={{fontSize:'13px', color:'#71717a', fontWeight:600, marginBottom:'8px'}}>آخر تسجيل دخول</div>
                <div style={{background:'rgba(255,255,255,0.03)', padding:'14px 16px', borderRadius:'12px', fontSize:'14px', fontWeight:500, border:'1px solid rgba(255,255,255,0.05)', textAlign:'right'}} dir="ltr">
                  {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString('ar-EG', { dateStyle:'medium', timeStyle:'short' }) : 'غير متوفر'}
                </div>
              </div>
            </div>

            <div style={{height:'1px', background:'rgba(255,255,255,0.03)', margin:'8px 0'}} />

            <div>
              <div style={{fontSize:'13px', color:'#71717a', fontWeight:600, marginBottom:'8px'}}>البريد الإلكتروني</div>
              <div style={{background:'rgba(255,255,255,0.03)', padding:'14px 16px', borderRadius:'12px', fontSize:'16px', fontWeight:500, border:'1px solid rgba(255,255,255,0.05)'}}>{user.email}</div>
            </div>
            <div>
              <div style={{fontSize:'13px', color:'#71717a', fontWeight:600, marginBottom:'8px'}}>معرف المستخدم الحصري</div>
              <div style={{background:'rgba(255,255,255,0.03)', padding:'14px 16px', borderRadius:'12px', fontSize:'15px', fontWeight:500, fontFamily:'monospace', color:'#a1a1aa', border:'1px solid rgba(255,255,255,0.05)'}}>{user.id}</div>
            </div>
            <div>
              <div style={{fontSize:'13px', color:'#71717a', fontWeight:600, marginBottom:'8px'}}>تاريخ الانضمام وبداية النشاط</div>
              <div style={{background:'rgba(255,255,255,0.03)', padding:'14px 16px', borderRadius:'12px', fontSize:'15px', fontWeight:500, border:'1px solid rgba(255,255,255,0.05)'}}>
                {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ar-EG', { dateStyle:'long' }) : 'غير متوفر'}
              </div>
            </div>
          </div>

          <div style={{height:'1px', background:'rgba(255,255,255,0.08)', margin:'40px 0'}} />

          <button onClick={handleSignOut} style={{width:'100%', padding:'16px', borderRadius:'14px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)', fontSize:'15px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', transition:'all 0.2s'}}>
            <LogOut size={18} /> تسجيل الخروج من هذا الحساب
          </button>
        </div>
      </div>
    </div>
  )
}
