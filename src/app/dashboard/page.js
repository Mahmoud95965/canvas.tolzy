'use client';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Dashboard from '../../views/Dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/auth')
      } else {
        setUser(user)
      }
      setLoading(false)
    })
    return () => unsubscribe()
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

  if (!user) return null

  // Safely map Firebase user fields
  const userMapped = { 
    id: user.uid, 
    uid: user.uid, 
    email: user.email, 
    displayName: user.displayName 
  };
  return <Dashboard user={userMapped} onOpenProject={handleOpenProject} />
}
