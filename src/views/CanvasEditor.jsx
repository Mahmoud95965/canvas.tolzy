'use client';
import React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Download, Mic, Settings, LayoutGrid,
  Sparkles, Trash2, Loader2, User, Image as ImageIcon
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const CanvasEditor = ({ project, user, onBack }) => {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [promptValue, setPromptValue] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showProfile, setShowProfile] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(true)
  const [promptFocused, setPromptFocused] = React.useState(false)
  const [activeSidebarTab, setActiveSidebarTab] = React.useState('chat') // 'chat', 'history', 'settings'
  
  // Customization Settings
  const [settings, setSettings] = React.useState({
    style: 'cinematic',
    aspectRatio: '1:1',
    quality: 'standard',
    enhancePrompt: true
  })

  // Image Generation state
  const [generatedImage, setGeneratedImage] = React.useState(null)
  
  const hasInitRef = React.useRef(false)

  // Load project
  React.useEffect(() => {
    if (hasInitRef.current) return
    if (project?.content?.imageUrl) {
      setGeneratedImage(project.content.imageUrl)
      hasInitRef.current = true
    } else if (project?.content?.initial_prompt) {
      hasInitRef.current = true
      handleGenerateReactUI(null, project.content.initial_prompt)
    }
  }, [project])

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    return () => document.documentElement.removeAttribute('data-theme')
  }, [darkMode])

  const handleSave = async () => {
    if (!project) return
    setSaving(true)
    const { error } = await supabase.from('projects').update({ 
      updated_at: new Date().toISOString(), 
      content: { ...project.content, imageUrl: generatedImage } 
    }).eq('id', project.id)
    setSaving(false)
    if (error) alert(error.message)
  }

  const handleDeleteProject = async () => {
    if (!project || !confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (!error) onBack()
  }

  const handleDownload = () => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `tolzy-${project?.id || 'image'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClearImage = () => {
    if (!confirm('هل تريد مسح هذه الصورة والبدء من جديد؟')) return
    setGeneratedImage(null)
  }

  // AI Mode: Generate Image via /api/generate-image (reusing same route)
  const handleGenerateReactUI = async (e, forcedPrompt) => {
    if (e) e.preventDefault()
    const currentPrompt = forcedPrompt || promptValue
    if (!currentPrompt.trim()) return

    setIsSubmitting(true)
    try {
      // Append settings to prompt for better results
      const finalPrompt = `${currentPrompt} | Style: ${settings.style} | Aspect Ratio: ${settings.aspectRatio} | Quality: ${settings.quality}`
      
      const res = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, userId: user?.id }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `API failed: ${res.status}`)
      }
      const data = await res.json()
      setGeneratedImage(data.imageUrl)
      
      // Auto save after generation
      if (project) {
        await supabase.from('projects').update({ 
          content: { ...project.content, imageUrl: data.imageUrl }, 
          updated_at: new Date().toISOString() 
        }).eq('id', project.id)
      }
      
      if (!forcedPrompt) setPromptValue('')
    } catch (err) {
      console.error('Generate error:', err)
      alert('فشل في توليد الصورة: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDark = darkMode
  const borderBase = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: isDark ? '#05050a' : '#f0f0f5',
      color: isDark ? '#f2f2f5' : '#111', transition: 'all 0.3s', direction: 'rtl'
    }}>

      {/* ════ TOP BAR — Glass ════ */}
      <div style={{
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 50, position: 'relative',
        background: isDark ? 'rgba(5,5,10,0.6)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(28px)',
        borderBottom: `1px solid ${borderBase}`,
      }}>
        {/* Left: Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{
            width: 34, height: 34, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#fff' : '#000'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.02em' }}>{project?.title || 'مشروع بدون عنوان'}</div>
            {saving && <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '1px' }}>● جاري الحفظ...</div>}
          </div>
        </div>

        {/* Center: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 26, height: 26, borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
            <Sparkles size={13} color="#fff" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', opacity: 0.9 }}>TOLZY Image</span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handleDeleteProject} style={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(239,68,68,0.6)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.6)'} title="حذف المشروع"><Trash2 size={15} /></button>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 12px', borderRadius: '10px',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: 'inherit',
            fontSize: '12px', fontWeight: 700, border: `1px solid ${borderBase}`, transition: 'all 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}>
            {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />} حفظ
          </button>
          <button onClick={handleDownload} style={{
            display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '99px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff',
            fontSize: '12px', fontWeight: 700, boxShadow: '0 4px 16px rgba(99,102,241,0.3)', transition: 'all 0.2s'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)'; }}>
            <Download size={13} /> تحميل
          </button>
          <div onClick={() => setShowProfile(!showProfile)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          {showProfile && (
            <div className="anim-scale-in" style={{ position: 'absolute', top: '60px', left: '16px', width: '220px', padding: '12px', borderRadius: '16px', background: isDark ? 'rgba(10,10,16,0.96)' : 'rgba(255,255,255,0.98)', backdropFilter: 'blur(32px)', border: `1px solid ${borderBase}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 100 }}>
              <button onClick={() => router.push('/account')} style={{ width: '100%', textAlign: 'right', padding: '9px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={14} /> إعدادات الحساب</button>
            </div>
          )}
        </div>
      </div>

      {/* ════ WORKSPACE ════ */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        {/* ─── Left Sidebar: Chat & History (28%) ─── */}
        <div style={{
          width: '320px', display: 'flex', flexDirection: 'column',
          borderLeft: `1px solid ${borderBase}`, background: isDark ? 'rgba(8,8,12,0.4)' : 'rgba(255,255,255,0.4)',
          position: 'relative', zIndex: 20
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', padding: '12px', gap: '8px', borderBottom: `1px solid ${borderBase}` }}>
            {[['chat', Sparkles, 'دردشة'], ['history', LayoutGrid, 'سجل']].map(([id, Icon, label]) => (
              <button key={id} onClick={() => setActiveSidebarTab(id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: activeSidebarTab === id ? 'rgba(99,102,241,0.1)' : 'transparent', color: activeSidebarTab === id ? '#818cf8' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="premium-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeSidebarTab === 'chat' ? (
              <>
                {!generatedImage && !isSubmitting && (
                  <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.6 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Sparkles size={32} color="#6366f1" />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800 }}>المساعد الذكي جاهز</div>
                    <p style={{ fontSize: '12px', marginTop: '8px', lineHeight: 1.5 }}>أخبرني بما تريد توليده أو التعديل الذي ترغب به في الصورة الحالية.</p>
                  </div>
                )}

                {isSubmitting && (
                  <div className="anim-scale-in" style={{ padding: '16px', background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', borderRadius: '16px', border: `1px solid rgba(99,102,241,0.2)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <Loader2 size={16} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#818cf8' }}>جارٍ التحويل...</span>
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{promptValue}</div>
                  </div>
                )}
                
                {generatedImage && !isSubmitting && project?.content?.initial_prompt && (
                  <div className="anim-fade-in" style={{ padding: '16px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '16px', border: `1px solid ${borderBase}` }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={10} /> الطلب:</div>
                    <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>{project.content.initial_prompt}</div>
                  </div>
                )}
              </>
            ) : (
               <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.5 }}>
                 <p style={{ fontSize: '12px' }}>لا توجد سجلات أخرى لهذا الطلب حالياً.</p>
               </div>
            )}
          </div>

          {/* Prompt Input Area */}
          <div style={{ padding: '20px', borderTop: `1px solid ${borderBase}`, background: isDark ? 'rgba(10,10,16,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
            <div style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              borderRadius: '20px',
              border: `1px solid ${promptFocused ? 'rgba(99,102,241,0.5)' : borderBase}`,
              padding: '12px 16px', transition: 'all 0.3s',
              position: 'relative', overflow: 'hidden'
            }}>
              <textarea
                placeholder="اطلب تعديلاً أو صورة جديدة..."
                style={{ width: '100%', minHeight: '60px', maxHeight: '180px', resize: 'none', padding: '4px 0', fontSize: '14px', background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontFamily: 'inherit', lineHeight: 1.6 }}
                value={promptValue}
                onChange={e => setPromptValue(e.target.value)}
                onFocus={() => setPromptFocused(true)}
                onBlur={() => setPromptFocused(false)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerateReactUI(e) } }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', marginTop: '4px', borderTop: `1px solid ${borderBase}` }}>
                <Mic size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => alert('ميزة الإدخال الصوتي ستتوفر قريباً!')} />
                <button 
                  onClick={handleGenerateReactUI} 
                  disabled={isSubmitting || !promptValue.trim()} 
                  style={{ 
                    width: 32, height: 32, borderRadius: '12px', 
                    background: isSubmitting || !promptValue.trim() ? 'rgba(99,102,241,0.2)' : 'var(--accent)', 
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    transition: 'all 0.2s', opacity: isSubmitting || !promptValue.trim() ? 0.5 : 1, 
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ArrowRight size={16} />}
                </button>
              </div>

              {/* Sidebar Prompt Loading Overlay */}
              {isSubmitting && (
                <div style={{ position: 'absolute', inset: 0, background: isDark ? 'rgba(10,10,16,0.6)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                   <div className="spinner-small" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Center Display (Workspace) ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: isDark ? '#000' : '#f0f0f5', padding: '40px' }}>
          {!generatedImage && !isSubmitting ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: 100, height: 100, borderRadius: '32px', background: 'rgba(99,102,241,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99,102,241,0.1)' }}>
                <ImageIcon size={40} color="#6366f1" style={{ opacity: 0.3 }} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, opacity: 0.4 }}>انتظار الطلب الأول...</div>
            </div>
          ) : (
             <div className="workspace-image-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
               {generatedImage ? (
                 <>
                   <img src={generatedImage} alt="AI Generated" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                   
                    {/* Tool Overlay */}
                    <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', gap: '8px', zIndex: 10 }}>
                      <button onClick={() => {}} className="icon-btn-large" style={{ backdropFilter: 'blur(16px)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} title="الإعدادات">
                        <Settings size={18} />
                      </button>
                      <button onClick={handleDownload} className="icon-btn-large" style={{ backdropFilter: 'blur(16px)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} title="تحميل">
                        <Download size={18} />
                      </button>
                      <button onClick={handleClearImage} className="icon-btn-large" style={{ backdropFilter: 'blur(16px)', background: 'rgba(239,68,68,0.3)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }} title="مسح">
                        <Trash2 size={18} />
                      </button>
                    </div>
                 </>
               ) : null}
               
               {isSubmitting && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '32px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(30px)', zIndex: 100 }}>
                  <div className="spinner-large" />
                  <div className="shimmer-text" style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>جارٍ تجسيد خيالك...</div>
                </div>
               )}
             </div>
          )}
        </div>

        {/* ─── Right Sidebar: Customization (240px) ─── */}
        <div style={{
          width: '280px', display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${borderBase}`, background: isDark ? 'rgba(8,8,12,0.4)' : 'rgba(255,255,255,0.4)',
          position: 'relative', zIndex: 20, padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={18} color="#6366f1" /> تخصيص الصور
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Aspect Ratio */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>نسبة العرض إلى الارتفاع</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['1:1', '16:9', '4:5', '9:16', '3:2', '2:3'].map(ratio => (
                  <button key={ratio} onClick={() => setSettings({...settings, aspectRatio: ratio})} style={{
                    padding: '10px 0', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                    background: settings.aspectRatio === ratio ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: settings.aspectRatio === ratio ? '#818cf8' : 'var(--text-muted)',
                    border: `1px solid ${settings.aspectRatio === ratio ? 'rgba(99,102,241,0.3)' : borderBase}`,
                    transition: 'all 0.2s'
                  }}>{ratio}</button>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>النمط البصري</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['النظام الافتراضي', 'صورة سينمائية', 'فن رقمي', 'تصوير فوتوغرافي', 'رسم زيتي', 'واقعي جداً'].map(style => (
                  <button key={style} onClick={() => setSettings({...settings, style: style})} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                    background: settings.style === style ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: settings.style === style ? '#818cf8' : 'var(--text-primary)',
                    border: `1px solid ${settings.style === style ? 'rgba(99,102,241,0.2)' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}>
                    {style}
                    {settings.style === style && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ paddingTop: '12px', borderTop: `1px solid ${borderBase}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>تحسين الأوامر آلياً</span>
                <div onClick={() => setSettings({...settings, enhancePrompt: !settings.enhancePrompt})} style={{ width: 36, height: 20, borderRadius: 20, background: settings.enhancePrompt ? '#6366f1' : 'rgba(0,0,0,0.2)', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ position: 'absolute', top: 3, left: settings.enhancePrompt ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: '0.3s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>وضع الدقة العالية</span>
                <div onClick={() => setSettings({...settings, quality: settings.quality === 'hd' ? 'standard' : 'hd'})} style={{ width: 36, height: 20, borderRadius: 20, background: settings.quality === 'hd' ? '#6366f1' : 'rgba(0,0,0,0.2)', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ position: 'absolute', top: 3, left: settings.quality === 'hd' ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: '0.3s' }} />
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ flex: 1 }} />
          
          <button 
            onClick={() => handleGenerateReactUI(null, project?.content?.initial_prompt || promptValue)}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            <Sparkles size={16} /> تطبيق الإعدادات
          </button>
        </div>
      </div>
    </div>
  )
}

export default CanvasEditor
