'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

export default function EstimatesPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEstimates() {
      setLoading(true);

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
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (profileData?.role !== 'tradesperson') {
        setEstimates([]);
        setLoading(false);
        return;
      }

      const { data: estimatesData, error: estimatesError } = await supabase
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
          tax,
          discount,
          total,
          notes
        `)
        .order('id', { ascending: false });

      if (estimatesError) {
        console.error('Failed to load estimates:', estimatesError);
        setEstimates([]);
      } else {
        setEstimates(estimatesData || []);
      }

      setLoading(false);
    }

    loadEstimates();
  }, [router]);

  if (loading) {
    return (
      <div className="dashboard-content">
        <div
          style={{
            padding: '32px 20px',
            color: '#6B7280',
          }}
        >
          Loading estimates...
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (profile.role !== 'tradesperson') {
    return (
      <div className="dashboard-content">
        <div
          style={{
            padding: '32px 20px',
          }}
        >
          <h1
            style={{
              margin: '0 0 8px',
              color: '#0B1F2A',
              fontSize: '1.8rem',
              fontWeight: '800',
            }}
          >
            Estimates
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6B7280',
            }}
          >
            Estimates are currently available to tradespeople.
          </p>
        </div>
      </div>
    );
  }

  const formatAmount = (amount, currency = 'GHS') => {
    const numericAmount = Number(amount || 0);

    return `${currency} ${numericAmount.toFixed(2)}`;
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

  return (
    <div className="dashboard-content">
      <div
        style={{
          padding: '32px 20px',
        }}
      >
        <div
          style={{
            marginBottom: '32px',
          }}
        >
          <h1
            style={{
              margin: '0 0 8px',
              color: '#0B1F2A',
              fontSize: '1.8rem',
              fontWeight: '800',
            }}
          >
            Estimates
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6B7280',
              fontSize: '0.95rem',
            }}
          >
            Create, manage, and track estimates for your jobs.
          </p>
        </div>

        {estimates.length === 0 ? (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2
              style={{
                margin: '0 0 8px',
                color: '#0B1F2A',
                fontSize: '1.15rem',
                fontWeight: '800',
              }}
            >
              No estimates yet
            </h2>

            <p
              style={{
                margin: 0,
                color: '#6B7280',
                fontSize: '0.9rem',
              }}
            >
              Estimates you create for your HailDepot jobs will appear here.
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
            {estimates.map((estimate) => (
              <div
                key={estimate.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '18px',
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
                        fontSize: '1.15rem',
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
                      padding: '6px 14px',
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
                      'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '18px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 5px',
                        color: '#6B7280',
                        fontSize: '0.75rem',
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
                        fontSize: '0.75rem',
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
                      {estimate.issue_date || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: '0 0 5px',
                        color: '#6B7280',
                        fontSize: '0.75rem',
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
                      {estimate.expiry_date || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: '0 0 5px',
                        color: '#6B7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      TOTAL
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: '#1F6F8B',
                        fontWeight: '800',
                      }}
                    >
                      {formatAmount(
                        estimate.total,
                        estimate.currency || 'GHS'
                      )}
                    </p>
                  </div>
                </div>

                {estimate.notes && (
                  <div
                    style={{
                      marginTop: '18px',
                      paddingTop: '16px',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 5px',
                        color: '#6B7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      NOTES
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: '#374151',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                      }}
                    >
                      {estimate.notes}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/estimates/${estimate.id}`)
                    }
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#1F6F8B',
                      color: 'white',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    View Estimate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}