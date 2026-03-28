'use client';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Auth from '../../components/Auth'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/dashboard')
    })
    return () => unsubscribe()
  }, [])

  return <Auth />
}
