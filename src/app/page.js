'use client';
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import Dashboard from '../views/Dashboard'
import CanvasEditor from '../views/CanvasEditor'
import Onboarding from '../components/Onboarding'

export default function Home() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard') // 'dashboard' or 'canvas'
  const [activeProject, setActiveProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      
      if (!session) {
        setShowOnboarding(true)
      }

      if (session) {
        const params = new URLSearchParams(window.location.search)
        const projectId = params.get('project')
        if (projectId) {
          supabase.from('projects').select('*').eq('id', projectId).single()
            .then(({ data }) => {
              if (data) {
                setActiveProject(data)
                setView('canvas')
              }
              setLoading(false)
            }).catch(() => setLoading(false))
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
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
    window.history.pushState(null, '', `?project=${project.id}`)
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setActiveProject(null)
    window.history.pushState(null, '', '/')
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', backgroundColor: 'var(--bg-dark)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading Tolzy...</div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <Onboarding onComplete={() => {
        setShowOnboarding(false)
      }} />
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
