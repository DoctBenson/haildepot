'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      setError(null);

      const requestedStatus = new URLSearchParams(window.location.search).get('status');
      const supportedStatuses = ['pending', 'accepted', 'completed'];
      setSelectedStatus(supportedStatuses.includes(requestedStatus) ? requestedStatus : null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Failed to load profile:', profileError);
        setError('Unable to load your profile. Please try again.');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const isTradesperson = profileData?.role === 'tradesperson';

      const query = supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false });

      const { data: bookingsData, error: bookingsError } =
        isTradesperson
          ? await query.eq('tradesperson_id', user.id)
          : await query.eq('customer_id', user.id);

      if (bookingsError) {
        console.error('Failed to load jobs:', bookingsError);
        setBookings([]);
        setError('Unable to load jobs. Please refresh and try again.');
      } else {
        setBookings(bookingsData || []);
      }

      setLoading(false);
    }

    loadJobs();
  }, [router]);

  const filteredBookings = selectedStatus
    ? bookings.filter((booking) => booking.status === selectedStatus)
    : bookings;

  const statusLabel = selectedStatus
    ? `${selectedStatus[0].toUpperCase()}${selectedStatus.slice(1)}`
    : null;

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="dashboard-content" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            margin: '0 0 8px',
            color: '#0B1F2A',
            fontSize: '1.8rem',
            fontWeight: '800',
          }}
        >
          My Jobs
        </h1>

        <p
          style={{
            margin: 0,
            color: '#6B7280',
            fontSize: '0.95rem',
          }}
        >
          {profile.role === 'tradesperson'
            ? 'Manage your incoming and active jobs.'
            : 'Track your service requests and completed jobs.'}
        </p>
      </div>

      {selectedStatus && (
        <h2
          style={{
            margin: '0 0 16px',
            color: '#0B1F2A',
            fontSize: '1.1rem',
            fontWeight: '700',
          }}
        >
          {statusLabel} Jobs
        </h2>
      )}

      {error ? (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            borderRadius: '16px',
            padding: '24px',
            color: '#b91c1c',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#6B7280',
            }}
          >
            {selectedStatus
              ? `There are no ${selectedStatus} jobs.`
              : 'No jobs yet.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {filteredBookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/jobs/${booking.id}`}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <p
                style={{
                  margin: '0 0 6px',
                  fontWeight: '700',
                  color: '#0B1F2A',
                }}
              >
                {booking.service}
              </p>

              <p
                style={{
                  margin: '0 0 6px',
                  color: '#6B7280',
                  fontSize: '0.9rem',
                }}
              >
                {booking.date} · {booking.location}
              </p>

              <p
                style={{
                  margin: '0 0 12px',
                  color: '#6B7280',
                  fontSize: '0.85rem',
                }}
              >
                {booking.description}
              </p>

              <span
                style={{
                  display: 'inline-flex',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  background:
                    booking.status === 'completed'
                      ? '#dcfce7'
                      : booking.status === 'accepted'
                        ? '#dbeafe'
                        : booking.status === 'declined'
                          ? '#fee2e2'
                          : '#fef3c7',
                  color:
                    booking.status === 'completed'
                      ? '#16a34a'
                      : booking.status === 'accepted'
                        ? '#1d4ed8'
                        : booking.status === 'declined'
                          ? '#dc2626'
                          : '#d97706',
                }}
              >
                {booking.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
