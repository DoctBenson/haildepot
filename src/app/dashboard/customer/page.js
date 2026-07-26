'use client'
import StatsCard from '../../../components/dashboard/StatsCard'
import RecentActivity from '../../../components/dashboard/RecentActivity'
import DashboardPage from '../../../components/dashboard/DashboardPage'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wrench,
  Zap,
  Paintbrush,
  Calendar,
  CheckCircle,
  Clock3,
  Star,
} from 'lucide-react'

export default function CustomerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const router = useRouter()

  const recentActivities = [
  {
    type: 'booking',
    title: 'Booking submitted',
    time: 'Today',
  },
  {
    type: 'booking',
    title: 'Tradesperson accepted your request',
    time: 'Yesterday',
  },
  {
    type: 'completed',
    title: 'Job completed',
    time: '3 days ago',
  },
]

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

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#6B7280' }}>Loading...</p>
    </div>
  )

  return (
  <DashboardPage
    title="Customer Dashboard"
    userName={profile?.full_name}
    onLogout={handleLogout}
  >

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0B1F2A', marginBottom: '4px' }}>
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Find and book trusted tradespeople in Accra & Kasoa</p>
        </div>

        {/* Dashboard Statistics */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  }}
>
  <StatsCard
    title="Active Bookings"
    value={bookings.filter(b => b.status !== 'completed').length}
    icon={<Calendar size={24} color="white" />}
    color="#1F6F8B"
  />

  <StatsCard
    title="Completed Jobs"
    value={bookings.filter(b => b.status === 'completed').length}
    icon={<CheckCircle size={24} color="white" />}
    color="#10B981"
  />

  <StatsCard
    title="Pending Requests"
    value={bookings.filter(b => b.status === 'pending').length}
    icon={<Clock3 size={24} color="white" />}
    color="#F59E0B"
  />

  <StatsCard
    title="Reviews Given"
    value={0}
    icon={<Star size={24} color="white" />}
    color="#8B5CF6"
  />
</div>

        {/* Service Cards */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0B1F2A', marginBottom: '16px' }}>
            What do you need?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {[
             
             
             
             
        {
          label: 'Plumber',
          service: 'Plumber',
          bg: '#EAF4F7',
          icon: <Wrench size={28} />,
        },
        {
          label: 'Electrician',
          service: 'Electrician',
          bg: '#FEF3C7',
          icon: <Zap size={28} />,
        },
        {
          label: 'Painter',
          service: 'Painter',
          bg: '#FCE7F3',
          icon: <Paintbrush size={28} />,
          },
            ].map(item => (
              <Link key={item.service} href={`/tradespeople?service=${item.service}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: item.bg,
                  borderRadius: '16px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  border: '1px solid transparent'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  
              <div
                style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              >
                {item.icon}
                </div>
                  <p style={{ margin: '0', fontWeight: '700', color: '#0B1F2A', fontSize: '0.95rem' }}>{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bookings */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0B1F2A', marginBottom: '16px' }}>
            My Bookings
          </h2>
          {bookings.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: '16px', padding: '40px',
              textAlign: 'center', border: '1px solid #e5e7eb'
            }}>
              <p style={{ color: '#6B7280', marginBottom: '16px' }}>No bookings yet</p>
              <Link href="/tradespeople" style={{
                padding: '12px 24px', background: '#1F6F8B', color: 'white',
                borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
              }}>
                Find a Tradesperson
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.map((booking) => (
                <div key={booking.id} style={{
                  background: 'white', borderRadius: '16px', padding: '20px',
                  border: '1px solid #e5e7eb',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#0B1F2A' }}>{booking.service}</p>
                    <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.85rem' }}>📅 {booking.date} · 📍 {booking.location}</p>
                    <p style={{ margin: '0', color: '#6B7280', fontSize: '0.85rem' }}>{booking.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                      background: booking.status === 'completed' ? '#dcfce7' : booking.status === 'accepted' ? '#dbeafe' : '#fef3c7',
                      color: booking.status === 'completed' ? '#16a34a' : booking.status === 'accepted' ? '#1d4ed8' : '#d97706'
                    }}>
                      {booking.status}
                    </span>
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => router.push(`/review/${booking.id}?tradesperson=${booking.tradesperson_id}`)}
                        style={{
                          padding: '6px 14px', background: '#1F6F8B', color: 'white',
                          border: 'none', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.8rem', fontWeight: '600'
                        }}
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px' }}>
             <RecentActivity activities={recentActivities} />
        </div>

          
  
</div>
  </DashboardPage>
)
}