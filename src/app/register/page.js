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
      <h1 style={{ color: '#1F6F8B', marginBottom: '8px' }}>Hail Depot</h1>
      <h2 style={{ marginBottom: '24px' }}>Create an account</h2>

      {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}

      {step === 1 && (
        <div>
          <p style={{ marginBottom: '16px', color: '#6B7280' }}>I am a:</p>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button
              onClick={() => setRole('customer')}
              style={{
                flex: 1, padding: '20px', border: `2px solid ${role === 'customer' ? '#1F6F8B' : '#e5e7eb'}`,
                borderRadius: '8px', background: role === 'customer' ? '#EAF4F7' : 'white',
                cursor: 'pointer', fontWeight: '600'
              }}
            >
              🏠 Customer
            </button>
            <button
              onClick={() => setRole('tradesperson')}
              style={{
                flex: 1, padding: '20px', border: `2px solid ${role === 'tradesperson' ? '#1F6F8B' : '#e5e7eb'}`,
                borderRadius: '8px', background: role === 'tradesperson' ? '#EAF4F7' : 'white',
                cursor: 'pointer', fontWeight: '600'
              }}
            >
              🔧 Tradesperson
            </button>
          </div>
          <button
            onClick={() => role && setStep(2)}
            style={{
              width: '100%', padding: '12px', background: role ? '#1F6F8B' : '#9ca3af',
              color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600',
              cursor: role ? 'pointer' : 'not-allowed'
            }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
            style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }} />
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }} />
          <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
            style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }} />
          <select value={location} onChange={e => setLocation(e.target.value)}
            style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}>
            <option value="">Select your area</option>
            <option value="Accra">Accra</option>
            <option value="Kasoa">Kasoa</option>
          </select>
          {role === 'tradesperson' && (
            <select value={trade} onChange={e => setTrade(e.target.value)}
              style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}>
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
              padding: '12px', background: '#1F6F8B', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: '600',
              cursor: 'pointer', fontSize: '1rem'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <button onClick={() => setStep(1)}
            style={{ padding: '12px', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>
            Back
          </button>
        </div>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#6B7280' }}>
        Already have an account? <Link href="/login" style={{ color: '#1F6F8B' }}>Login</Link>
      </p>
    </div>
  )
}