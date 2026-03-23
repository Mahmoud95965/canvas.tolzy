'use client';
import React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Download, Plus, Mic, Sun, Moon,
  LayoutGrid, MousePointer2, PenTool, Hand, Layers,
  Search, Sparkles, CheckCircle2, Layout,
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Trash2, Code,
  Copy, Loader2, AlertCircle, Move, X, GripVertical,
  Share2, Eye, Star, Play, User
} from 'lucide-react'
import { supabase } from '../lib/supabase'

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

  // Canvas state
  const [zoom, setZoom] = React.useState(70)
  const [canvasOffset, setCanvasOffset] = React.useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = React.useState(false)
  const panStart = React.useRef({ x: 0, y: 0 })
  const offsetStart = React.useRef({ x: 0, y: 0 })

  // Multi-frame state: each frame = { id, title, code, x, y, w, h }
  const [frames, setFrames] = React.useState([])
  const [selectedFrame, setSelectedFrame] = React.useState(null)
  const [draggingFrame, setDraggingFrame] = React.useState(null)
  const dragStart = React.useRef({ x: 0, y: 0, fx: 0, fy: 0 })

  // Resizing state
  const [resizingFrame, setResizingFrame] = React.useState(null)
  const [resizeType, setResizeType] = React.useState(null)
  const resizeStart = React.useRef({ x: 0, y: 0, fw: 0, fh: 0 })

  // Preview / Context Menu state
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [contextMenu, setContextMenu] = React.useState(null)

  const hasInitRef = React.useRef(false)
  const canvasRef = React.useRef(null)

  // Load project frames or initial prompt
  React.useEffect(() => {
    if (hasInitRef.current) return
    if (project?.content?.frames) {
      setFrames(project.content.frames)
      hasInitRef.current = true
    } else if (project?.content?.code) {
      setFrames([{ id: 'init', title: project.title || 'صفحة 1', code: project.content.code, x: 100, y: 100, w: 1200, h: 800 }])
      hasInitRef.current = true
    } else if (project?.content?.initial_prompt) {
      hasInitRef.current = true
      handleSubmitPrompt(null, project.content.initial_prompt)
    }
  }, [project])

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    return () => document.documentElement.removeAttribute('data-theme')
  }, [darkMode])

  // ── Canvas Pan ──
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
    if (isPanning) {
      setCanvasOffset({
        x: offsetStart.current.x + (e.clientX - panStart.current.x),
        y: offsetStart.current.y + (e.clientY - panStart.current.y)
      })
    }
    if (draggingFrame) {
      const scale = zoom / 100
      setFrames(prev => prev.map(f =>
        f.id === draggingFrame
          ? { ...f, x: dragStart.current.fx + (e.clientX - dragStart.current.x) / scale, y: dragStart.current.fy + (e.clientY - dragStart.current.y) / scale }
          : f
      ))
    }
    if (resizingFrame) {
      const scale = zoom / 100
      setFrames(prev => prev.map(f => {
        if (f.id !== resizingFrame) return f
        let newW = f.w, newH = f.h
        if (resizeType === 'right' || resizeType === 'corner') {
          newW = Math.max(200, resizeStart.current.fw + (e.clientX - resizeStart.current.x) / scale)
        }
        if (resizeType === 'bottom' || resizeType === 'corner') {
          newH = Math.max(200, resizeStart.current.fh + (e.clientY - resizeStart.current.y) / scale)
        }
        return { ...f, w: newW, h: newH }
      }))
    }
  }
  const onCanvasMouseUp = () => {
    setIsPanning(false)
    if (draggingFrame) {
      setDraggingFrame(null)
      autoSave()
    }
    if (resizingFrame) {
      setResizingFrame(null)
      setResizeType(null)
      autoSave()
    }
  }

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom(prev => Math.max(20, Math.min(200, prev - e.deltaY * 0.1)))
    } else {
      setCanvasOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }))
    }
  }

  // ── Frame Drag & Resize ──
  const startDragFrame = (e, frameId) => {
    if (activeTool !== 'pointer') return
    if (e.button === 2) return // Ignore right click for drag
    e.stopPropagation()
    const frame = frames.find(f => f.id === frameId)
    if (!frame) return
    setDraggingFrame(frameId)
    setSelectedFrame(frameId)
    dragStart.current = { x: e.clientX, y: e.clientY, fx: frame.x, fy: frame.y }
  }

  const startResize = (e, frameId, type) => {
    if (activeTool !== 'pointer') return
    e.stopPropagation()
    const frame = frames.find(f => f.id === frameId)
    if (!frame) return
    setResizingFrame(frameId)
    setResizeType(type)
    resizeStart.current = { x: e.clientX, y: e.clientY, fw: frame.w, fh: frame.h }
  }

  const deleteFrame = (frameId) => {
    setFrames(prev => prev.filter(f => f.id !== frameId))
    if (selectedFrame === frameId) setSelectedFrame(null)
    autoSave()
  }

  const handleContextMenu = (e, frame) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedFrame(frame.id)
    setContextMenu({ x: e.clientX, y: e.clientY, frame })
  }

  const downloadFile = (frame) => {
    const blob = new Blob([frame.code], {type: 'text/html;charset=utf-8'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${frame.title || 'تصميم'}.html`
    link.click()
  }

  // ── Zoom ──
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 20))
  const handleZoomReset = () => { setZoom(70); setCanvasOffset({ x: 0, y: 0 }) }

  // ── Save ──
  const autoSave = async () => {
    if (!project) return
    await supabase
      .from('projects')
      .update({ content: { ...project.content, frames }, updated_at: new Date().toISOString() })
      .eq('id', project.id)
  }

  const handleSave = async () => {
    if (!project) return
    setSaving(true)
    const { error } = await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString(), content: { ...project.content, frames } })
      .eq('id', project.id)
    setSaving(false)
    if (error) alert(error.message)
  }

  const handleDeleteProject = async () => {
    if (!project) return
    if (!confirm('هل أنت متأكد من حذف هذا المشروع بالكامل؟')) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (!error) onBack()
  }

  const handleCopyCode = () => {
    const sel = frames.find(f => f.id === selectedFrame)
    if (sel) { navigator.clipboard.writeText(sel.code); alert('تم نسخ الكود!') }
  }

  // ── AI Prompt ──
  const handleSubmitPrompt = async (e, forcedPrompt) => {
    if (e) e.preventDefault()
    const currentPrompt = forcedPrompt || promptValue
    if (!currentPrompt.trim()) return

    setIsSubmitting(true)
    const newLogId = Date.now() + Math.random()
    const frameId = 'frame_' + Date.now()

    setLogs(prev => [{ id: newLogId, title: currentPrompt.slice(0, 40), thinkingContent: '', status: 'loading' }, ...prev])

    const lastFrame = frames.length > 0 ? frames[frames.length - 1] : null
    const newX = lastFrame ? lastFrame.x + lastFrame.w + 60 : 100
    const newY = lastFrame ? lastFrame.y : 100

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      })
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
              if (match) {
                displayThinking = match[1]
                displayText = fullContent.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim()
              }
            }

            const textNoCode = displayText.replace(/```[\s\S]*?(?:```|$)/g, '').trim()

            setLogs(prev => prev.map(l => l.id === newLogId ? { 
               ...l, 
               thinkingContent: displayThinking,
               textContent: textNoCode
            } : l))
          } catch {}
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

      const newFrame = {
        id: frameId,
        title: currentPrompt.split(' ').slice(0, 4).join(' '),
        code,
        x: newX, y: newY, w: 1200, h: 800
      }
      setFrames(prev => [...prev, newFrame])
      setSelectedFrame(frameId)

      setLogs(prev => prev.map(l => l.id === newLogId ? { ...l, textContent: finalMsg, status: 'completed' } : l))
      if (!forcedPrompt) setPromptValue('')

      if (project) {
        await supabase.from('projects')
          .update({ content: { ...project.content, frames: [...frames, newFrame] }, updated_at: new Date().toISOString() })
          .eq('id', project.id)
      }
    } catch (err) {
      console.error(err)
      setLogs(prev => prev.map(l => l.id === newLogId ? { ...l, thinkingContent: '', status: 'error' } : l))
    } finally {
      setIsSubmitting(false)
    }
  }

  const tools = [
    { id: 'pointer', icon: MousePointer2, label: 'تحديد' },
    { id: 'hand', icon: Hand, label: 'سحب (Pan)' },
    { id: 'layers', icon: Layers, label: 'الطبقات' },
  ]

  const bg = (a) => darkMode ? `rgba(14,14,16,${a})` : `rgba(255,255,255,${a})`
  const border = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

  return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', backgroundColor: darkMode ? '#0c0c0e' : '#f0f0f3', color: darkMode ? '#eee' : '#111', transition:'all 0.3s', direction:'rtl' }}>
      
      {/* ══════ TOP BAR ══════ */}
      <div style={{
        height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 16px', background: bg(0.85), backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${border}`, zIndex:50,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <button onClick={onBack} style={S.iconBtn}><ArrowLeft size={18} /></button>
          <span style={{fontSize:'14px',fontWeight:700,letterSpacing:'-0.02em'}}>{project?.title || 'مشروع بدون عنوان'}</span>
          {saving && <span style={{fontSize:'11px',color:'#f59e0b', background:'rgba(245,158,11,0.1)', padding:'2px 8px', borderRadius:'99px'}}>جاري الحفظ...</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <button onClick={() => selectedFrame && setPreviewOpen(true)} style={{...S.accentBtn, background: selectedFrame ? '#10b981' : '#4b5563', cursor: selectedFrame ? 'pointer' : 'not-allowed'}} title="تشغيل الكود">
            <Play size={14} fill="currentColor" /><span>تشغيل الكود</span>
          </button>
          <div style={{width:'1px',height:'20px',background:border,margin:'0 6px'}} />
          <button onClick={handleCopyCode} style={S.iconBtn} title="نسخ الكود"><Copy size={16} /></button>
          <button onClick={handleDeleteProject} style={{...S.iconBtn, color:'#ef4444'}} title="حذف المشروع"><Trash2 size={16} /></button>
          <button onClick={handleSave} style={S.accentBtn}><Download size={14} /><span>حفظ</span></button>
          <button onClick={() => setShowProfile(!showProfile)} style={S.avatar}>{user?.email?.[0].toUpperCase()}</button>
          
          {showProfile && (
            <div style={{...S.dropdown, background: bg(0.95), backdropFilter:'blur(20px)', border:`1px solid ${border}`}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={S.avatarLg}>{user?.email?.[0].toUpperCase()}</div>
                <div><div style={{fontSize:'13px',fontWeight:700}}>ملفي الشخصي</div><div style={{fontSize:'10px',color:'#888'}}>إدارة بياناتك وحسابك</div></div>
              </div>
              <div style={{height:'1px', background:border, margin:'4px 0'}}></div>
              <button 
                onClick={() => router.push('/account')} 
                style={{textAlign:'right', background:'transparent', border:'none', fontSize:'13px', fontWeight:600, color:'var(--text-primary)', padding:'8px 0', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}
              >
                <User size={14} /> إعدادات الحساب
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════ WORKSPACE ══════ */}
      <div style={{flex:1, display:'flex', position:'relative', overflow:'hidden'}}>

        {/* ── Agent Log (Right, Floating) ── */}
        {agentLogOpen && (
          <div style={{
            position:'absolute', top:'12px', right:'12px', width:'340px', maxHeight:'60vh',
            background: bg(0.2), backdropFilter:'blur(30px) saturate(200%)',
            borderRadius:'14px', border:`1px solid ${border}`,
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
            zIndex:30, display:'flex', flexDirection:'column', overflow:'hidden',
          }}>
            <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:'8px', borderBottom:`1px solid ${border}`, fontSize:'12px', fontWeight:700 }}>
              <Sparkles size={14} color="#6366f1" />
              <span>سجل الوكيل</span>
              <span style={{marginRight:'auto',fontSize:'10px',color:'#888', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding:'2px 6px', borderRadius:'6px'}}>{logs.length}</span>
              <button onClick={() => setAgentLogOpen(false)} style={{color:'#888',marginRight:'4px', cursor:'pointer', background:'none', border:'none'}}><X size={14} /></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'10px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {logs.length === 0 && <div style={{padding:'20px',textAlign:'center',color:'#666',fontSize:'12px'}}>أدخل وصفاً للبدء</div>}
              {logs.map(log => (
                <div key={log.id} style={{
                  borderRadius:'12px', overflow:'hidden',
                  background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border:`1px solid ${border}`,
                }}>
                  <div style={{padding:'10px', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color: 'var(--text-primary)' }}>
                    {log.status === 'loading' && <Loader2 size={12} color="#f59e0b" style={{animation:'spin 1s linear infinite'}} />}
                    {log.status === 'completed' && <CheckCircle2 size={12} color="#22c55e" />}
                    {log.status === 'error' && <AlertCircle size={12} color="#ef4444" />}
                    <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{log.title}</span>
                  </div>
                  
                  {log.thinkingContent && (
                    <details open={log.status === 'loading'} style={{ margin:'0 10px 10px' }}>
                      <summary style={{fontSize:'11px',fontWeight:700,color:'#6366f1',cursor:'pointer',outline:'none',display:'flex',alignItems:'center',gap:'4px'}}>
                        <Sparkles size={12} /> عملية التفكير...
                      </summary>
                      <div style={{
                        fontSize:'11px',lineHeight:1.7,color:'#a1a1aa',whiteSpace:'pre-wrap',wordBreak:'break-word',
                        marginTop:'8px', padding:'10px', borderRadius:'8px',
                        background: 'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.1)',
                        maxHeight:'200px', overflowY:'auto',
                      }}>
                        {log.thinkingContent}
                      </div>
                    </details>
                  )}
                  
                  {log.textContent && log.status === 'completed' && (
                    <div style={{padding:'0 10px 10px',fontSize:'12px',color:'var(--text-secondary)',lineHeight:1.6,wordBreak:'break-word',whiteSpace:'pre-wrap'}}>
                      {log.textContent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!agentLogOpen && (
          <button onClick={() => setAgentLogOpen(true)} style={{
            position:'absolute',top:'12px',right:'12px',zIndex:30,
            ...S.iconBtn, background: bg(0.8), backdropFilter:'blur(16px)', border:`1px solid ${border}`,
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)', width:'36px', height:'36px'
          }}>
            <Sparkles size={18} color="#6366f1" />
          </button>
        )}

        {/* ── Context Menu (Right Click) ── */}
        {contextMenu && (
          <div 
            style={{
              position:'absolute', left: contextMenu.x, top: contextMenu.y, zIndex: 99999,
              background: darkMode ? 'rgba(20,20,24,0.85)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(32px) saturate(200%)', borderRadius:'16px',
              border:`1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              padding:'8px', display:'flex', flexDirection:'column', gap:'4px',
              boxShadow: darkMode ? '0 16px 40px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.15)',
              minWidth: '160px'
            }}
            onMouseLeave={() => setContextMenu(null)}
          >
            <button onClick={() => { setSelectedFrame(contextMenu.frame.id); setPreviewOpen(true); setContextMenu(null) }} style={{...S.menuItemBtn, color:'#10b981'}}>
              <Play size={14} fill="currentColor" /> تشغيل الكود
            </button>
            <button onClick={() => { handleSave(); setContextMenu(null) }} style={S.menuItemBtn}>
              <Download size={14} /> حفظ إلى مساحة العمل
            </button>
            <button onClick={() => { downloadFile(contextMenu.frame); setContextMenu(null) }} style={S.menuItemBtn}>
              <Copy size={14} /> تنزيل HTML
            </button>
            <button onClick={() => { 
                setPromptValue(`رجاءً إعادة صياغة التصميم التالي بطريقة أفضل وتطبيق تحسينات على الكود:\n\n${contextMenu.frame.code}`);
                setContextMenu(null);
                // focus the prompt
                document.getElementById('main-prompt-input')?.focus();
              }} style={S.menuItemBtn}>
              <Sparkles size={14} /> إعادة صياغة كاملة
            </button>
            <div style={{height:'1px',background:border,margin:'4px 0'}} />
            <button onClick={() => { deleteFrame(contextMenu.frame.id); setContextMenu(null) }} style={{...S.menuItemBtn, color:'#ef4444'}}>
              <Trash2 size={14} /> حذف التصميم
            </button>
          </div>
        )}

        {/* ── Canvas ── */}
        <div
          ref={canvasRef}
          style={{
            flex:1, position:'relative', overflow:'hidden',
            cursor: activeTool === 'hand' || isPanning ? 'grab' : 'default',
            backgroundImage: `radial-gradient(circle, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px)`,
            backgroundSize: `${20 * zoom / 100}px ${20 * zoom / 100}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
            direction: 'ltr' /* Force LTR so X/Y coords behave normally and match mouse deltas */
          }}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={onCanvasMouseUp}
          onWheel={onWheel}
          onClick={(e) => { if (e.target === canvasRef.current) setSelectedFrame(null) }}
        >
          {/* Frames Layer */}
          <div style={{
            position:'absolute', left:0, top:0, // Standard LTR absolute positioning
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom / 100})`,
            transformOrigin: '0 0', transition: draggingFrame ? 'none' : 'transform 0.1s ease',
            direction: 'rtl' // Restore RTL inside the frames so Arabic text renders correctly
          }}>
            {frames.map(frame => (
              <div
                key={frame.id}
                style={{
                  position:'absolute', left: frame.x, top: frame.y, // left instead of right because of dir ltr
                  width: frame.w, height: frame.h + 36,
                }}
              >
                {/* Frame Header */}
                <div
                  onMouseDown={(e) => startDragFrame(e, frame.id)}
                  style={{
                    height:'36px', display:'flex', alignItems:'center', gap:'8px',
                    padding:'0 12px', cursor:'grab', userSelect:'none',
                    color: selectedFrame === frame.id ? '#6366f1' : '#888',
                    fontSize:'12px', fontWeight:600,
                  }}
                >
                  <GripVertical size={14} />
                  <span>{frame.title || 'بدون عنوان'}</span>
                  <div style={{flex:1}}></div>
                  <button onClick={(e) => { e.stopPropagation(); deleteFrame(frame.id); }} style={{color:'#888',transition:'color 0.2s', ':hover':{color:'#ef4444'}}} title="حذف">
                    <X size={14} />
                  </button>
                </div>
                {/* Frame Body */}
                <div
                  onMouseDown={(e) => { if (activeTool === 'pointer') startDragFrame(e, frame.id) }}
                  onContextMenu={(e) => handleContextMenu(e, frame)}
                  style={{
                    width: frame.w, height: frame.h,
                    borderRadius:'16px', overflow:'hidden',
                    border: selectedFrame === frame.id ? '2px solid #6366f1' : `1px solid ${border}`,
                    boxShadow: selectedFrame === frame.id
                      ? '0 0 0 4px rgba(99,102,241,0.15), 0 16px 40px rgba(0,0,0,0.3)'
                      : darkMode ? '0 12px 32px rgba(0,0,0,0.3)' : '0 12px 32px rgba(0,0,0,0.08)',
                    background: '#fff',
                    transition: 'border 0.2s, box-shadow 0.2s',
                    position: 'relative', // Ensure resize handles position correctly
                    cursor: activeTool === 'pointer' ? 'grab' : 'auto'
                  }}
                >
                  {activeTool === 'pointer' && (
                    <div style={{position:'absolute',inset:0,zIndex:5}}></div>
                  )}
                  <iframe
                    srcDoc={frame.code}
                    title={frame.title}
                    style={{width:'100%',height:'100%',border:'none',pointerEvents: activeTool === 'pointer' ? 'none' : 'auto'}}
                    sandbox="allow-scripts allow-popups allow-forms"
                  />
                </div>
                {/* Resize Handles */}
                {selectedFrame === frame.id && activeTool === 'pointer' && (
                  <>
                    <div onMouseDown={(e) => startResize(e, frame.id, 'right')} style={{position:'absolute',right:-8,top:36,bottom:0,width:16,cursor:'ew-resize',zIndex:10}} /> {/* Corrected to right edge for LTR */}
                    <div onMouseDown={(e) => startResize(e, frame.id, 'bottom')} style={{position:'absolute',right:0,left:0,bottom:-8,height:16,cursor:'ns-resize',zIndex:10}} />
                    <div onMouseDown={(e) => startResize(e, frame.id, 'corner')} style={{position:'absolute',right:-12,bottom:-12,width:24,height:24,cursor:'nwse-resize',zIndex:10,background:'#6366f1',borderRadius:'50%',boxShadow:'0 4px 12px rgba(0,0,0,0.3)', border:'2px solid #fff'}} />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Empty Canvas State */}
          {frames.length === 0 && !isSubmitting && (
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',pointerEvents:'none'}}>
              <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'rgba(99,102,241,0.1)',display:'flex',alignItems:'center',justifyContent:'center',animation:'pulse 3s ease-in-out infinite'}}>
                <Sparkles size={32} color="#6366f1" />
              </div>
              <div style={{marginTop:'20px',fontSize:'18px',fontWeight:700,color:'var(--text-primary)'}}>صف واجهة المستخدم للبدء</div>
              <div style={{fontSize:'13px',color:'var(--text-muted)',marginTop:'6px'}}>كل وصف تقوم به ينشئ شاشة جديدة في لوحة العمل الخاص بك</div>
            </div>
          )}
          {frames.length === 0 && isSubmitting && (
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',pointerEvents:'none'}}>
              <Loader2 size={40} color="#6366f1" style={{animation:'spin 1.5s linear infinite'}} />
              <div style={{marginTop:'20px',fontSize:'15px',fontWeight:600,color:'var(--text-primary)'}}>جاري إنشاء وتصميم الواجهة...</div>
            </div>
          )}
        </div>

        {/* ── Right Toolbar (Floating) ── */}
        <div style={{
          position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)',
          display:'flex', flexDirection:'column', gap:'4px', padding:'8px',
          background: bg(0.8), backdropFilter:'blur(20px) saturate(180%)',
          borderRadius:'16px', border:`1px solid ${border}`,
          boxShadow: darkMode ? '0 12px 32px rgba(0,0,0,0.4)' : '0 12px 32px rgba(0,0,0,0.08)',
          zIndex:30,
        }}>
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              onMouseEnter={() => setHoveredTool(t.id)}
              onMouseLeave={() => setHoveredTool(null)}
              title={t.label}
              style={{
                width:'40px',height:'40px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',
                background: activeTool === t.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: activeTool === t.id ? '#6366f1' : '#888',
                transition:'all 0.2s', position:'relative',
              }}
            >
              <t.icon size={18} />
              {hoveredTool === t.id && (
                <div style={{position:'absolute',left:'52px',background: darkMode ? '#222' : '#fff', color: darkMode ? '#eee' : '#111', padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',boxShadow:'0 8px 16px rgba(0,0,0,0.2)',border:`1px solid ${border}`}}>
                  {t.label}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* ── Bottom Prompt Bar (Centered) ── */}
        <div style={{
          position:'absolute', bottom:'24px', left:0, right:0, margin:'0 auto',
          width:'100%', maxWidth:'600px', zIndex:40,
        }}>
          <div style={{
            background: bg(0.85), backdropFilter:'blur(32px) saturate(200%)',
            borderRadius:'20px', border:`1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: darkMode ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.1)',
            padding:'8px 16px',
          }}>
            <input
              id="main-prompt-input"
              type="text"
              placeholder="ماذا تود أن تغير أو تُنشئ؟"
              style={{ width:'100%', padding:'12px 0', fontSize:'15px', background:'transparent', border:'none', outline:'none', color: darkMode ? '#f0f0f2' : '#111' }}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitPrompt(e) }}
            />
            <div style={{display:'flex',alignItems:'center',gap:'8px',paddingBottom:'6px',marginTop:'4px'}}>
              <Mic size={16} style={{color:'#666',cursor:'pointer'}} />
              <div style={{flex:1}}></div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(99,102,241,0.1)',padding:'4px 12px',borderRadius:'99px',fontSize:'11px',fontWeight:700,color:'#6366f1',border:'1px solid rgba(99,102,241,0.2)'}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#6366f1'}}></div>
                TOLZY Copilot V2.0.1
              </div>
              <button
                onClick={handleSubmitPrompt}
                disabled={isSubmitting || !promptValue.trim()}
                style={{
                  width:'36px',height:'36px',borderRadius:'50%',
                  background: isSubmitting || !promptValue.trim() ? '#444' : '#6366f1',
                  color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
                  transition:'all 0.2s', opacity: isSubmitting || !promptValue.trim() ? 0.4 : 1,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                }}
              >
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Right: Zoom ── */}
        <div style={{
          position:'absolute', bottom:'24px', right:'24px', /* Changed to correct right-aligned LTR logic inside full wrapper */
          display:'flex', alignItems:'center', gap:'4px', padding:'6px 8px',
          background: bg(0.8), backdropFilter:'blur(24px)',
          borderRadius:'12px', border:`1px solid ${border}`,
          boxShadow:'0 8px 24px rgba(0,0,0,0.2)', zIndex:30,
        }}>
          <button onClick={handleZoomOut} style={S.zoomBtn}><ZoomOut size={14} /></button>
          <span style={{fontSize:'12px',fontWeight:700,minWidth:'36px',textAlign:'center'}}>{Math.round(zoom)}%</span>
          <button onClick={handleZoomIn} style={S.zoomBtn}><ZoomIn size={14} /></button>
          <div style={{width:'1px',height:'16px',background:border}}></div>
          <button onClick={handleZoomReset} style={S.zoomBtn} title="إعادة تعيين"><RotateCcw size={14} /></button>
        </div>
      </div>

      {/* ── Fullscreen Preview Modal (Running Code) ── */}
      {previewOpen && selectedFrame && (
        <div style={{
          position:'fixed', inset:0, zIndex: 99999,
          background: darkMode ? '#000' : '#fff',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', borderBottom: `1px solid ${border}`, background: bg(0.9)
          }}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{display:'flex',gap:'6px'}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:'#ef4444'}}></div>
                <div style={{width:12,height:12,borderRadius:'50%',background:'#f59e0b'}}></div>
                <div style={{width:12,height:12,borderRadius:'50%',background:'#22c55e'}}></div>
              </div>
              <span style={{fontSize:'14px',fontWeight:700,color:darkMode?'#fff':'#111',marginRight:'12px'}}>
                جاري التشغيل: {frames.find(f => f.id === selectedFrame)?.title}
              </span>
            </div>
            <button onClick={() => setPreviewOpen(false)} style={{...S.iconBtn, background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', width: 32, height: 32}}>
              <X size={18} />
            </button>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe
              srcDoc={frames.find(f => f.id === selectedFrame)?.code}
              title="Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      )}
    </div>
  )
}

const S = {
  iconBtn: {
    width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',
    color:'#888',transition:'all 0.2s', cursor:'pointer'
  },
  accentBtn: {
    display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'99px',
    background:'#6366f1',color:'#fff',fontSize:'12px',fontWeight:700,transition:'all 0.2s',cursor:'pointer'
  },
  avatar: {
    width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#a855f7)',
    display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,
    color:'#fff',cursor:'pointer',transition:'all 0.2s', boxShadow:'0 4px 12px rgba(99,102,241,0.3)'
  },
  avatarLg: {
    width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#a855f7)',
    display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:'#fff',
  },
  dropdown: {
    position:'absolute',top:'48px',left:'16px',width:'240px',borderRadius:'16px',
    padding:'16px',boxShadow:'0 16px 48px rgba(0,0,0,0.4)',zIndex:100,
    display:'flex',flexDirection:'column',gap:'12px',
  },
  zoomBtn: {
    width:'28px',height:'28px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',
    color:'#888',transition:'all 0.15s', cursor:'pointer'
  },
  menuItemBtn: {
    display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'10px',
    fontSize:'13px',fontWeight:600,color:'var(--text-primary)',background:'transparent',
    cursor:'pointer',transition:'background 0.2s', border:'none', width:'100%', textAlign:'right'
  }
}

export default CanvasEditor
