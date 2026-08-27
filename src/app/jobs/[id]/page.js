'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useParams, useRouter } from 'next/navigation';

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .or(`customer_id.eq.${user.id},tradesperson_id.eq.${user.id}`)
        .single();

      if (error) {
        console.error('Failed to load job:', error);
        setBooking(null);
      } else {
        setBooking(data);
      }

      setLoading(false);
    }

    if (id) {
      loadJob();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="dashboard-content" style={{ padding: '32px 20px' }}>
        <p style={{ color: '#6B7280' }}>Loading job...</p>
      </div>
    );
  }

  if (!user || !booking) {
    return (
      <div className="dashboard-content" style={{ padding: '32px 20px' }}>
        <h1
          style={{
            margin: '0 0 8px',
            color: '#0B1F2A',
            fontSize: '1.8rem',
            fontWeight: '800',
          }}
        >
          Job not found
        </h1>

        <p style={{ color: '#6B7280', marginBottom: '20px' }}>
          This job could not be found or you do not have access to it.
        </p>

        <button
          type="button"
          onClick={() => router.push('/jobs')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderRadius: '8px',
            background: '#1F6F8B',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const statusBackground =
    booking.status === 'completed'
      ? '#dcfce7'
      : booking.status === 'accepted'
        ? '#dbeafe'
        : booking.status === 'declined'
          ? '#fee2e2'
          : '#fef3c7';

  const statusColor =
    booking.status === 'completed'
      ? '#16a34a'
      : booking.status === 'accepted'
        ? '#1d4ed8'
        : booking.status === 'declined'
          ? '#dc2626'
          : '#d97706';

  return (
    <div className="dashboard-content" style={{ padding: '32px 20px' }}>
      <button
        type="button"
        onClick={() => router.push('/jobs')}
        style={{
          marginBottom: '24px',
          padding: 0,
          border: 'none',
          background: 'transparent',
          color: '#1F6F8B',
          fontWeight: '700',
          cursor: 'pointer',
        }}
      >
        ← Back to Jobs
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            margin: '0 0 8px',
            color: '#0B1F2A',
            fontSize: '1.8rem',
            fontWeight: '800',
          }}
        >
          Job Details
        </h1>

        <p style={{ margin: 0, color: '#6B7280' }}>
          Review the details and current status of this job.
        </p>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 6px',
                color: '#6B7280',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              SERVICE
            </p>

            <h2
              style={{
                margin: 0,
                color: '#0B1F2A',
                fontSize: '1.35rem',
                fontWeight: '800',
              }}
            >
              {booking.service}
            </h2>
          </div>

          <span
            style={{
              display: 'inline-flex',
              padding: '7px 14px',
              borderRadius: '20px',
              background: statusBackground,
              color: statusColor,
              fontSize: '0.8rem',
              fontWeight: '700',
            }}
          >
            {booking.status}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 5px',
                color: '#6B7280',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              DATE
            </p>
            <p style={{ margin: 0, color: '#0B1F2A', fontWeight: '600' }}>
              {booking.date || 'Not specified'}
            </p>
          </div>

          <div>
            <p
              style={{
                margin: '0 0 5px',
                color: '#6B7280',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              LOCATION
            </p>
            <p style={{ margin: 0, color: '#0B1F2A', fontWeight: '600' }}>
              {booking.location || 'Not specified'}
            </p>
          </div>

          <div>
            <p
              style={{
                margin: '0 0 5px',
                color: '#6B7280',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              BOOKING ID
            </p>
            <p style={{ margin: 0, color: '#0B1F2A', fontWeight: '600' }}>
              #{booking.id}
            </p>
          </div>
        </div>

        <div
          style={{
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              margin: '0 0 8px',
              color: '#6B7280',
              fontSize: '0.8rem',
              fontWeight: '600',
            }}
          >
            JOB DESCRIPTION
          </p>

          <p
            style={{
              margin: 0,
              color: '#374151',
              lineHeight: '1.6',
            }}
          >
            {booking.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2
          style={{
            margin: '0 0 8px',
            color: '#0B1F2A',
            fontSize: '1.1rem',
            fontWeight: '800',
          }}
        >
          Estimates & Invoices
        </h2>

        <p
          style={{
            margin: '0 0 16px',
            color: '#6B7280',
            fontSize: '0.9rem',
          }}
        >
          Financial documents for this job will appear here.
        </p>

        <div
          style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '10px',
            color: '#6B7280',
            fontSize: '0.9rem',
          }}
        >
          No estimates or invoices yet.
        </div>
      </div>
    </div>
  );
}