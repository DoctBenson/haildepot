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
  const [showPassword, setShowPassword] = useState(false)

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

    const dashboardRoutes = {
      customer: '/dashboard/customer',
      tradesperson: '/dashboard/tradesperson',
    }

    console.log('Profile:', profile)
    console.log('Role:', profile?.role)

    router.push(
      dashboardRoutes[profile?.role] ?? '/dashboard/customer'
    )
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
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
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', paddingRight: '48px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', color: '#6B7280',
              fontSize: '1.1rem'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <button type="submit" disabled={loading}
          style={{ padding: '12px', background: '#1F6F8B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center', margin: '16px 0', color: '#6B7280' }}>or</div>

      <button
        onClick={handleGoogleLogin}
        style={{
          width: '100%', padding: '12px',
          background: 'white', border: '1.5px solid #e5e7eb',
          borderRadius: '8px', fontWeight: '600',
          cursor: 'pointer', fontSize: '1rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '10px'
        }}
      >
        <img src="https://www.google.com/favicon.ico" width="20" height="20" />
        Continue with Google
      </button>

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#6B7280' }}>
        Don't have an account? <Link href="/register" style={{ color: '#1F6F8B' }}>Sign up</Link>
      </p>
    </div>
  )
}