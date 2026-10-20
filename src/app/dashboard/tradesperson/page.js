'use client'
import StatsCard from '../../../components/dashboard/StatsCard'
import DashboardPage from '../../../components/dashboard/DashboardPage'
import RecentActivity from '../../../components/dashboard/RecentActivity'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  CalendarDays,
  CheckCircle,
  Wrench,
  Star,
  Clock3,
  MapPin,
} from 'lucide-react'

export default function TradespersonDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isAvailable, setIsAvailable] = useState(null)
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [bookingActionError, setBookingActionError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const router = useRouter()
  const [updatingBookingId, setUpdatingBookingId] = useState(null)
  const updatingBookingRef = useRef(false)
  const getData = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (profileError) throw profileError

      setProfile(profileData)
      setIsAvailable(typeof profileData?.is_available === 'boolean' ? profileData.is_available : null)

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('tradesperson_id', user.id)
      if (bookingsError) throw bookingsError

      setBookings(bookingsData || [])
    } catch {
      setLoadError('We could not reach your dashboard data. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      getData()
    }, 0)

    return () => window.clearTimeout(loadTimer)
  }, [getData])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }


  async function toggleAvailability() {
    if (availabilityUpdating || !user || typeof isAvailable !== 'boolean') {
      return
    }

    const newStatus = !isAvailable
    setAvailabilityUpdating(true)
    setAvailabilityError('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_available: newStatus })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      const { data: savedProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('is_available')
        .eq('id', user.id)
        .maybeSingle()

      if (verifyError) {
        throw verifyError
      }

      if (typeof savedProfile?.is_available !== 'boolean') {
        throw new Error('Availability could not be verified.')
      }

      // Reflect the value actually stored in Supabase.
      setIsAvailable(savedProfile.is_available)

      if (savedProfile.is_available !== newStatus) {
        throw new Error('The saved availability differs from the requested value.')
      }
    } catch (error) {
      console.error('Failed to update or verify availability:', error)
      setAvailabilityError(
        'Could not confirm your availability status. Please try again.'
      )
    } finally {
      setAvailabilityUpdating(false)
    }
  }

  async function updateBookingStatus(id, status) {
    if (updatingBookingRef.current || !user) return

    updatingBookingRef.current = true
    setUpdatingBookingId(id)
    setBookingActionError(null)

    try {
      const currentBooking = bookings.find((booking) => booking.id === id)
      const allowedTransition =
        (currentBooking?.status === 'pending' && ['accepted', 'declined'].includes(status)) ||
        (currentBooking?.status === 'accepted' && status === 'awaiting_confirmation')

      if (!allowedTransition) {
        throw new Error('This booking has already changed. Refresh the dashboard and try again.')
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .eq('tradesperson_id', user.id)
        .eq('status', currentBooking.status)
      if (error) throw error

      // Verify separately because UPDATE may succeed without returning a row under RLS.
      const { data: updatedBooking, error: verifyError } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('id', id)
        .eq('tradesperson_id', user.id)
        .maybeSingle()

      if (verifyError || updatedBooking?.status !== status) {
        await getData()
        throw new Error('The booking could not be verified. Refresh and check its current status.')
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      )
    } catch (error) {
      console.error('Failed to update booking status:', error)

      setBookingActionError({
        id,
        message: 'Could not update this booking. Please try again.',
      })
    } finally {
      updatingBookingRef.current = false
      setUpdatingBookingId(null)
    }
  }



  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'pending') {
      return booking.status === 'pending'
    }

    if (filter === 'accepted') {
      return booking.status === 'accepted'
    }

    if (filter === 'completed') {
      return booking.status === 'completed'
    }

    return true
  })

  const activityByStatus = {
    pending: { type: 'booking', description: 'New booking request' },
    accepted: { type: 'booking', description: 'Booking accepted' },
    declined: { type: 'booking', description: 'Booking declined' },
    awaiting_confirmation: {
      type: 'booking',
      description: 'Work finished, awaiting customer confirmation',
    },
    completed: { type: 'completed', description: 'Job completed' },
  }

  const recentActivities = bookings
    .map((booking) => {
      const activity = activityByStatus[booking.status]
      if (!activity || !booking.created_at) return null

      const parsedTimestamp = new Date(booking.created_at)
      if (Number.isNaN(parsedTimestamp.getTime())) return null

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const activityDay = new Date(
        parsedTimestamp.getFullYear(),
        parsedTimestamp.getMonth(),
        parsedTimestamp.getDate()
      )
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const timeLabel = parsedTimestamp.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
      const dateLabel =
        activityDay.getTime() === today.getTime()
          ? `Today, ${timeLabel}`
          : activityDay.getTime() === yesterday.getTime()
            ? `Yesterday, ${timeLabel}`
            : parsedTimestamp.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

      return {
        type: activity.type,
        title: booking.service
          ? `${booking.service}: ${activity.description}`
          : activity.description,
        time: dateLabel,
        timestampValue: parsedTimestamp.getTime(),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.timestampValue - a.timestampValue)
    .slice(0, 5)
    .map(({ timestampValue, ...activity }) => activity)

  if (loadError) {
    return (
      <div style={{ padding: '40px' }}>
        <p style={{ marginBottom: '16px', color: '#6B7280' }}>{loadError}</p>
        <button
          onClick={getData}
          style={{
            padding: '10px 20px',
            background: '#1F6F8B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading || !user) return <p role="status" aria-live="polite" style={{ padding: '40px' }}>Loading dashboard...</p>

  return (
    <DashboardPage
      title="Tradesperson Dashboard"
      userName={profile?.full_name}
      onLogout={handleLogout}
    >


      <div className="dashboard-content" style={{ padding: '32px 20px' }}>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '24px',
          marginBottom: '32px', border: '1px solid #e5e7eb',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px', color: '#0B1F2A', fontSize: '1.3rem', fontWeight: '800' }}>
              {profile?.full_name}
            </h2>
            <p style={{ margin: '0 0 4px', color: '#1F6F8B', fontWeight: '600' }}>{profile?.trade}</p>
            <p
              style={{
                margin: '0 0 12px',
                color: '#6B7280',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MapPin size={15} />
              {profile?.location}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Status:</span>
              <button type="button" onClick={toggleAvailability} disabled={availabilityUpdating || typeof isAvailable !== 'boolean'} aria-busy={availabilityUpdating} style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none',
                cursor: typeof isAvailable === 'boolean' && !availabilityUpdating ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '0.85rem',
                background: isAvailable === true ? '#dcfce7' : '#fee2e2',
                color: isAvailable === true ? '#166534' : '#991b1b',
                transition: 'all 0.2s'
              }}>
                {availabilityUpdating ? 'Saving...' : isAvailable === null ? 'Status unavailable' : isAvailable ? 'Available' : 'Unavailable'}
              </button>
            </div>
            {availabilityError && (
              <p role="alert" style={{ margin: '8px 0 0', color: '#dc2626', fontSize: '0.85rem' }}>
                {availabilityError}
              </p>
            )}
          </div>
          <Link href={`/tradesperson/${user?.id}`} style={{
            padding: '10px 20px', background: '#1F6F8B', color: 'white',
            borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem'
          }}>
            View My Profile
          </Link>
        </div>

        <div className="dashboard-stats-grid">
          <StatsCard
            title="Pending Jobs"
            value={bookings.filter(b => b.status === 'pending').length}
            icon={<Calendar size={24} color="white" />}
            color="#F59E0B"
            href="/jobs?status=pending"
          />

          <StatsCard
            title="Accepted Jobs"
            value={bookings.filter(b => b.status === 'accepted').length}
            icon={<Wrench size={24} color="white" />}
            color="#1F6F8B"
            href="/jobs?status=accepted"
          />

          <StatsCard
            title="Completed Jobs"
            value={bookings.filter(b => b.status === 'completed').length}
            icon={<CheckCircle size={24} color="white" />}
            color="#10B981"
            href="/jobs?status=completed"
          />
          <StatsCard
            title="Availability"
            value={isAvailable === null ? 'Unknown' : isAvailable ? 'Online' : 'Offline'}
            icon={
              isAvailable
                ? <Star size={24} color="white" />
                : <Clock3 size={24} color="white" />
            }
            color={isAvailable === true ? '#10B981' : '#6B7280'}
          />
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0B1F2A', marginBottom: '16px' }}>
            Incoming Bookings
          </h2>
          {filteredBookings.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: '16px', padding: '40px',
              textAlign: 'center', border: '1px solid #e5e7eb'
            }}>
              <p style={{ color: '#6B7280' }}>No bookings yet. Your profile is live — customers can find and book you!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="dashboard-booking-card" style={{
                  background: 'white', borderRadius: '16px', padding: '20px',
                  border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <p style={{ margin: '0 0 6px', fontWeight: '700', color: '#0B1F2A' }}>{booking.service}</p>
                  <p
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      color: '#6B7280',
                      fontSize: '0.85rem',
                      margin: '0 0 8px',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CalendarDays size={14} />
                      {booking.date}
                    </span>

                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <MapPin size={14} />
                      {booking.location}
                    </span>
                  </p>
                  <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>{booking.description}</p>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginTop: '4px',
                    }}
                  >
                    {booking.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(updatingBookingId)}
                          onClick={() => updateBookingStatus(booking.id, 'accepted')}
                          style={{
                            padding: '10px 18px',
                            background: '#1F6F8B',
                            color: '#FFFFFF',
                            border: '1px solid #1F6F8B',
                            borderRadius: '8px',
                            cursor: updatingBookingId ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            opacity: updatingBookingId ? 0.65 : 1,
                          }}
                        >
                          {updatingBookingId === booking.id ? 'Updating...' : 'Accept'}
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(updatingBookingId)}
                          onClick={() => updateBookingStatus(booking.id, 'declined')}
                          style={{
                            padding: '10px 18px',
                            background: '#FFFFFF',
                            color: '#DC2626',
                            border: '1px solid #DC2626',
                            borderRadius: '8px',
                            cursor: updatingBookingId ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            opacity: updatingBookingId ? 0.65 : 1,
                          }}
                        >
                          {updatingBookingId === booking.id ? 'Updating...' : 'Decline'}
                        </button>
                      </>
                    )}

                    {booking.status === 'accepted' && (
                      <button
                        type="button"
                        disabled={Boolean(updatingBookingId)}
                        onClick={() =>
                          updateBookingStatus(booking.id, 'awaiting_confirmation')
                        }
                        style={{
                          padding: '10px 18px',
                          background: '#059669',
                          color: '#FFFFFF',
                          border: '1px solid #059669',
                          borderRadius: '8px',
                          cursor: updatingBookingId ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          opacity: updatingBookingId ? 0.65 : 1,
                        }}
                      >
                        {updatingBookingId === booking.id
                          ? 'Updating...'
                          : 'Mark Work Finished'}
                      </button>
                    )}

                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        background:
                          booking.status === 'completed'
                            ? '#DCFCE7'
                            : booking.status === 'accepted'
                              ? '#DBEAFE'
                              : booking.status === 'declined'
                                ? '#FEE2E2'
                                : booking.status === 'awaiting_confirmation'
                                  ? '#F3E8FF'
                                  : '#FEF3C7',
                        color:
                          booking.status === 'completed'
                            ? '#166534'
                            : booking.status === 'accepted'
                              ? '#1D4ED8'
                              : booking.status === 'declined'
                                ? '#B91C1C'
                                : booking.status === 'awaiting_confirmation'
                                  ? '#7E22CE'
                                  : '#92400E',
                      }}
                    >
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {bookingActionError?.id === booking.id && (
                    <p
                      role="alert"
                      style={{
                        margin: '12px 0 0',
                        padding: '10px 12px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        color: '#B91C1C',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {bookingActionError.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: '40px' }}>
        <RecentActivity activities={recentActivities} />
      </div>
    </DashboardPage>
  )
}
