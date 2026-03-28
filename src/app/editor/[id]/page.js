'use client';
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { auth } from '../../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { supabase } from '../../../lib/supabase'
import CanvasEditor from '../../../views/CanvasEditor'

export default function EditorPage() {
  const router = useRouter()
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const initRef = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        router.replace('/auth')
        return
      }
      
      const mappedUser = { ...fbUser, id: fbUser.uid }
      setUser(mappedUser)

      if (id && !initRef.current) {
        initRef.current = true
        const { data, error: fetchError } = await supabase.from('projects').select('*').eq('id', id).single()
        if (fetchError || !data) {
          setError('لم يتم العثور على المشروع')
        } else {
          setProject(data)
        }
        setLoading(false)
      }
    })

    return () => unsubscribe()
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

  if (!user || !project) return null

  return <CanvasEditor project={project} user={user} onBack={() => router.push('/dashboard')} />
}
