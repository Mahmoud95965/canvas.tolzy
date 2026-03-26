'use client';
import React from 'react'
import {
  Search, Plus, LayoutGrid, Sparkles, Mic, Globe, Settings,
  HelpCircle, Sun, Moon, Trash2, MoreVertical, LogOut, User,
  ChevronRight, FolderOpen, ArrowLeft, ArrowRight,
  Facebook, BookText, Menu, X, Zap, Star
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
  const [hoveredProject, setHoveredProject] = React.useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [promptFocused, setPromptFocused] = React.useState(false)
  
  const router = useRouter()

  React.useEffect(() => { fetchProjects() }, [])
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    return () => document.documentElement.removeAttribute('data-theme')
  }, [darkMode])

  const fetchProjects = async () => {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
    if (data) setProjects(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCreateProject = async () => {
    const title = prompt('اسم المشروع:')
    if (!title) return
    const { data } = await supabase.from('projects').insert([{ title, user_id: user.id }]).select()
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
    const { data: projectData, error } = await supabase.from('projects')
      .insert([{ title, user_id: user.id, content: { initial_prompt: finalPrompt } }]).select()
    setIsSubmitting(false)
    if (projectData) onOpenProject(projectData[0])
    else { console.error(error); alert('فشل في بدء المشروع.') }
  }

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const suggestions = [
    { label: 'لوحة تحكم SaaS', icon: LayoutGrid, prompt: 'قم بإنشاء لوحة تحكم SaaS حديثة مع شريط جانبي ورسوم بيانية ومظهر داكن' },
    { label: 'متجر إلكتروني', icon: Globe, prompt: 'صمم قسم بطل (Hero) لمتجر إلكتروني أنيق بلمسات فاخرة' },
    { label: 'موقع Portfolio', icon: Star, prompt: 'قم ببناء موقع أعمال شخصي للمطورين بتصميم زجاجي (Glassmorphism)' },
    { label: 'صفحة هبوط', icon: Zap, prompt: 'صمم صفحة هبوط احترافية لتطبيق ذكاء اصطناعي مع تأثيرات متحركة' },
  ]

  // Gradient colors for projects
  const projectGradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #06b6d4, #3b82f6)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
    'linear-gradient(135deg, #f59e0b, #84cc16)',
  ]

  const isDark = darkMode

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      background: isDark ? '#06060a' : '#f2f2f8',
      color: isDark ? '#f2f2f5' : '#111117',
      transition: 'background 0.5s ease, color 0.4s ease'
    }}>

      {/* ─── Ambient Background ─── */}
      {isDark && (
        <>
          <ParticlesBackground />
          <div className="ambient-orb" style={{ width: '70vw', height: '70vw', top: '-20%', left: '-15%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
          <div className="ambient-orb" style={{ width: '60vw', height: '60vw', bottom: '-25%', right: '-10%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)', animationDelay: '-6s' }} />
        </>
      )}

      {/* ─── Top Bar ─── */}
      <div className="anim-fade-in" style={{
        height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 40, position: 'relative',
        background: isDark ? 'rgba(6,6,10,0.7)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="desktop-hidden icon-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
            }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.03em' }}>TOLZY Canvas</span>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
              background: 'rgba(99,102,241,0.15)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.3)'
            }}>Beta</span>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span onClick={() => window.open('https://tolzy.me', '_blank')} style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '1px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', cursor: 'pointer', marginRight: '4px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#6366f1'}
            onMouseLeave={e => e.target.style.color = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
          >TOLZY</span>
          
          <Link href="/docs" passHref>
            <button className="icon-btn" title="دليل الاستخدام"><BookText size={18} /></button>
          </Link>
          <button className="icon-btn" title="Facebook" onClick={() => window.open('https://facebook.com', '_blank')}><Facebook size={18} /></button>
          
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}><MoreVertical size={18} /></button>
            {showMoreMenu && (
              <div className="anim-scale-in" style={{
                position: 'absolute', top: '44px', left: 0,
                width: '220px', padding: '8px', borderRadius: '16px', zIndex: 100,
                background: isDark ? 'rgba(12,12,18,0.95)' : 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(32px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}>
                {[['الأسئلة الشائعة', '/faq'], ['دليل كتابة الطلبات', '/docs'], ['إرسال ملاحظات', null], ['إشعار الخصوصية', '/privacy']].map(([label, href]) => (
                  <button key={label} onClick={() => { href ? router.push(href) : window.open('https://tolzy.me/contact', '_blank'); setShowMoreMenu(false); }} style={{ width: '100%', textAlign: 'right', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: isDark ? '#e0e0e8' : '#111', background: 'transparent', cursor: 'pointer', display: 'block', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >{label}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)', margin: '0 6px' }} />

          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title={isDark ? 'وضع فاتح' : 'وضع داكن'}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div style={{ position: 'relative' }}>
            <div onClick={() => setShowProfile(!showProfile)} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
            >
              {user?.email?.[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="anim-scale-in" style={{
                position: 'absolute', top: '48px', left: 0, width: '280px', padding: '16px', zIndex: 100,
                borderRadius: '20px', background: isDark ? 'rgba(12,12,18,0.95)' : 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(32px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px 12px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 800 }}>
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>ملفي الشخصي</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>إدارة بياناتك وحسابك</div>
                  </div>
                </div>
                <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', margin: '0 0 8px' }} />
                <button onClick={() => router.push('/account')} style={{ width: '100%', textAlign: 'right', padding: '10px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                ><User size={15} /> إعدادات الحساب</button>
                <button onClick={handleSignOut} style={{ width: '100%', textAlign: 'right', padding: '10px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#ef4444', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                ><LogOut size={15} /> تسجيل الخروج</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Layout ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        
        {/* ─── Sidebar Overlay (Mobile) ─── */}
        {isSidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 19, backdropFilter: 'blur(4px)' }} onClick={() => setIsSidebarOpen(false)} />}

        {/* ─── Sidebar ─── */}
        <div className={`responsive-sidebar ${isSidebarOpen ? 'sidebar-open' : ''} premium-scrollbar`} style={{
          width: '340px', display: 'flex', flexDirection: 'column', zIndex: 20,
          background: isDark ? 'rgba(8,8,12,0.9)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(32px)',
          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          {/* Sidebar Header */}
          <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutGrid size={16} color="var(--accent)" />
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>تصميماتك</span>
              {projects.length > 0 && (
                <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '99px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', fontWeight: 700 }}>{projects.length}</span>
              )}
            </div>
            <button onClick={handleCreateProject} style={{
              width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
              title="مشروع جديد"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '12px',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
              transition: 'border-color 0.2s'
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input placeholder="بحث في التصميمات..." style={{ flex: 1, fontSize: '13px', background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontFamily: 'inherit' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {/* Projects List */}
          <div className="premium-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: '64px', borderRadius: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.15}s` }} />
              ))
            ) : filteredProjects.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FolderOpen size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: '13px', margin: 0 }}>{searchQuery ? 'لم يتم العثور على تصميمات' : 'ابدأ بإنشاء تصميمك الأول!'}</p>
              </div>
            ) : filteredProjects.map((p, idx) => (
              <div key={p.id} className="project-card anim-fade-in" style={{ animationDelay: `${idx * 40}ms`, display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '14px', cursor: 'pointer', position: 'relative', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                onClick={() => onOpenProject(p)}
                onMouseEnter={() => setHoveredProject(p.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: projectGradients[idx % projectGradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  <LayoutGrid size={16} color="rgba(255,255,255,0.9)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{p.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(p.updated_at).toLocaleDateString('ar-EG')}</div>
                </div>
                {hoveredProject === p.id && (
                  <button onClick={e => handleDeleteProject(e, p.id)} style={{ width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', background: 'rgba(239,68,68,0.1)', flexShrink: 0, transition: 'all 0.15s' }} title="حذف"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Center ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', overflow: 'hidden' }}>

          <div style={{ maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            {/* Badge */}
            <div className="anim-fade-in delay-100" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '99px', background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '28px', color: '#818cf8', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'glowPulse 2s infinite' }} />
              TOLZY Copilot V2.0.1 — متصل ونشط
            </div>

            {/* Hero Title */}
            <h1 className="anim-fade-up delay-200" style={{
              fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em',
              lineHeight: 1.05, marginBottom: '20px',
              background: isDark
                ? 'linear-gradient(160deg, #ffffff 25%, rgba(255,255,255,0.6) 100%)'
                : 'linear-gradient(160deg, #111 25%, rgba(0,0,0,0.5) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              تخيّل واجهتك<br />
              <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>القادمة بحرية.</span>
            </h1>

            {/* Sub */}
            <p className="anim-fade-in delay-300" style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '550px', lineHeight: 1.7 }}>
              صِف ما تريد بناءه وشاهد TOLZY AI يصنعه في ثوانٍ — واجهات احترافية جاهزة للنشر.
            </p>

            {/* Prompt Box */}
            <div className="anim-fade-up delay-400" style={{
              width: '100%', borderRadius: '24px', padding: '20px 20px 14px',
              background: isDark ? 'rgba(14,14,20,0.7)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(32px)',
              border: `1px solid ${promptFocused ? 'rgba(99,102,241,0.5)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: promptFocused
                ? '0 0 0 4px rgba(99,102,241,0.12), 0 24px 80px rgba(0,0,0,0.4)'
                : isDark ? '0 24px 80px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.08)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}>
              <textarea
                placeholder="مثلاً: داشبورد تحليلات بلوحة بيانات تفاعلية ونمط مظلم فاخر..."
                style={{
                  width: '100%', minHeight: '90px', resize: 'none',
                  fontSize: '17px', background: 'transparent', border: 'none', outline: 'none',
                  lineHeight: 1.6, color: isDark ? '#f2f2f5' : '#111', fontFamily: 'inherit'
                }}
                value={promptValue}
                onChange={e => setPromptValue(e.target.value)}
                onFocus={() => setPromptFocused(true)}
                onBlur={() => setPromptFocused(false)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitPrompt() } }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Mic size={16} /></button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 12px', borderRadius: '99px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`, fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                    TOLZY Copilot V2.0
                  </div>
                </div>
                <button
                  disabled={isSubmitting || !promptValue.trim()}
                  onClick={handleSubmitPrompt}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '99px',
                    background: isSubmitting || !promptValue.trim() ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: '#fff', fontSize: '14px', fontWeight: 700, transition: 'all 0.25s var(--ease-spring)',
                    boxShadow: isSubmitting || !promptValue.trim() ? 'none' : '0 8px 24px rgba(99,102,241,0.4)',
                    opacity: isSubmitting || !promptValue.trim() ? 0.6 : 1,
                    cursor: isSubmitting || !promptValue.trim() ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={e => { if (!isSubmitting && promptValue.trim()) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.6)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}
                >
                  {isSubmitting ? (
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : <Sparkles size={16} />}
                  {isSubmitting ? 'جارٍ الإنشاء...' : 'إنشاء'}
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="anim-fade-in delay-600" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
              {suggestions.map((s, idx) => {
                const Icon = s.icon
                return (
                  <button key={idx} onClick={() => handleSubmitPrompt(null, s.prompt)} className="sugg-pill" style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                    borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                    color: 'var(--text-secondary)', cursor: 'pointer'
                  }}>
                    <Icon size={14} style={{ color: '#818cf8' }} />
                    {s.label}
                  </button>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
