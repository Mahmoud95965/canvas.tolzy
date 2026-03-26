'use client';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Dashboard from '../../views/Dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/auth')
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/auth')
      else setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleOpenProject = (project) => {
    router.push(`/editor/${project.id}`)
  }

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050a', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 20, height: 20, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        جاري التحميل...
      </div>
    </div>
  )

  if (!session) return null

  return <Dashboard user={session.user} onOpenProject={handleOpenProject} />
}
