'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'

import { use } from 'react'

export default function BookPage({ params }) {
  const { id } = use(params)
  const [user, setUser] = useState(null)
  const [tradesperson, setTradesperson] = useState(null)
  const [service, setService] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      setTradesperson(data)
    }
    getData()
  }, [])

  async function handleBooking() {
    if (!service || !description || !location || !date) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      tradesperson_id: id,
      service,
      description,
      location,
      date,
      status: 'pending'
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/customer')
  }

  if (!tradesperson) return <p style={{ padding: '40px' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '20px' }}>
      <h1 style={{ color: '#1F6F8B', marginBottom: '4px' }}>Hail Depot</h1>
      <h2 style={{ marginBottom: '24px' }}>Book a Tradesperson</h2>

      <div style={{ background: '#EAF4F7', border: '1px solid #1F6F8B', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 4px', color: '#0B1F2A' }}>{tradesperson.full_name}</h3>
        <p style={{ margin: '0 0 4px', color: '#1F6F8B', fontWeight: '600' }}>{tradesperson.trade}</p>
        <p style={{ margin: '0', color: '#6B7280', fontSize: '0.9rem' }}>📍 {tradesperson.location}</p>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <select value={service} onChange={e => setService(e.target.value)}
          style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}>
          <option value="">Select service type</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Painting">Painting</option>
          <option value="General repair">General repair</option>
        </select>

        <textarea
          placeholder="Describe your job (e.g. Fix leaking pipe under kitchen sink)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
        />

        <select value={location} onChange={e => setLocation(e.target.value)}
          style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}>
          <option value="">Select your area</option>
          <option value="Accra">Accra</option>
          <option value="Kasoa">Kasoa</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
        />

        <button
          onClick={handleBooking}
          disabled={loading}
          style={{ padding: '14px', background: '#1F6F8B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>

        <button
          onClick={() => router.back()}
          style={{ padding: '12px', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}