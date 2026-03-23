'use client';
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import Dashboard from '../views/Dashboard'
import CanvasEditor from '../views/CanvasEditor'

export default function Home() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard') // 'dashboard' or 'canvas'
  const [activeProject, setActiveProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleOpenProject = (project) => {
    setActiveProject(project)
    setView('canvas')
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setActiveProject(null)
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', backgroundColor: 'var(--bg-dark)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading Tolzy...</div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <main className="app-container">
      {view === 'dashboard' ? (
        <Dashboard 
          user={session.user} 
          onOpenProject={handleOpenProject} 
        />
      ) : (
        <CanvasEditor 
          project={activeProject} 
          user={session.user} 
          onBack={handleBackToDashboard}
        />
      )}
    </main>
  )
}
