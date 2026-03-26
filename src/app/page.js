'use client';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Onboarding from '../components/Onboarding'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      }
      // If no session, stay here and show Onboarding
    })
  }, [])

  return <Onboarding onGetStarted={() => router.push('/auth')} />
}
