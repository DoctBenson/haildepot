'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TradespersonDashboard() {
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
        .eq('tradesperson_id', user.id)
      setBookings(bookingsData || [])
    }
    getData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function updateBookingStatus(id, status) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
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

      <div style={{ background: '#EAF4F7', border: '1px solid #1F6F8B', borderRadius: '12px', padding: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
  <div>
    <h2 style={{ margin: '0 0 8px', color: '#0B1F2A' }}>{profile?.full_name}</h2>
    <p style={{ margin: '0 0 4px', color: '#1F6F8B', fontWeight: '600' }}>{profile?.trade}</p>
    <p style={{ margin: '0', color: '#6B7280' }}> {profile?.location}</p>
  </div>
  <Link href={`/tradesperson/${user?.id}`} style={{ padding: '10px 20px', background: '#1F6F8B', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
    View My Profile
  </Link>
</div>

      <div>
        <h2 style={{ marginBottom: '16px' }}>Incoming Bookings</h2>
        {bookings.length === 0 ? (
          <p style={{ color: '#6B7280' }}>No bookings yet. Your profile is live — customers can find and book you!</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((booking, index) => (
              <div key={index} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: '600' }}>{booking.service}</p>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.9rem' }}>📍 {booking.location}</p>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.9rem' }}>📅 {booking.date}</p>
                <p style={{ margin: '0 0 12px', color: '#6B7280', fontSize: '0.9rem' }}>{booking.description}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {booking.status === 'pending' && (
                    <>
                      <button onClick={() => updateBookingStatus(booking.id, 'accepted')}
                        style={{ padding: '8px 16px', background: '#1F6F8B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Accept
                      </button>
                      <button onClick={() => updateBookingStatus(booking.id, 'declined')}
                        style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Decline
                      </button>
                    </>
                  )}
                  {booking.status === 'accepted' && (
                    <button onClick={() => updateBookingStatus(booking.id, 'completed')}
                      style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      Mark Complete
                    </button>
                  )}
                  <span style={{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
                    background: booking.status === 'completed' ? '#dcfce7' : booking.status === 'accepted' ? '#dbeafe' : booking.status === 'declined' ? '#fee2e2' : '#fef3c7',
                    color: booking.status === 'completed' ? '#16a34a' : booking.status === 'accepted' ? '#1d4ed8' : booking.status === 'declined' ? '#dc2626' : '#d97706'
                  }}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}