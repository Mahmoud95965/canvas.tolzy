'use client';
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import CanvasEditor from '../../../views/CanvasEditor'

export default function EditorPage() {
  const router = useRouter()
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/auth'); return }
      setSession(session)

      if (id) {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
        if (error || !data) {
          setError('لم يتم العثور على المشروع')
        } else {
          setProject(data)
        }
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/auth')
    })

    return () => subscription.unsubscribe()
  }, [id])

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050a', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 600, flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      جاري تحميل المشروع...
    </div>
  )

  if (error) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050a', color: '#ef4444', fontSize: '16px', fontWeight: 700, flexDirection: 'column', gap: '16px' }}>
      <div>{error}</div>
      <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', borderRadius: '99px', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>العودة للوحة التحكم</button>
    </div>
  )

  if (!session || !project) return null

  return <CanvasEditor project={project} user={session.user} onBack={() => router.push('/dashboard')} />
}
