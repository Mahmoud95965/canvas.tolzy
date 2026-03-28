'use client';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Onboarding from '../components/Onboarding'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard')
      }
    })
    return () => unsubscribe()
  }, [])

  return <Onboarding onGetStarted={() => router.push('/auth')} />
}
