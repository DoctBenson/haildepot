'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useParams, useRouter } from 'next/navigation';

export default function EstimateDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [items, setItems] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEstimate() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: estimateData, error: estimateError } =
        await supabase
          .from('estimates')
          .select(`
            id,
            booking_id,
            estimate_number,
            status,
            issue_date,
            expiry_date,
            currency,
            subtotal,
            tax_rate,
            tax,
            discount_rate,
            discount,
            total,
            notes
          `)
          .eq('id', id)
          .single();

      if (estimateError) {
        console.error('Failed to load estimate:', estimateError);
        setEstimate(null);
        setLoading(false);
        return;
      }

      setEstimate(estimateData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('estimate_items')
        .select(`
          id,
          estimate_id,
          description,
          quantity,
          unit_price,
          line_total
        `)
        .eq('estimate_id', estimateData.id)
        .order('id', { ascending: true });

      if (itemsError) {
        console.error('Failed to load estimate items:', itemsError);
        setItems([]);
      } else {
        setItems(itemsData || []);
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_id,
          tradesperson_id,
          service,
          description,
          location,
          date,
          status
        `)
        .eq('id', estimateData.booking_id)
        .single();

      if (bookingError) {
        console.error('Failed to load booking:', bookingError);
        setBooking(null);
      } else {
        setBooking(bookingData);
      }

      setLoading(false);
    }

    if (id) {
      loadEstimate();
    }
  }, [id, router]);

  const formatAmount = (amount, currency = 'GHS') => {
    const numericAmount = Number(amount || 0);

    return `${currency} ${numericAmount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Not specified';
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-GH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'approved':
        return '#dcfce7';
      case 'rejected':
        return '#fee2e2';
      case 'expired':
        return '#f3f4f6';
      case 'sent':
        return '#dbeafe';
      case 'draft':
      default:
        return '#fef3c7';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#16a34a';
      case 'rejected':
        return '#dc2626';
      case 'expired':
        return '#6B7280';
      case 'sent':
        return '#1d4ed8';
      case 'draft':
      default:
        return '#d97706';
    }
  };

  if (loading) {
    return (
      <div
        className="dashboard-content"
        style={{ padding: '32px 20px' }}
      >
        <p style={{ color: '#6B7280' }}>Loading estimate...</p>
      </div>
    );
  }

  if (!user || !estimate) {
    return (
      <div
        className="dashboard-content"
        style={{ padding: '32px 20px' }}
      >
        <h1
          style={{
            margin: '0 0 8px',
            color: '#0B1F2A',
            fontSize: '1.8rem',
            fontWeight: '800',
          }}
        >
          Estimate not found
        </h1>

        <p
          style={{
            color: '#6B7280',
            marginBottom: '20px',
          }}
        >
          This estimate could not be found or you do not have
          access to it.
        </p>

        <button
          type="button"
          onClick={() => router.push('/estimates')}
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
          Back to Estimates
        </button>
      </div>
    );
  }

  return (
    <div
      className="dashboard-content"
      style={{ padding: '32px 20px' }}
    >
      <button
        type="button"
        onClick={() => router.push('/estimates')}
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
        ← Back to Estimates
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
          Estimate Details
        </h1>

        <p
          style={{
            margin: 0,
            color: '#6B7280',
          }}
        >
          Review the estimate and the items included in it.
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
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              ESTIMATE
            </p>

            <h2
              style={{
                margin: 0,
                color: '#0B1F2A',
                fontSize: '1.35rem',
                fontWeight: '800',
              }}
            >
              {estimate.estimate_number ||
                `Estimate #${estimate.id}`}
            </h2>
          </div>

          <span
            style={{
              display: 'inline-flex',
              padding: '7px 14px',
              borderRadius: '20px',
              background: getStatusBackground(estimate.status),
              color: getStatusColor(estimate.status),
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'capitalize',
            }}
          >
            {estimate.status || 'draft'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
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
              JOB
            </p>

            <p
              style={{
                margin: 0,
                color: '#0B1F2A',
                fontWeight: '600',
              }}
            >
              #{estimate.booking_id}
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
              ISSUE DATE
            </p>

            <p
              style={{
                margin: 0,
                color: '#0B1F2A',
                fontWeight: '600',
              }}
            >
              {formatDate(estimate.issue_date)}
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
              EXPIRY DATE
            </p>

            <p
              style={{
                margin: 0,
                color: '#0B1F2A',
                fontWeight: '600',
              }}
            >
              {formatDate(estimate.expiry_date)}
            </p>
          </div>

          {booking && (
            <div>
              <p
                style={{
                  margin: '0 0 5px',
                  color: '#6B7280',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                SERVICE
              </p>

              <p
                style={{
                  margin: 0,
                  color: '#0B1F2A',
                  fontWeight: '600',
                }}
              >
                {booking.service || 'Not specified'}
              </p>
            </div>
          )}
        </div>
      </div>

      {booking && (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 18px',
              color: '#0B1F2A',
              fontSize: '1.1rem',
              fontWeight: '800',
            }}
          >
            Job Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
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
                JOB ID
              </p>

              <p
                style={{
                  margin: 0,
                  color: '#0B1F2A',
                  fontWeight: '600',
                }}
              >
                #{booking.id}
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

              <p
                style={{
                  margin: 0,
                  color: '#0B1F2A',
                  fontWeight: '600',
                }}
              >
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
                JOB DATE
              </p>

              <p
                style={{
                  margin: 0,
                  color: '#0B1F2A',
                  fontWeight: '600',
                }}
              >
                {booking.date || 'Not specified'}
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: '18px',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <p
              style={{
                margin: '0 0 7px',
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
      )}

      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            margin: '0 0 18px',
            color: '#0B1F2A',
            fontSize: '1.1rem',
            fontWeight: '800',
          }}
        >
          Estimate Items
        </h2>

        {items.length === 0 ? (
          <div
            style={{
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '10px',
              color: '#6B7280',
              fontSize: '0.9rem',
            }}
          >
            No items have been added to this estimate yet.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(180px, 1fr) 80px 120px 120px',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: '#0B1F2A',
                      fontWeight: '600',
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      color: '#374151',
                      fontSize: '0.9rem',
                    }}
                  >
                    {Number(item.quantity)}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      color: '#374151',
                      fontSize: '0.9rem',
                    }}
                  >
                    {formatAmount(
                      item.unit_price,
                      estimate.currency
                    )}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      color: '#0B1F2A',
                      fontWeight: '700',
                    }}
                  >
                    {formatAmount(
                      item.line_total,
                      estimate.currency
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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
            maxWidth: '420px',
            marginLeft: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              padding: '8px 0',
            }}
          >
            <span style={{ color: '#6B7280' }}>Subtotal</span>
            <strong style={{ color: '#0B1F2A' }}>
              {formatAmount(
                estimate.subtotal,
                estimate.currency
              )}
            </strong>
          </div>

          {estimate.discount !== null &&
            estimate.discount !== undefined && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                  padding: '8px 0',
                }}
              >
                <span style={{ color: '#6B7280' }}>
                  Discount
                  {estimate.discount_rate !== null &&
                    estimate.discount_rate !== undefined
                    ? ` (${estimate.discount_rate}%)`
                    : ''}
                </span>

                <strong style={{ color: '#0B1F2A' }}>
                  -{formatAmount(
                    estimate.discount,
                    estimate.currency
                  )}
                </strong>
              </div>
            )}

          {estimate.tax !== null &&
            estimate.tax !== undefined && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                  padding: '8px 0',
                }}
              >
                <span style={{ color: '#6B7280' }}>
                  Tax
                  {estimate.tax_rate !== null &&
                    estimate.tax_rate !== undefined
                    ? ` (${estimate.tax_rate}%)`
                    : ''}
                </span>

                <strong style={{ color: '#0B1F2A' }}>
                  {formatAmount(
                    estimate.tax,
                    estimate.currency
                  )}
                </strong>
              </div>
            )}

          <div
            style={{
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: '#0B1F2A',
                fontSize: '1rem',
                fontWeight: '800',
              }}
            >
              Total
            </span>

            <strong
              style={{
                color: '#1F6F8B',
                fontSize: '1.25rem',
                fontWeight: '800',
              }}
            >
              {formatAmount(
                estimate.total,
                estimate.currency
              )}
            </strong>
          </div>
        </div>
      </div>

      {estimate.notes && (
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
              margin: '0 0 10px',
              color: '#0B1F2A',
              fontSize: '1.1rem',
              fontWeight: '800',
            }}
          >
            Notes
          </h2>

          <p
            style={{
              margin: 0,
              color: '#374151',
              lineHeight: '1.6',
            }}
          >
            {estimate.notes}
          </p>
        </div>
      )}
    </div>
  );
}