'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TradespersonDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isAvailable, setIsAvailable] = useState(true)
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
      setIsAvailable(profileData?.is_available ?? true)

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

  async function toggleAvailability() {
    const newStatus = !isAvailable
    setIsAvailable(newStatus)
    await supabase
      .from('profiles')
      .update({ is_available: newStatus })
      .eq('id', user.id)
  }

  async function updateBookingStatus(id, status) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
  }

  if (!user) return <p style={{ padding: '40px' }}>Loading...</p>

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* Navbar */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1F6F8B', letterSpacing: '-0.04em' }}>
            Hail Depot
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>{profile?.full_name}</span>
          <button onClick={handleLogout} style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1.5px solid #e5e7eb',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            color: '#0B1F2A'
          }}>
            Log out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px', color: '#0B1F2A', fontSize: '1.3rem', fontWeight: '800' }}>
              {profile?.full_name}
            </h2>
            <p style={{ margin: '0 0 4px', color: '#1F6F8B', fontWeight: '600' }}>{profile?.trade}</p>
            <p style={{ margin: '0 0 12px', color: '#6B7280', fontSize: '0.9rem' }}>📍 {profile?.location}</p>

            {/* Availability Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Status:</span>
              <button
                onClick={toggleAvailability}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  background: isAvailable ? '#dcfce7' : '#fee2e2',
                  color: isAvailable ? '#16a34a' : '#dc2626',
                  transition: 'all 0.2s'
                }}
              >
                {isAvailable ? '🟢 Available' : '🔴 Unavailable'}
              </button>
            </div>
          </div>

          <Link href={`/tradesperson/${user?.id}`} style={{
            padding: '10px 20px',
            background: '#1F6F8B',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>
            View My Profile
          </Link>
        </div>

        {/* Incoming Bookings */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0B1F2A', marginBottom: '16px' }}>
            Incoming Bookings
          </h2>
          {bookings.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: '16px', padding: '40px',
              textAlign: 'center', border: '1px solid #e5e7eb'
            }}>
              <p style={{ color: '#6B7280' }}>No bookings yet. Your profile is live — customers can find and book you!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.map((booking, index) => (
                <div key={index} style={{
                  background: 'white', borderRadius: '16px', padding: '20px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <p style={{ margin: '0 0 6px', fontWeight: '700', color: '#0B1F2A' }}>{booking.service}</p>
                  <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.85rem' }}>📍 {booking.location} · 📅 {booking.date}</p>
                  <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: '0.85rem' }}>{booking.description}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {booking.status === 'pending' && (
                      <>
                        <button onClick={() => updateBookingStatus(booking.id, 'accepted')}
                          style={{ padding: '8px 20px', background: '#1F6F8B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                          Accept
                        </button>
                        <button onClick={() => updateBookingStatus(booking.id, 'declined')}
                          style={{ padding: '8px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <button onClick={() => updateBookingStatus(booking.id, 'completed')}
                        style={{ padding: '8px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Mark Complete
                      </button>
                    )}
                    <span style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
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
    </div>
  )
}