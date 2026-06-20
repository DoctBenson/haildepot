'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CustomerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const router = useRouter()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user.id)
      setBookings(bookingsData || [])
    }
    getData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return <p style={{ padding: '40px' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '20px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ color: '#1F6F8B', fontSize: '1.6rem', fontWeight: '800' }}>Hail Depot</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#6B7280' }}>Hi, {profile?.full_name}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#0B1F2A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Find a Tradesperson</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/tradespeople?service=Plumber" style={{ padding: '16px 24px', background: '#EAF4F7', border: '2px solid #1F6F8B', borderRadius: '8px', textDecoration: 'none', color: '#0B1F2A', fontWeight: '600' }}>🔧 Plumber</Link>
          <Link href="/tradespeople?service=Electrician" style={{ padding: '16px 24px', background: '#EAF4F7', border: '2px solid #1F6F8B', borderRadius: '8px', textDecoration: 'none', color: '#0B1F2A', fontWeight: '600' }}>⚡ Electrician</Link>
          <Link href="/tradespeople?service=Painter" style={{ padding: '16px 24px', background: '#EAF4F7', border: '2px solid #1F6F8B', borderRadius: '8px', textDecoration: 'none', color: '#0B1F2A', fontWeight: '600' }}>🎨 Painter</Link>
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '16px' }}>My Bookings</h2>
        {bookings.length === 0 ? (
          <p style={{ color: '#6B7280' }}>No bookings yet. Find a tradesperson to get started!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Service</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{booking.service}</td>
                  <td style={{ padding: '12px' }}>{booking.date}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
                      background: booking.status === 'completed' ? '#dcfce7' : booking.status === 'accepted' ? '#dbeafe' : '#fef3c7',
                      color: booking.status === 'completed' ? '#16a34a' : booking.status === 'accepted' ? '#1d4ed8' : '#d97706'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}