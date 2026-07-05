'use client'

import { useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'tradesperson') {
          router.push('/dashboard/tradesperson')
        } else {
          router.push('/dashboard/customer')
        }
      } else {
        router.push('/login')
      }
    }
    handleCallback()
  }, [])

  return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <p>Signing you in...</p>
    </div>
  )
}