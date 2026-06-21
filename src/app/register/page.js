'use client'

import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [trade, setTrade] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister() {
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      phone,
      location,
      role,
      trade: role === 'tradesperson' ? trade : null
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    if (role === 'customer') {
      router.push('/dashboard/customer')
    } else {
      router.push('/dashboard/tradesperson')
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '60px auto', padding: '20px' }}>
      <h1 style={{ color: '#1F6F8B', marginBottom: '8px', fontWeight: '800' }}>Hail Depot</h1>
      <h2 style={{ marginBottom: '24px', color: '#0B1F2A' }}>Create an account</h2>

      {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}

      {step === 1 && (
        <div>
          <p style={{ marginBottom: '20px', color: '#6B7280', fontSize: '0.95rem' }}>I am looking to:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <button
              onClick={() => setRole('customer')}
              style={{
                padding: '24px 20px',
                border: `2px solid ${role === 'customer' ? '#1F6F8B' : '#e5e7eb'}`,
                borderRadius: '16px',
                background: role === 'customer' ? '#EAF4F7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: role === 'customer' ? '0 4px 12px rgba(31,111,139,0.15)' : '0 1px 4px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0B1F2A', marginBottom: '6px' }}>Find a tradesperson</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: '1.5' }}>Book verified plumbers, electricians and painters in Accra & Kasoa</div>
              {role === 'customer' && <div style={{ marginTop: '10px', color: '#1F6F8B', fontWeight: '600', fontSize: '0.85rem' }}>✓ Selected</div>}
            </button>

            <button
              onClick={() => setRole('tradesperson')}
              style={{
                padding: '24px 20px',
                border: `2px solid ${role === 'tradesperson' ? '#1F6F8B' : '#e5e7eb'}`,
                borderRadius: '16px',
                background: role === 'tradesperson' ? '#EAF4F7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: role === 'tradesperson' ? '0 4px 12px rgba(31,111,139,0.15)' : '0 1px 4px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0B1F2A', marginBottom: '6px' }}>Offer trade services</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: '1.5' }}>Join as a plumber, electrician or painter and grow your client base</div>
              {role === 'tradesperson' && <div style={{ marginTop: '10px', color: '#1F6F8B', fontWeight: '600', fontSize: '0.85rem' }}>✓ Selected</div>}
            </button>
          </div>

          <button
            onClick={() => role && setStep(2)}
            style={{
              width: '100%', padding: '14px',
              background: role ? '#1F6F8B' : '#e5e7eb',
              color: role ? 'white' : '#9ca3af',
              border: 'none', borderRadius: '12px', fontWeight: '700',
              cursor: role ? 'pointer' : 'not-allowed',
              fontSize: '1rem', transition: 'all 0.2s'
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
            style={{ padding: '14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem' }} />
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ padding: '14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem' }} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ padding: '14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem' }} />
          <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
            style={{ padding: '14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem' }} />
          <select value={location} onChange={e => setLocation(e.target.value)}
            style={{ padding: '14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', background: 'white' }}>
            <option value="">Select your area</option>
            <option value="Accra">Accra</option>
            <option value="Kasoa">Kasoa</option>
          </select>
          {role === 'tradesperson' && (
            <select value={trade} onChange={e => setTrade(e.target.value)}
              style={{ padding: '14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', background: 'white' }}>
              <option value="">Select your trade</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Painter">Painter</option>
            </select>
          )}
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              padding: '14px', background: '#1F6F8B', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '700',
              cursor: 'pointer', fontSize: '1rem', marginTop: '8px'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <button onClick={() => setStep(1)}
            style={{ padding: '12px', background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', color: '#6B7280' }}>
            ← Back
          </button>
        </div>
      )}

      <p style={{ marginTop: '24px', textAlign: 'center', color: '#6B7280' }}>
        Already have an account? <Link href="/login" style={{ color: '#1F6F8B', fontWeight: '600' }}>Login</Link>
      </p>
    </div>
  )
}