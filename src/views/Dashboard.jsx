'use client';
import React from 'react'
import { 
  Search, Plus, LayoutGrid, Sparkles, Mic, Globe, Settings,
  HelpCircle, Sun, Moon, Trash2, MoreVertical, LogOut, User,
  ChevronRight, FolderOpen, ArrowLeft, ArrowRight,
  Facebook, BookText, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import ParticlesBackground from '../components/ParticlesBackground'
import SpotlightContainer from '../components/SpotlightContainer'

const Dashboard = ({ user, onOpenProject }) => {
  const [projects, setProjects] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [promptValue, setPromptValue] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showProfile, setShowProfile] = React.useState(false)
  const [showMoreMenu, setShowMoreMenu] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [hoveredProject, setHoveredProject] = React.useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  
  const router = useRouter()

  React.useEffect(() => { fetchProjects() }, [])

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    return () => document.documentElement.removeAttribute('data-theme')
  }, [darkMode])

  const fetchProjects = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (data) setProjects(data)
    setLoading(false)
  }

  const handleSignOut = async () => { await supabase.auth.signOut() }

  const handleCreateProject = async () => {
    const title = prompt('اسم المشروع:')
    if (!title) return
    const { data } = await supabase
      .from('projects')
      .insert([{ title, user_id: user.id }])
      .select()
    if (data) { setProjects(prev => [data[0], ...prev]); onOpenProject(data[0]) }
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
    setIsSubmitting(true)
    const title = finalPrompt.split(' ').slice(0, 5).join(' ') + '...'
    const { data: projectData, error } = await supabase
      .from('projects')
      .insert([{ title, user_id: user.id, content: { initial_prompt: finalPrompt } }])
      .select()
    setIsSubmitting(false)
    if (projectData) onOpenProject(projectData[0])
    else { console.error(error); alert('فشل في بدء المشروع.') }
  }

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const suggestions = [
    { label: 'لوحة تحكم SaaS', prompt: 'قم بإنشاء لوحة تحكم SaaS حديثة مع شريط جانبي ورسوم بيانية ومظهر داكن' },
    { label: 'واجهة متجر الكتروني', prompt: 'صمم قسم بطل (Hero) لمتجر إلكتروني أنيق بلمسات فاخرة' },
    { label: 'موقع شخصي (Portfolio)', prompt: 'قم ببناء موقع أعمال شخصي للمطورين بتصميم زجاجي (Glassmorphism)' },
  ]

  return (
    <div style={{
      ...ds.container,
      backgroundColor: darkMode ? '#070709' : '#f8f9fc',
      color: darkMode ? '#f0f0f2' : '#111113',
    }}>
      {/* Ambient Orbs */}
      {darkMode && (
        <>
          <div className="ambient-glow" style={{ top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
          <div className="ambient-glow" style={{ bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />
        </>
      )}

      {/* ── Top Bar ── */}
      <div className="responsive-topbar" style={{
        ...ds.topBar,
        background: darkMode ? 'rgba(10,10,12,0.6)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <button className="desktop-hidden" onClick={() => setIsSidebarOpen(true)} style={ds.actionIcon}>
            <Menu size={20} color="var(--text-primary)" />
          </button>
          <div style={ds.logo}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <span style={ds.logoText}>TOLZY Canvas</span>
            <div style={ds.betaBadge}>Beta</div>
          </div>
        </div>
        
        <div style={ds.topBarRight}>
          {/* Top Bar Icons */}
          <div style={{display:'flex', alignItems:'center', gap:'12px', marginLeft: '16px'}}>
            <span 
              onClick={() => window.open('https://tolzy.me', '_blank')}
              style={{fontSize:'16px', fontWeight:900, letterSpacing:'1px', marginRight:'8px', color:'var(--text-primary)', cursor:'pointer', transition:'color 0.2s', ':hover':{color:'#6366f1'}}}
            >TOLZY</span>
            <Link href="/docs" passHref>
              <button style={ds.actionIcon} title="دليل الاستخدام"><BookText size={18} /></button>
            </Link>
            <button style={ds.actionIcon} title="Facebook" onClick={() => window.open('https://facebook.com', '_blank')}><Facebook size={18} /></button>
            
            {/* More Menu */}
            <div style={{position:'relative'}}>
              <button style={ds.actionIcon} onClick={() => setShowMoreMenu(!showMoreMenu)}>
                <MoreVertical size={18} />
              </button>
              {showMoreMenu && (
                <div style={{
                  ...ds.profileDrop,
                  width: '220px',
                  background: darkMode ? 'rgba(20,20,24,0.95)' : 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(32px)',
                  top: '40px', left: '0', right: 'auto',
                  padding: '8px'
                }}>
                  <button onClick={() => router.push('/faq')} style={ds.dropdownItem}>الأسئلة الشائعة</button>
                  <button onClick={() => window.open('https://tolzy.me/community', '_blank')} style={ds.dropdownItem}>المنتدى</button>
                  <button onClick={() => router.push('/docs')} style={ds.dropdownItem}>دليل كتابة الطلبات</button>
                  <button onClick={() => window.open('https://tolzy.me/contact', '_blank')} style={ds.dropdownItem}>إرسال ملاحظات</button>
                  <button onClick={() => router.push('/privacy')} style={ds.dropdownItem}>إشعار الخصوصية</button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{width:'1px',height:'20px',background:'var(--border-color)', margin:'0 4px'}}></div>

          <button onClick={() => setDarkMode(!darkMode)} style={ds.themeBtn} title={darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div style={{position:'relative'}}>
            <div style={ds.avatar} onClick={() => setShowProfile(!showProfile)}>
              {user?.email?.[0].toUpperCase()}
            </div>
            
            {showProfile && (
              <div style={{
                ...ds.profileDrop,
                background: darkMode ? 'rgba(20,20,24,0.95)' : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(32px)',
                left: '0', right: 'auto'
              }}>
                <div style={ds.profileHead}>
                  <div style={ds.profileAvatar}>{user?.email?.[0].toUpperCase()}</div>
                  <div>
                    <div style={{fontSize:'14px',fontWeight:700}}>ملفي الشخصي</div>
                    <div style={{fontSize:'11px',color:'var(--text-muted)', marginTop:'2px'}}>إدارة بياناتك وحسابك</div>
                  </div>
                </div>
                <div style={{height:'1px',background:'var(--border-color)', margin:'4px 0'}}></div>
                <button style={ds.dropdownItem} onClick={() => router.push('/account')}><User size={15}/> <span>إعدادات الحساب</span></button>
                <button onClick={handleSignOut} style={{...ds.dropdownItem, color: '#ef4444'}}>
                  <LogOut size={15} />
                  <span>تسجيل الخروج من Tolzy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={ds.mainContent}>
        {/* ── Sidebar (Playlist / Projects) ── */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}
        <div className={`responsive-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{
          ...ds.sidebar,
          background: darkMode ? 'rgba(14,14,16,0.95)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        }}>
          <div style={ds.sidebarHeader}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <LayoutGrid size={18} color="var(--text-primary)" />
              <span style={{fontSize:'14px',fontWeight:600}}>تصميماتك</span>
            </div>
            <button onClick={handleCreateProject} style={ds.iconBtn} title="مشروع جديد">
              <Plus size={16} />
            </button>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{...ds.searchBox, background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}}>
              <Search size={14} style={{color:'var(--text-muted)'}} />
              <input 
                placeholder="البحث في التصميمات..." 
                style={ds.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={ds.projectList} className="premium-scrollbar">
            {loading ? (
              <div style={{padding:'20px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px'}}>جاري تحميل مساحة العمل...</div>
            ) : filteredProjects.length === 0 ? (
              <div style={{padding:'20px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px'}}>
                {searchQuery ? 'لم يتم العثور على تصميمات' : 'لا توجد تصميمات حتى الآن'}
              </div>
            ) : filteredProjects.map(p => (
              <div 
                key={p.id} 
                className="project-card"
                style={ds.projectItem} 
                onClick={() => onOpenProject(p)}
                onMouseEnter={() => setHoveredProject(p.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div style={{...ds.projectThumb, background: darkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)'}}>
                  <LayoutGrid size={16} color="#6366f1" />
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={ds.projectTitle}>{p.title}</div>
                  <div style={ds.projectDate}>آخر تعديل {new Date(p.updated_at).toLocaleDateString()}</div>
                </div>
                {hoveredProject === p.id && (
                  <button 
                    onClick={(e) => handleDeleteProject(e, p.id)} 
                    style={ds.deleteBtn}
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Center ── */}
        <div className="responsive-center" style={ds.center}>
          {darkMode && <ParticlesBackground />}
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              padding: '6px 16px', borderRadius: '99px',
              background: darkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)', marginBottom: '32px',
              color: '#6366f1', fontSize: '12px', fontWeight: 600
            }}>
              <Sparkles size={14} />
              تقديم TOLZY 2.0.1
            </div>

            <h1 className="responsive-hero-text" style={ds.heroText}>تخيل واجهة المستخدم القادمة بحرية.</h1>
            <p className="responsive-hero-sub" style={{fontSize:'18px',color:'var(--text-secondary)',marginBottom:'48px',textAlign:'center',maxWidth:'600px',lineHeight:1.6}}>
              صف ما تريد بناءه وشاهد Tolzy AI يقوم بإنشائه في ثوانٍ معدودة. استمتع بتجربة تصميم لا مثيل لها.
            </p>

            <div className="responsive-prompt-box" style={{
              ...ds.promptBox,
              background: darkMode ? 'rgba(20,20,22,0.6)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(32px) saturate(200%)',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              boxShadow: darkMode ? '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset' : '0 24px 80px rgba(0,0,0,0.08)',
            }}>
              <textarea 
                placeholder="مثلاً: صفحة رئيسية جذابة لعلامة تجارية عصرية للعطور..."
                style={{...ds.promptInput, color: darkMode ? '#fff' : '#111'}}
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitPrompt() }
                }}
              />
              <div style={ds.promptFooter}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <button style={ds.utilBtn}><Mic size={18} /></button>
                  <div style={ds.modelTag}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px #22c55e'}}></div>
                    <span style={{color: darkMode ? '#fff' : '#111'}}>TOLZY Copilot V2.0</span>
                  </div>
                </div>
                <button 
                  disabled={isSubmitting || !promptValue.trim()} 
                  onClick={(e) => handleSubmitPrompt(e)} 
                  style={{
                    ...ds.sendBtn,
                    opacity: isSubmitting || !promptValue.trim() ? 0.5 : 1,
                    transform: isSubmitting || !promptValue.trim() ? 'scale(0.95)' : 'scale(1)',
                  }}
                >
                  {isSubmitting ? (
                    <div style={{width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite'}} />
                  ) : (
                    <>
                      <span>إنشاء</span>
                      <ArrowLeft size={16} /> {/* ArrowLeft for RTL */}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={ds.suggestionsWrapper}>
              {suggestions.map((s, idx) => (
                <button key={idx} onClick={() => handleSubmitPrompt(null, s.prompt)} style={{
                  ...ds.suggPill,
                  background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}>
                  <span style={{color:'var(--text-primary)'}}>{s.label}</span>
                  <ChevronRight size={14} style={{color:'var(--text-muted)'}} />
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

const ds = {
  container: {
    width:'100vw',height:'100vh',display:'flex',flexDirection:'column',
    transition:'background-color 0.4s ease, color 0.4s ease',
    position: 'relative', overflow: 'hidden'
  },
  topBar: {
    height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'0 24px',zIndex:40, position: 'relative'
  },
  actionIcon: {
    width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',
    justifyContent:'center',color:'var(--text-secondary)',transition:'all 0.2s',cursor:'pointer'
  },
  dropdownItem: {
    width:'100%',textAlign:'right',padding:'10px 14px',borderRadius:'10px',
    fontSize:'13px',fontWeight:600,color:'var(--text-primary)',
    background:'transparent',cursor:'pointer',transition:'background 0.2s, transform 0.1s',
    display: 'flex', alignItems: 'center', gap: '10px'
  },
  betaBadge: {
    fontSize: '10px', fontWeight: 700, background: 'rgba(99,102,241,0.15)',
    color: '#6366f1', padding: '2px 8px', borderRadius: '99px', marginRight: '6px'
  },
  topBarRight: {display:'flex',alignItems:'center',gap:'12px',position:'relative'},
  themeBtn: {
    width:'36px',height:'36px',borderRadius:'50%',display:'flex',alignItems:'center',
    justifyContent:'center',color:'var(--text-secondary)',transition:'all 0.2s',
  },
  avatar: {
    width:'36px',height:'36px',borderRadius:'50%',
    background:'linear-gradient(135deg, #6366f1, #a855f7)',
    display:'flex',alignItems:'center',justifyContent:'center',
    color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'transform 0.2s'
  },
  profileDrop: {
    position:'absolute',top:'52px',width:'280px',
    borderRadius:'20px',border:'1px solid var(--border-color)',
    padding:'16px',boxShadow:'0 20px 60px rgba(0,0,0,0.4)',zIndex:100,
    display:'flex',flexDirection:'column',gap:'8px',
    animation: 'slideUp 0.2s ease-out'
  },
  profileHead: {display:'flex',alignItems:'center',gap:'14px', padding:'0 8px 8px 8px'},
  profileAvatar: {
    width:'44px',height:'44px',borderRadius:'50%',
    background:'linear-gradient(135deg, #6366f1, #a855f7)',
    display:'flex',alignItems:'center',justifyContent:'center',
    color:'#fff',fontSize:'18px',fontWeight:700,
  },
  logo: {display:'flex',alignItems:'center',gap:'12px'},
  logoText: {fontSize:'18px',fontWeight:700, letterSpacing: '-0.02em', color: 'var(--text-primary)'},
  mainContent: {flex:1,display:'flex',overflow:'hidden', position: 'relative', zIndex: 10},
  center: {
    flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    padding:'0 40px', position: 'relative'
  },
  heroText: {
    fontSize:'64px',fontWeight:800,letterSpacing:'-0.03em',
    background:'linear-gradient(135deg, var(--text-primary) 30%, var(--text-muted) 100%)',
    WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
    marginBottom:'16px', textAlign: 'center'
  },
  promptBox: {
    width:'100%',borderRadius:'24px',
    border:'1px solid',padding:'24px', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
  promptInput: {
    width:'100%',minHeight:'100px',resize:'none',fontSize:'18px',
    background:'transparent',border:'none',outline:'none',lineHeight:1.6,
  },
  promptFooter: {
    display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'16px',
  },
  utilBtn: {
    width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', background: 'var(--pill-bg)', transition: 'all 0.2s'
  },
  modelTag: {
    display:'flex',alignItems:'center',gap:'8px',
    padding:'6px 14px',borderRadius:'99px',
    fontSize:'13px',fontWeight:600,
    background: 'var(--pill-bg)', border: '1px solid var(--border-color)'
  },
  sendBtn: {
    padding: '0 24px', height: '44px', borderRadius: '99px',
    background:'linear-gradient(135deg, #6366f1, #a855f7)',color:'#fff',
    display:'flex',alignItems:'center',justifyContent:'center', gap: '8px',
    fontSize: '14px', fontWeight: 600,
    transition:'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
  },
  suggestionsWrapper: {display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center',marginTop:'32px'},
  suggPill: {
    display:'flex',alignItems:'center',gap:'8px',padding:'12px 20px',
    borderRadius:'16px',border:'1px solid',fontSize:'14px',
    cursor:'pointer',transition:'all 0.2s', fontWeight: 500
  },
  sidebar: {
    width:'340px',display:'flex',flexDirection:'column', zIndex: 20
  },
  sidebarHeader: {
    display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'24px 24px 12px 24px',
  },
  iconBtn: {
    width: '32px', height: '32px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-primary)', background: 'var(--pill-bg)',
    transition: 'all 0.2s'
  },
  searchBox: {
    display:'flex',alignItems:'center',gap:'10px',
    padding:'10px 14px',borderRadius:'12px',
  },
  searchInput: {
    flex:1,fontSize:'13px',background:'transparent',border:'none',outline:'none',
    color:'inherit',
  },
  projectList: {flex:1,overflowY:'auto',padding:'0 16px 24px 16px', display: 'flex', flexDirection: 'column', gap: '8px'},
  projectItem: {
    display:'flex',alignItems:'center',gap:'14px',padding:'12px',
    borderRadius:'16px',cursor:'pointer', position: 'relative',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.2s', margin: '4px 0'
  },
  projectThumb: {
    width:'44px',height:'44px',borderRadius:'12px',
    display:'flex',alignItems:'center',justifyContent:'center',
    flexShrink:0,
  },
  projectTitle: {fontSize:'14px',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap', marginBottom: '4px'},
  projectDate: {fontSize:'11px',color:'var(--text-muted)'},
  deleteBtn: {
    width:'32px',height:'32px',borderRadius:'8px',
    display:'flex',alignItems:'center',justifyContent:'center',
    color:'var(--error-color)',transition:'all 0.15s',flexShrink:0,
    background: 'rgba(239, 68, 68, 0.1)'
  },
}

export default Dashboard
