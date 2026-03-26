'use client';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Auth from '../../components/Auth'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // If already logged in, redirect to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })

    // Listen for login success
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.replace('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [])

  return <Auth />
}
