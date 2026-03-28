'use client';
import React from 'react'
import {
  Search, Plus, LayoutGrid, Sparkles, Mic, Globe, Settings,
  HelpCircle, Sun, Moon, Trash2, MoreVertical, LogOut, User,
  ChevronRight, FolderOpen, ArrowLeft, ArrowRight,
  Facebook, BookText, Menu, X, Zap, Star, Image as ImageIcon,
  Compass, CreditCard, Layers, MessageSquare, Canvas, Cpu
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import ParticlesBackground from '../components/ParticlesBackground'

const Dashboard = ({ user, onOpenProject }) => {
  const [projects, setProjects] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [promptValue, setPromptValue] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showProfile, setShowProfile] = React.useState(false)
  const [showMoreMenu, setShowMoreMenu] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [promptFocused, setPromptFocused] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('studio') 
  
  const router = useRouter()

  React.useEffect(() => { fetchProjects() }, [user])
  
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    return () => document.documentElement.removeAttribute('data-theme')
  }, [darkMode])

  const fetchProjects = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
    if (data) setProjects(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    const { auth } = await import('../lib/firebase')
    await auth.signOut()
    router.push('/')
  }

  const handleCreateProject = async () => {
    const title = prompt('اسم المشروع:')
    if (!title) return
    const { data, error } = await supabase.from('projects').insert([{ title, user_id: user.id }]).select()
    if (data) { setProjects(prev => [data[0], ...prev]); onOpenProject(data[0]) }
    if (error) console.error(error)
  }

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation()
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    const { error } = await supabase.from('projects').delete().eq('id', projectId)
    if (!error) setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  const handleSubmitPrompt = async (e, customPrompt = null) => {
    if (e) e.preventDefault()
    const finalPrompt = customPrompt || promptValue
    if (!finalPrompt.trim()) return

    if (!user || !user.id) {
       alert('يرجى تسجيل الدخول مجدداً')
       return
    }

    setIsSubmitting(true)
    const title = finalPrompt.split(' ').slice(0, 5).join(' ') + '...'
    
    try {
      const { data: projectData, error } = await supabase.from('projects')
        .insert([{ 
          title, 
          user_id: user.id, 
          content: { initial_prompt: finalPrompt } 
        }])
        .select()

      setIsSubmitting(false)

      if (error) {
        console.error('Supabase Error:', error)
        alert(`خطأ: ${error.message}`)
        return
      }

      if (projectData && projectData[0]) {
        onOpenProject(projectData[0])
      }
    } catch (err) {
      setIsSubmitting(false)
      console.error(err)
    }
  }

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const ecosystemApps = [
    { id: 'studio', name: 'Tolzy Studio', icon: Sparkles, desc: 'توليد الصور والفن', color: '#818cf8', active: true },
    { id: 'copilot', name: 'Tolzy Copilot', icon: MessageSquare, desc: 'الدردشة والبحث', color: '#a855f7', active: false },
    { id: 'canvas', name: 'Tolzy Canvas', icon: Layers, desc: 'محرر الواجهات', color: '#ec4899', active: false },
    { id: 'prompts', name: 'Prompts Lib', icon: BookText, desc: 'مكتبة الأوامر', color: '#f59e0b', active: false },
  ]

  const suggestions = [
    { label: 'شخصية 3D', icon: LayoutGrid, prompt: 'شخصية 3D لطيفة لصبي يرتدي قبعة زرقاء ويحمل حقيبة ظهر في غابة مليئة بالألوان' },
    { label: 'صورة سينمائية', icon: Globe, prompt: 'صورة متقنة واقعية لرائد فضاء يقف على كوكب غريب ذو سماء أرجوانية بدقة 4K' },
    { label: 'رسم رقمي', icon: Star, prompt: 'رسم رقمي بأسلوب السايبربانك لمدينة مستقبلية تحت المطر وإضاءة النيون' },
  ]

  const projectGradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #06b6d4, #3b82f6)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
  ]

  const isDark = darkMode

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      background: isDark ? '#07070a' : '#f8f8fb',
      color: isDark ? '#f2f2f5' : '#111117',
      transition: 'background 0.5s ease',
      direction: 'rtl', fontFamily: "'Inter', sans-serif", overflow: 'hidden'
    }}>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .app-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.06) !important; border-color: rgba(99,102,241,0.3) !important; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
      `}</style>

      {isDark && <ParticlesBackground />}

      {/* ─── Sidebar ─── */}
      <aside style={{
        width: isSidebarOpen ? '280px' : '88px',
        background: isDark ? 'rgba(8,8,12,0.8)' : '#fff',
        borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#eee'}`,
        backdropFilter: 'blur(32px)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100, position: 'relative'
      }}>
        {/* Logo Section */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={22} color="#fff" />
          </div>
          {isSidebarOpen && <span style={{ fontSize: '20px', fontWeight: 900, whiteSpace: 'nowrap' }}>TOLZY <span style={{ color: '#818cf8', fontSize: '10px' }}>ECOSYSTEM</span></span>}
        </div>

        {/* Navigation Section */}
        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 800, padding: '10px 12px', display: isSidebarOpen ? 'block' : 'none' }}>منظومة التطبيقات</div>
          
          {ecosystemApps.map((app) => (
            <div key={app.id} className="nav-item" style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '16px',
              background: app.active ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: app.active ? '#818cf8' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
            }} onClick={() => app.active ? setActiveTab(app.id) : window.open(`https://tolzy.me/${app.id}`, '_blank')}>
              <app.icon size={22} />
              {isSidebarOpen && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{app.name}</div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>{app.desc}</div>
                </div>
              )}
              {!app.active && isSidebarOpen && <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: 4 }}>{app.id === 'copilot' ? 'جديد' : 'قريباً'}</span>}
            </div>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 12px' }} />
          
          <div key="projects" className="nav-item" style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '16px',
            background: activeTab === 'projects' ? 'rgba(255,255,255,0.05)' : 'transparent',
            color: activeTab === 'projects' ? '#fff' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer'
          }} onClick={() => setActiveTab('projects')}>
             <FolderOpen size={22} />
             {isSidebarOpen && <span style={{ fontWeight: 700 }}>مشاريعي الخاصة</span>}
          </div>
        </div>

        {/* Bottom User Section */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setShowProfile(!showProfile)}>
             <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{user?.email?.[0].toUpperCase()}</div>
             {isSidebarOpen && (
               <div style={{ flex: 1, overflow: 'hidden' }}>
                 <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.displayName || 'المستخدم'}</div>
                 <div style={{ fontSize: '10px', opacity: 0.5 }}>اكتشف النسخة الاحترافية</div>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <header style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(7,7,10,0.4)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>
                <Menu size={20} />
              </button>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{activeTab === 'studio' ? 'TOLZY Studio' : 'المشاريع'}</h2>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={handleSignOut} style={{ fontSize: '13px', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>تسجيل الخروج</button>
           </div>
        </header>

        <div style={{ padding: '60px 40px' }}>
          {activeTab === 'studio' ? (
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
               <h1 style={{ fontSize: '56px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.04em' }}>ابدأ <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>تجسيد</span> أفكارك</h1>
               <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px', fontSize: '18px' }}>اكتب ما تتخيله، واترك للذكاء الاصطناعي مهمة التنفيذ.</p>
               
               <div style={{
                 background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)',
                 display: 'flex', alignItems: 'center', boxShadow: '0 32px 64px rgba(0,0,0,0.4)'
               }}>
                 <input 
                   placeholder="صِف التصميم الذي تريده هنا..."
                   style={{ flex: 1, background: 'transparent', border: 'none', padding: '20px 24px', color: '#fff', fontSize: '18px', outline: 'none' }}
                   value={promptValue} onChange={e => setPromptValue(e.target.value)}
                 />
                 <button 
                   onClick={() => handleSubmitPrompt()}
                   disabled={isSubmitting}
                   style={{ padding: '16px 32px', borderRadius: '18px', background: 'linear-gradient(to right, #6366f1, #a855f7)', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                 >
                   {isSubmitting ? 'جارٍ البدء...' : <><Sparkles size={18} /> توليد الآن</>}
                 </button>
               </div>

               <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
                 {suggestions.map((s, i) => (
                   <button key={i} onClick={() => setPromptValue(s.prompt)} style={{ padding: '10px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>{s.label}</button>
                 ))}
               </div>
            </div>
          ) : (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 900 }}>مشاريعي ({projects.length})</h2>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', right: 12, top: 12, color: 'rgba(255,255,255,0.3)' }} size={16} />
                  <input placeholder="ابحث..." style={{ padding: '10px 40px 10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredProjects.map((p, i) => (
                  <div key={p.id} className="app-card" style={{
                    padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }} onClick={() => onOpenProject(p)}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: projectGradients[i % projectGradients.length], marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderOpen color="#fff" size={24} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{p.title}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>تم التحديث: {new Date(p.updated_at).toLocaleDateString('ar-EG')}</p>
                    <button onClick={(e) => handleDeleteProject(e, p.id)} style={{ marginTop: '16px', color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>حذف المشروع</button>
                  </div>
                ))}
                <div onClick={handleCreateProject} style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', cursor: 'pointer' }}>
                   <Plus size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                   <span style={{ fontSize: '14px', fontWeight: 700, opacity: 0.5 }}>مشروع جديد</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
