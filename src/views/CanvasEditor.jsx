'use client';
import React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Download, Plus, Mic, Sun, Moon,
  LayoutGrid, MousePointer2, Hand, Layers,
  Sparkles, CheckCircle2, AlertCircle, X, GripVertical,
  ZoomIn, ZoomOut, RotateCcw, Trash2, Copy, Loader2,
  Play, User, Monitor, Type, Image, Code, Eye
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import MouseTrail from '../components/MouseTrail'

const CanvasEditor = ({ project, user, onBack }) => {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [promptValue, setPromptValue] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showProfile, setShowProfile] = React.useState(false)
  const [logs, setLogs] = React.useState([])
  const [darkMode, setDarkMode] = React.useState(true)
  const [activeTool, setActiveTool] = React.useState('pointer')
  const [hoveredTool, setHoveredTool] = React.useState(null)
  const [agentLogOpen, setAgentLogOpen] = React.useState(true)
  const [promptFocused, setPromptFocused] = React.useState(false)

  // Canvas state
  const [zoom, setZoom] = React.useState(70)
  const [canvasOffset, setCanvasOffset] = React.useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = React.useState(false)
  const panStart = React.useRef({ x: 0, y: 0 })
  const offsetStart = React.useRef({ x: 0, y: 0 })
  const canvasRef = React.useRef(null)

  // Frames
  const [frames, setFrames] = React.useState([])
  const [selectedFrame, setSelectedFrame] = React.useState(null)
  const [draggingFrame, setDraggingFrame] = React.useState(null)
  const dragStart = React.useRef({ x: 0, y: 0, fx: 0, fy: 0 })
  const [resizingFrame, setResizingFrame] = React.useState(null)
  const [resizeType, setResizeType] = React.useState(null)
  const resizeStart = React.useRef({ x: 0, y: 0, fw: 0, fh: 0 })
  const [contextMenu, setContextMenu] = React.useState(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const hasInitRef = React.useRef(false)

  // Load project
  React.useEffect(() => {
    if (hasInitRef.current) return
    if (project?.content?.frames) { setFrames(project.content.frames); hasInitRef.current = true }
    else if (project?.content?.code) { setFrames([{ id: 'init', title: project.title || 'صفحة 1', code: project.content.code, x: 100, y: 100, w: 1200, h: 800 }]); hasInitRef.current = true }
    else if (project?.content?.initial_prompt) { hasInitRef.current = true; handleSubmitPrompt(null, project.content.initial_prompt) }
  }, [project])

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    return () => document.documentElement.removeAttribute('data-theme')
  }, [darkMode])

  // Canvas pan
  const onCanvasMouseDown = (e) => {
    if (contextMenu) setContextMenu(null)
    if (activeTool === 'hand' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY }
      offsetStart.current = { ...canvasOffset }
      e.preventDefault()
    }
  }
  const onCanvasMouseMove = (e) => {
    if (isPanning) setCanvasOffset({ x: offsetStart.current.x + (e.clientX - panStart.current.x), y: offsetStart.current.y + (e.clientY - panStart.current.y) })
    if (draggingFrame) {
      const scale = zoom / 100
      setFrames(prev => prev.map(f => f.id === draggingFrame ? { ...f, x: dragStart.current.fx + (e.clientX - dragStart.current.x) / scale, y: dragStart.current.fy + (e.clientY - dragStart.current.y) / scale } : f))
    }
    if (resizingFrame) {
      const scale = zoom / 100
      setFrames(prev => prev.map(f => {
        if (f.id !== resizingFrame) return f
        return {
          ...f,
          w: resizeType === 'right' || resizeType === 'corner' ? Math.max(200, resizeStart.current.fw + (e.clientX - resizeStart.current.x) / scale) : f.w,
          h: resizeType === 'bottom' || resizeType === 'corner' ? Math.max(200, resizeStart.current.fh + (e.clientY - resizeStart.current.y) / scale) : f.h,
        }
      }))
    }
  }
  const onCanvasMouseUp = () => {
    setIsPanning(false)
    if (draggingFrame) { setDraggingFrame(null); autoSave() }
    if (resizingFrame) { setResizingFrame(null); setResizeType(null); autoSave() }
  }

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(prev => Math.max(20, Math.min(200, prev - e.deltaY * 0.1))) }
    else setCanvasOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }))
  }

  const startDragFrame = (e, frameId) => {
    if (activeTool !== 'pointer') return
    if (e.button === 2) return
    e.stopPropagation()
    const frame = frames.find(f => f.id === frameId)
    if (!frame) return
    setDraggingFrame(frameId); setSelectedFrame(frameId)
    dragStart.current = { x: e.clientX, y: e.clientY, fx: frame.x, fy: frame.y }
  }

  const startResize = (e, frameId, type) => {
    if (activeTool !== 'pointer') return
    e.stopPropagation()
    const frame = frames.find(f => f.id === frameId)
    if (!frame) return
    setResizingFrame(frameId); setResizeType(type)
    resizeStart.current = { x: e.clientX, y: e.clientY, fw: frame.w, fh: frame.h }
  }

  const deleteFrame = (frameId) => { setFrames(prev => prev.filter(f => f.id !== frameId)); if (selectedFrame === frameId) setSelectedFrame(null); autoSave() }
  const handleContextMenu = (e, frame) => { e.preventDefault(); e.stopPropagation(); setSelectedFrame(frame.id); setContextMenu({ x: e.clientX, y: e.clientY, frame }) }
  const downloadFile = (frame) => { const blob = new Blob([frame.code], { type: 'text/html;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${frame.title || 'تصميم'}.html`; link.click() }
  const handleZoomIn = () => setZoom(p => Math.min(p + 10, 200))
  const handleZoomOut = () => setZoom(p => Math.max(p - 10, 20))
  const handleZoomReset = () => { setZoom(70); setCanvasOffset({ x: 0, y: 0 }) }

  const autoSave = async () => {
    if (!project) return
    await supabase.from('projects').update({ content: { ...project.content, frames }, updated_at: new Date().toISOString() }).eq('id', project.id)
  }

  const handleSave = async () => {
    if (!project) return
    setSaving(true)
    const { error } = await supabase.from('projects').update({ updated_at: new Date().toISOString(), content: { ...project.content, frames } }).eq('id', project.id)
    setSaving(false)
    if (error) alert(error.message)
  }

  const handleDeleteProject = async () => {
    if (!project || !confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (!error) onBack()
  }

  const handleCopyCode = () => {
    const sel = frames.find(f => f.id === selectedFrame)
    if (sel) { navigator.clipboard.writeText(sel.code); alert('تم النسخ!') }
  }

  // AI Prompt with streaming thinking
  const handleSubmitPrompt = async (e, forcedPrompt) => {
    if (e) e.preventDefault()
    const currentPrompt = forcedPrompt || promptValue
    if (!currentPrompt.trim()) return

    setIsSubmitting(true)
    const newLogId = Date.now() + Math.random()
    const frameId = 'frame_' + Date.now()
    const lastFrame = frames.length > 0 ? frames[frames.length - 1] : null
    const newX = lastFrame ? lastFrame.x + lastFrame.w + 80 : 120
    const newY = lastFrame ? lastFrame.y : 120

    setLogs(prev => [{ id: newLogId, title: currentPrompt.slice(0, 45), thinkingContent: '', textContent: '', status: 'loading' }, ...prev])

    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: currentPrompt }) })
      if (!response.ok) throw new Error('API failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = '', fullContent = '', fullReasoning = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const d = line.slice(6).trim()
          if (d === '[DONE]') continue
          try {
            const parsed = JSON.parse(d)
            const delta = parsed.choices?.[0]?.delta
            if (delta?.reasoning) {
              fullReasoning += delta.reasoning
              setLogs(prev => prev.map(l => l.id === newLogId ? { ...l, thinkingContent: fullReasoning } : l))
            }
            if (delta?.content) fullContent += delta.content

            let displayThinking = fullReasoning
            let displayText = fullContent
            if (!fullReasoning && fullContent.includes('<think>')) {
              const match = fullContent.match(/<think>([\s\S]*?)(?:<\/think>|$)/)
              if (match) { displayThinking = match[1]; displayText = fullContent.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim() }
            }
            const textNoCode = displayText.replace(/```[\s\S]*?(?:```|$)/g, '').trim()
            setLogs(prev => prev.map(l => l.id === newLogId ? { ...l, thinkingContent: displayThinking, textContent: textNoCode } : l))
          } catch { /* ignore parse errors */ }
        }
      }

      let mainContent = fullContent
      if (!fullReasoning) {
        const m = fullContent.match(/<think>([\s\S]*?)<\/think>/)
        if (m) { fullReasoning = m[1].trim(); mainContent = fullContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim() }
      }
      const codeMatch = mainContent.match(/```(?:html|jsx|javascript|css)?([\s\S]*?)```/)
      const code = codeMatch ? codeMatch[1].trim() : mainContent
      const finalMsg = mainContent.replace(/```[\s\S]*?```/g, '').trim()

      const newFrame = { id: frameId, title: currentPrompt.split(' ').slice(0, 4).join(' '), code, x: newX, y: newY, w: 1200, h: 800 }
      setFrames(prev => [...prev, newFrame])
      setSelectedFrame(frameId)
      setLogs(prev => prev.map(l => l.id === newLogId ? { ...l, textContent: finalMsg, status: 'completed' } : l))
      if (!forcedPrompt) setPromptValue('')

      if (project) {
        await supabase.from('projects').update({ content: { ...project.content, frames: [...frames, newFrame] }, updated_at: new Date().toISOString() }).eq('id', project.id)
      }
    } catch (err) {
      console.error(err)
      setLogs(prev => prev.map(l => l.id === newLogId ? { ...l, thinkingContent: '', status: 'error' } : l))
    } finally {
      setIsSubmitting(false)
    }
  }

  const tools = [
    { id: 'pointer', icon: MousePointer2, label: 'تحديد (V)' },
    { id: 'hand', icon: Hand, label: 'سحب (H)' },
  ]

  const isDark = darkMode
  const glassBase = isDark ? 'rgba(10,10,16,0.75)' : 'rgba(255,255,255,0.85)'
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
          <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', opacity: 0.9 }}>TOLZY Canvas</span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => selectedFrame && setPreviewOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '99px',
            background: selectedFrame ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${selectedFrame ? 'rgba(16,185,129,0.3)' : borderBase}`,
            color: selectedFrame ? '#10b981' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            fontSize: '12px', fontWeight: 700, transition: 'all 0.2s', cursor: selectedFrame ? 'pointer' : 'not-allowed'
          }}>
            <Play size={13} fill="currentColor" /> تشغيل
          </button>
          <div style={{ width: 1, height: 18, background: borderBase, margin: '0 2px' }} />
          <button onClick={handleCopyCode} style={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#000'} onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} title="نسخ الكود"><Copy size={15} /></button>
          <button onClick={handleDeleteProject} style={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(239,68,68,0.6)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.6)'} title="حذف المشروع"><Trash2 size={15} /></button>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '99px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff',
            fontSize: '12px', fontWeight: 700, boxShadow: '0 4px 16px rgba(99,102,241,0.3)', transition: 'all 0.2s'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)'; }}>
            <Download size={13} /> حفظ
          </button>
          <div onClick={() => setShowProfile(!showProfile)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            {user?.email?.[0].toUpperCase()}
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

        {/* ─── Agent Log (Floating, Glass) ─── */}
        {agentLogOpen && (
          <div className="anim-slide-right" style={{
            position: 'absolute', top: '12px', right: '12px', width: '360px', maxHeight: '65vh',
            background: isDark ? 'rgba(8,8,14,0.85)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(40px)',
            borderRadius: '20px', border: `1px solid ${borderBase}`,
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 12px 40px rgba(0,0,0,0.1)',
            zIndex: 30, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Log Header */}
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${borderBase}` }}>
              <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="#818cf8" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>سجل الوكيل</span>
              {isSubmitting && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div className="thinking-dot" />
                  <div className="thinking-dot" />
                  <div className="thinking-dot" />
                </div>
              )}
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', fontWeight: 700, color: 'var(--text-muted)' }}>{logs.length}</span>
              <button onClick={() => setAgentLogOpen(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><X size={15} /></button>
            </div>

            {/* Log Body */}
            <div className="premium-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.length === 0 && (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: '12px', margin: 0 }}>أدخل وصفاً للبدء</p>
                </div>
              )}
              {logs.map(log => (
                <div key={log.id} className="agent-log-entry" style={{
                  borderRadius: '14px', overflow: 'hidden',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${log.status === 'loading' ? 'rgba(99,102,241,0.2)' : log.status === 'error' ? 'rgba(239,68,68,0.2)' : borderBase}`,
                  transition: 'border-color 0.3s'
                }}>
                  {/* Log title row */}
                  <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
                    {log.status === 'loading' && <Loader2 size={13} color="#f59e0b" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />}
                    {log.status === 'completed' && <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0 }} />}
                    {log.status === 'error' && <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0 }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: 'var(--text-primary)' }}>{log.title}</span>
                  </div>

                  {/* Thinking Stream */}
                  {log.thinkingContent && (
                    <details open style={{ margin: '0 10px 10px' }}>
                      <summary style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '6px', listStyle: 'none' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={9} color="#818cf8" />
                        </div>
                        {log.status === 'loading' ? (
                          <span style={{ animation: 'thinking 1s ease-in-out infinite' }}>جارٍ التفكير...</span>
                        ) : 'عملية التفكير'}
                      </summary>
                      <div className="thinking-stream premium-scrollbar" style={{
                        padding: '10px', borderRadius: '10px', marginTop: '6px',
                        background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.04)',
                        border: '1px solid rgba(99,102,241,0.1)',
                        maxHeight: '180px', overflowY: 'auto'
                      }}>
                        {log.thinkingContent}
                        {log.status === 'loading' && <span style={{ display: 'inline-block', width: '2px', height: '14px', background: '#818cf8', marginRight: '2px', animation: 'thinking 0.8s infinite', verticalAlign: 'middle' }} />}
                      </div>
                    </details>
                  )}

                  {/* Final message */}
                  {log.textContent && log.status === 'completed' && (
                    <div style={{ padding: '0 12px 10px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, wordBreak: 'break-word' }}>
                      {log.textContent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle Agent Log Button */}
        {!agentLogOpen && (
          <button onClick={() => setAgentLogOpen(true)} style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 30,
            width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark ? 'rgba(8,8,14,0.85)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(24px)', border: `1px solid ${borderBase}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#818cf8', transition: 'all 0.2s'
          }}><Sparkles size={17} /></button>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div style={{
            position: 'absolute', left: contextMenu.x, top: contextMenu.y, zIndex: 99999,
            background: isDark ? 'rgba(10,10,16,0.92)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(32px)', borderRadius: '16px',
            border: `1px solid ${borderBase}`, padding: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)', minWidth: '180px',
            animation: 'scaleIn 0.15s ease-out both'
          }} onMouseLeave={() => setContextMenu(null)}>
            {[
              { label: 'تشغيل الكود', icon: Play, color: '#10b981', action: () => { setSelectedFrame(contextMenu.frame.id); setPreviewOpen(true); setContextMenu(null) } },
              { label: 'حفظ المشروع', icon: Download, color: null, action: () => { handleSave(); setContextMenu(null) } },
              { label: 'تنزيل HTML', icon: Copy, color: null, action: () => { downloadFile(contextMenu.frame); setContextMenu(null) } },
              { label: 'حذف التصميم', icon: Trash2, color: '#ef4444', action: () => { deleteFrame(contextMenu.frame.id); setContextMenu(null) } },
            ].map(({ label, icon: Icon, color, action }) => (
              <button key={label} onClick={action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: color || 'var(--text-primary)', background: 'transparent', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'right' }}
                onMouseEnter={e => e.currentTarget.style.background = color ? `${color}15` : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              ><Icon size={14} /> {label}</button>
            ))}
          </div>
        )}

        {/* ─── Canvas Area ─── */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          <div
            ref={canvasRef}
            style={{
              flex: 1, position: 'relative', overflow: 'hidden',
              cursor: activeTool === 'hand' || isPanning ? 'grab' : 'default',
              direction: 'ltr'
            }}
            onMouseDown={onCanvasMouseDown}
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
            onMouseLeave={onCanvasMouseUp}
            onWheel={onWheel}
            onClick={e => { if (e.target === canvasRef.current) setSelectedFrame(null) }}
          >
            {/* Mouse Trail Spotlight Dots */}
            {isDark && <MouseTrail color="#ffffff" />}

            {/* Frames */}
            <div style={{
              position: 'absolute', left: 0, top: 0,
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom / 100})`,
              transformOrigin: '0 0',
              transition: draggingFrame ? 'none' : 'transform 0.06s ease',
              direction: 'rtl'
            }}>
              {frames.map(frame => (
                <div key={frame.id} style={{ position: 'absolute', left: frame.x, top: frame.y, width: frame.w, height: frame.h + 40 }}>
                  {/* Frame Header */}
                  <div onMouseDown={e => startDragFrame(e, frame.id)} style={{
                    height: '40px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px',
                    cursor: 'grab', userSelect: 'none',
                    color: selectedFrame === frame.id ? '#818cf8' : 'rgba(255,255,255,0.4)',
                    fontSize: '12px', fontWeight: 700, letterSpacing: '-0.01em',
                    transition: 'color 0.2s'
                  }}>
                    <GripVertical size={13} />
                    <span>{frame.title || 'بدون عنوان'}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={e => { e.stopPropagation(); deleteFrame(frame.id) }} style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', display: 'flex' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}><X size={14} /></button>
                  </div>
                  {/* Frame Body */}
                  <div
                    onMouseDown={e => { if (activeTool === 'pointer') startDragFrame(e, frame.id) }}
                    onContextMenu={e => handleContextMenu(e, frame)}
                    style={{
                      width: frame.w, height: frame.h,
                      borderRadius: '20px', overflow: 'hidden',
                      border: selectedFrame === frame.id ? '2px solid rgba(99,102,241,0.8)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: selectedFrame === frame.id
                        ? '0 0 0 4px rgba(99,102,241,0.15), 0 24px 80px rgba(0,0,0,0.5)'
                        : '0 16px 60px rgba(0,0,0,0.5)',
                      background: '#fff', position: 'relative',
                      cursor: activeTool === 'pointer' ? 'grab' : 'auto',
                      transition: 'border 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {activeTool === 'pointer' && <div style={{ position: 'absolute', inset: 0, zIndex: 5 }} />}
                    <iframe srcDoc={frame.code} title={frame.title} style={{ width: '100%', height: '100%', border: 'none', pointerEvents: activeTool === 'pointer' ? 'none' : 'auto' }} sandbox="allow-scripts allow-popups allow-forms" />
                  </div>
                  {/* Resize Handles */}
                  {selectedFrame === frame.id && activeTool === 'pointer' && (
                    <>
                      <div onMouseDown={e => startResize(e, frame.id, 'right')} style={{ position: 'absolute', right: -8, top: 40, bottom: 0, width: 16, cursor: 'ew-resize', zIndex: 10 }} />
                      <div onMouseDown={e => startResize(e, frame.id, 'bottom')} style={{ position: 'absolute', right: 0, left: 0, bottom: -8, height: 16, cursor: 'ns-resize', zIndex: 10 }} />
                      <div onMouseDown={e => startResize(e, frame.id, 'corner')} style={{ position: 'absolute', right: -10, bottom: -10, width: 20, height: 20, cursor: 'nwse-resize', zIndex: 10, background: '#6366f1', borderRadius: '50%', boxShadow: '0 4px 12px rgba(99,102,241,0.6)', border: '2px solid #fff' }} />
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Empty state */}
            {frames.length === 0 && !isSubmitting && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: 'none' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 3s ease-in-out infinite', boxShadow: '0 0 40px rgba(99,102,241,0.2)' }}>
                  <Sparkles size={32} color="#6366f1" />
                </div>
                <div style={{ marginTop: '20px', fontSize: '20px', fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', letterSpacing: '-0.02em' }}>صِف واجهتك للبدء</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>كل وصف ينشئ شاشة جديدة في لوحة العمل</div>
              </div>
            )}
            {frames.length === 0 && isSubmitting && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: 'none' }}>
                <Loader2 size={48} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '20px', fontSize: '16px', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>جارٍ إنشاء وتصميم الواجهة...</div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Floating Tool Palette ─── */}
        <div style={{
          position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px',
          background: isDark ? 'rgba(8,8,14,0.85)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(24px)', borderRadius: '18px', border: `1px solid ${borderBase}`,
          boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 12px 32px rgba(0,0,0,0.08)',
          zIndex: 30
        }}>
          {tools.map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id)} onMouseEnter={() => setHoveredTool(t.id)} onMouseLeave={() => setHoveredTool(null)} title={t.label} style={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeTool === t.id ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeTool === t.id ? '#818cf8' : isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', transition: 'all 0.2s', position: 'relative', boxShadow: activeTool === t.id ? '0 0 0 1px rgba(99,102,241,0.4)' : 'none' }}>
              <t.icon size={18} />
              {hoveredTool === t.id && (
                <div style={{ position: 'absolute', left: '52px', background: isDark ? 'rgba(10,10,16,0.95)' : '#fff', color: isDark ? '#f2f2f5' : '#111', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: `1px solid ${borderBase}`, pointerEvents: 'none' }}>
                  {t.label}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* ─── Bottom Prompt Bar ─── */}
        <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: '640px', zIndex: 40, padding: '0 20px' }}>
          <div style={{
            background: isDark ? 'rgba(8,8,14,0.88)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(40px)', borderRadius: '22px',
            border: `1px solid ${promptFocused ? 'rgba(99,102,241,0.5)' : borderBase}`,
            boxShadow: promptFocused
              ? '0 0 0 4px rgba(99,102,241,0.1), 0 20px 60px rgba(0,0,0,0.5)'
              : isDark ? '0 16px 60px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)',
            padding: '12px 16px', transition: 'border-color 0.3s, box-shadow 0.3s'
          }}>
            <input
              id="main-prompt-input"
              type="text"
              placeholder="ماذا تود تعديله أو إنشاؤه؟"
              style={{ width: '100%', padding: '8px 0', fontSize: '15px', background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#f0f0f5' : '#111', fontFamily: 'inherit' }}
              value={promptValue}
              onChange={e => setPromptValue(e.target.value)}
              onFocus={() => setPromptFocused(true)}
              onBlur={() => setPromptFocused(false)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmitPrompt(e) }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px', marginTop: '4px', borderTop: `1px solid ${borderBase}` }}>
              <Mic size={15} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '99px', background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)', fontSize: '11px', fontWeight: 800, color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
                TOLZY V2.0.1
              </div>
              <button onClick={handleSubmitPrompt} disabled={isSubmitting || !promptValue.trim()} style={{ width: 34, height: 34, borderRadius: '50%', background: isSubmitting || !promptValue.trim() ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: isSubmitting || !promptValue.trim() ? 0.5 : 1, boxShadow: isSubmitting || !promptValue.trim() ? 'none' : '0 4px 16px rgba(99,102,241,0.4)' }}>
                {isSubmitting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Zoom Controls ─── */}
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 10px', background: isDark ? 'rgba(8,8,14,0.85)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderRadius: '14px', border: `1px solid ${borderBase}`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 30 }}>
          <button onClick={handleZoomOut} style={{ width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><ZoomOut size={14} /></button>
          <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '38px', textAlign: 'center', color: 'var(--text-secondary)' }}>{Math.round(zoom)}%</span>
          <button onClick={handleZoomIn} style={{ width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><ZoomIn size={14} /></button>
          <div style={{ width: 1, height: 16, background: borderBase, margin: '0 2px' }} />
          <button onClick={handleZoomReset} title="إعادة تعيين" style={{ width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><RotateCcw size={14} /></button>
        </div>
      </div>

      {/* ════ FULLSCREEN PREVIEW ════ */}
      {previewOpen && selectedFrame && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: isDark ? '#000' : '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${borderBase}`, background: isDark ? 'rgba(5,5,10,0.9)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, marginRight: '8px' }}>تشغيل: {frames.find(f => f.id === selectedFrame)?.title}</span>
            </div>
            <button onClick={() => setPreviewOpen(false)} style={{ width: 32, height: 32, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: isDark ? '#fff' : '#000' }}><X size={16} /></button>
          </div>
          <div style={{ flex: 1 }}>
            <iframe srcDoc={frames.find(f => f.id === selectedFrame)?.code} title="Preview" style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts allow-same-origin allow-popups" />
          </div>
        </div>
      )}
    </div>
  )
}

export default CanvasEditor
