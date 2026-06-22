'use client'

import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'tradesperson') {
      router.push('/dashboard/tradesperson')
    } else {
      router.push('/dashboard/customer')
    }
  }


return (
  <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
    <h1 style={{ color: '#1F6F8B', marginBottom: '8px' }}>Hail Depot</h1>
    <h2 style={{ marginBottom: '24px' }}>Welcome back</h2>

    {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}

    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }} />
      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }} />
      <button type="submit" disabled={loading}
        style={{ padding: '12px', background: '#1F6F8B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <p style={{ marginTop: '20px', textAlign: 'center', color: '#6B7280' }}>
      Don't have an account? <Link href="/register" style={{ color: '#1F6F8B' }}>Sign up</Link>
    </p>
  </div>
 )

}