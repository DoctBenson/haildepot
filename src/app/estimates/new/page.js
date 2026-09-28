'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useSearchParams, useRouter } from 'next/navigation';

function NewEstimateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('booking_id');

  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [expiryDate, setExpiryDate] = useState('');
  const [discountRate, setDiscountRate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    {
      id: 1,
      description: '',
      quantity: '1',
      unit_price: '',
    },
  ]);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      if (!bookingId) {
        setError('A booking is required to create an estimate.');
        setLoading(false);
        return;
      }

      const { data, error: bookingError } = await supabase
        .from('bookings')
        .select(
          'id, customer_id, tradesperson_id, service, description, location, date, status'
        )
        .eq('id', bookingId)
        .eq('tradesperson_id', user.id)
        .single();

      if (bookingError || !data) {
        console.error('Failed to load booking:', bookingError);
        setError(
          'This booking could not be found or you do not have permission to create an estimate for it.'
        );
        setLoading(false);
        return;
      }

      setBooking(data);
      setLoading(false);
    }

    loadPage();
  }, [bookingId, router]);

  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unit_price || 0);
      const lineTotal = quantity * unitPrice;

      return {
        ...item,
        lineTotal,
      };
    });
  }, [items]);

  const subtotal = useMemo(() => {
    return calculatedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
  }, [calculatedItems]);

  const discount = useMemo(() => {
    const rate = Number(discountRate || 0);

    if (rate <= 0) {
      return 0;
    }

    return subtotal * (rate / 100);
  }, [discountRate, subtotal]);

  const tax = useMemo(() => {
    const rate = Number(taxRate || 0);

    if (rate <= 0) {
      return 0;
    }

    return (subtotal - discount) * (rate / 100);
  }, [taxRate, subtotal, discount]);

  const total = useMemo(() => {
    return subtotal - discount + tax;
  }, [subtotal, discount, tax]);

  const formatAmount = (amount) => {
    return `GHS ${Number(amount || 0).toFixed(2)}`;
  };

  const updateItem = (itemId, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now(),
        description: '',
        quantity: '1',
        unit_price: '',
      },
    ]);
  };

  const removeItem = (itemId) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter((item) => item.id !== itemId);
    });
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setError('');

    if (!booking) {
      setError('Booking information is unavailable.');
      return;
    }

    const preparedItems = items.map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    }));

    const invalidItem = preparedItems.find(
      (item) =>
        !item.description ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unit_price) ||
        item.unit_price < 0
    );

    if (invalidItem) {
      setError(
        'Please provide a valid description, quantity, and unit price for every item.'
      );
      return;
    }

    const parsedDiscountRate =
      discountRate === '' ? null : Number(discountRate);

    const parsedTaxRate =
      taxRate === '' ? null : Number(taxRate);

    if (
      parsedDiscountRate !== null &&
      (!Number.isFinite(parsedDiscountRate) ||
        parsedDiscountRate < 0 ||
        parsedDiscountRate > 100)
    ) {
      setError('Discount rate must be between 0 and 100%.');
      return;
    }

    if (
      parsedTaxRate !== null &&
      (!Number.isFinite(parsedTaxRate) || parsedTaxRate < 0)
    ) {
      setError('Tax rate cannot be negative.');
      return;
    }

    setSaving(true);

    const { data, error: rpcError } = await supabase.rpc(
      'create_estimate',
      {
        p_booking_id: booking.id,
        p_items: preparedItems,
        p_discount_rate: parsedDiscountRate,
        p_tax_rate: parsedTaxRate,
        p_expiry_date: expiryDate || null,
        p_notes: notes.trim() || null,
        p_currency: 'GHS',
      }
    );

    if (rpcError) {
      console.error('Failed to create estimate:', rpcError);
      setError(
        rpcError.message || 'Failed to create estimate. Please try again.'
      );
      setSaving(false);
      return;
    }

    const createdEstimate = Array.isArray(data) ? data[0] : data;

    if (!createdEstimate?.estimate_id) {
      console.error('Unexpected create_estimate response:', data);
      setError('The estimate was created but its ID could not be retrieved.');
      setSaving(false);
      return;
    }

    router.push(`/estimates/${createdEstimate.estimate_id}`);
  };

  if (loading) {
    return (
      <div
        className="dashboard-content"
        style={{ padding: '32px 20px' }}
      >
        <p style={{ color: '#6B7280' }}>Loading estimate form...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error && !booking) {
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
          Create Estimate
        </h1>

        <p
          style={{
            margin: '0 0 20px',
            color: '#DC2626',
            lineHeight: '1.5',
          }}
        >
          {error}
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

  return (
    <div
      className="dashboard-content create-estimate-page"
      style={{ padding: '32px 20px' }}
    >
      <style jsx global>{`
        .create-estimate-page {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: clamp(16px, 4vw, 32px) clamp(12px, 4vw, 20px) !important;
          overflow-wrap: anywhere;
        }

        .create-estimate-page *,
        .create-estimate-page *::before,
        .create-estimate-page *::after {
          box-sizing: border-box;
          min-width: 0;
        }

        .create-estimate-page p,
        .create-estimate-page label,
        .create-estimate-page span,
        .create-estimate-page strong {
          overflow-wrap: anywhere;
        }

        .create-estimate-page input,
        .create-estimate-page textarea {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .create-estimate-page .create-estimate-card {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .create-estimate-page .estimate-item-card {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .create-estimate-page .job-info-grid {
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)) !important;
        }

        .create-estimate-page .estimate-items-grid {
          display: grid !important;
          grid-template-columns: minmax(0, 2fr) minmax(64px, 0.7fr) minmax(0, 1fr) minmax(0, 1fr) auto !important;
          align-items: end;
        }

        .create-estimate-page .estimate-details-grid {
          grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) !important;
        }

        .create-estimate-page .estimate-rate-grid {
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)) !important;
        }

        .create-estimate-page button {
          max-width: 100%;
          min-height: 44px;
          white-space: normal;
        }

        @media (max-width: 760px) {
          .create-estimate-page .estimate-items-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            grid-template-areas:
              'description description'
              'quantity price'
              'total remove';
            gap: 12px !important;
          }

          .create-estimate-page .estimate-items-grid > :nth-child(1) {
            grid-area: description;
          }

          .create-estimate-page .estimate-items-grid > :nth-child(2) {
            grid-area: quantity;
          }

          .create-estimate-page .estimate-items-grid > :nth-child(3) {
            grid-area: price;
          }

          .create-estimate-page .estimate-items-grid > :nth-child(4) {
            grid-area: total;
          }

          .create-estimate-page .estimate-items-grid > :nth-child(5) {
            grid-area: remove;
            align-self: end;
          }

          .create-estimate-page .estimate-details-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .create-estimate-page .create-estimate-card {
            padding: 16px !important;
          }

          .create-estimate-page .estimate-item-card {
            padding: 12px !important;
          }
        }
      `}</style>

      <button
        type="button"
        onClick={() =>
          booking
            ? router.push(`/jobs/${booking.id}`)
            : router.push('/jobs')
        }
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
        ← Back to Job
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
          Create Estimate
        </h1>

        <p
          style={{
            margin: 0,
            color: '#6B7280',
            fontSize: '0.95rem',
          }}
        >
          Prepare an estimate for this HailDepot job.
        </p>
      </div>

      {error && (
        <div
          className="create-estimate-card"
          style={{
            marginBottom: '20px',
            padding: '14px 16px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#b91c1c',
            fontSize: '0.9rem',
            lineHeight: '1.5',
          }}
        >
          {error}
        </div>
      )}

      <div
        className="create-estimate-card"
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
            margin: '0 0 20px',
            color: '#0B1F2A',
            fontSize: '1.1rem',
            fontWeight: '800',
          }}
        >
          Job Information
        </h2>

        <div
          className="job-info-grid"
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
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              SERVICE
            </p>
            <p
              style={{
                margin: 0,
                color: '#0B1F2A',
                fontWeight: '700',
              }}
            >
              {booking.service || 'Not specified'}
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

          <div>
            <p
              style={{
                margin: '0 0 5px',
                color: '#6B7280',
                fontSize: '0.75rem',
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
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              BOOKING ID
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
        </div>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              margin: '0 0 8px',
              color: '#6B7280',
              fontSize: '0.75rem',
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
        className="create-estimate-card"
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
            marginBottom: '20px',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 8px',
                color: '#0B1F2A',
                fontSize: '1.1rem',
                fontWeight: '800',
              }}
            >
              Estimate Items
            </h2>

            <p
              style={{
                margin: 0,
                color: '#6B7280',
                fontSize: '0.9rem',
              }}
            >
              Add the labour, materials, and other charges for this job.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            style={{
              padding: '9px 14px',
              border: '1px solid #1F6F8B',
              borderRadius: '8px',
              background: 'white',
              color: '#1F6F8B',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            + Add Item
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {calculatedItems.map((item, index) => (
            <div
              className="estimate-item-card"
              key={item.id}
              style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                className="estimate-items-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(0, 2fr) minmax(64px, 0.7fr) minmax(0, 1fr) minmax(0, 1fr) auto',
                  gap: '12px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: '#374151',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    DESCRIPTION
                  </label>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        'description',
                        event.target.value
                      )
                    }
                    placeholder="e.g. PPR pipe installation"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: '#374151',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    QTY
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        'quantity',
                        event.target.value
                      )
                    }
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: '#374151',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    UNIT PRICE (GHS)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        'unit_price',
                        event.target.value
                      )
                    }
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: '#374151',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    LINE TOTAL
                  </label>

                  <div
                    style={{
                      padding: '10px 12px',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#0B1F2A',
                      fontWeight: '700',
                    }}
                  >
                    {formatAmount(item.lineTotal)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  style={{
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '8px',
                    background:
                      items.length === 1 ? '#e5e7eb' : '#fee2e2',
                    color:
                      items.length === 1 ? '#9ca3af' : '#dc2626',
                    fontWeight: '700',
                    cursor:
                      items.length === 1
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>

              {index === 0 && (
                <p
                  style={{
                    margin: '10px 0 0',
                    color: '#9ca3af',
                    fontSize: '0.75rem',
                  }}
                >
                  Quantity can be fractional for materials sold by
                  length, weight, or similar units.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="estimate-details-grid"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.5fr) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'start',
          marginBottom: '20px',
        }}
      >
        <div
          className="create-estimate-card"
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              color: '#0B1F2A',
              fontSize: '1.1rem',
              fontWeight: '800',
            }}
          >
            Additional Details
          </h2>

          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="expiry-date"
              style={{
                display: 'block',
                marginBottom: '6px',
                color: '#374151',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              EXPIRY DATE
            </label>

            <input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="notes"
              style={{
                display: 'block',
                marginBottom: '6px',
                color: '#374151',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              NOTES
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add payment terms, assumptions, warranty details, or other notes."
              rows={5}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div
            className="estimate-rate-grid"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label
                htmlFor="discount-rate"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: '#374151',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                DISCOUNT (%)
              </label>

              <input
                id="discount-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountRate}
                onChange={(event) =>
                  setDiscountRate(event.target.value)
                }
                placeholder="0"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="tax-rate"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: '#374151',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                TAX (%)
              </label>

              <input
                id="tax-rate"
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(event) =>
                  setTaxRate(event.target.value)
                }
                placeholder="0"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="create-estimate-card"
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              color: '#0B1F2A',
              fontSize: '1.1rem',
              fontWeight: '800',
            }}
          >
            Estimate Summary
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                color: '#374151',
              }}
            >
              <span>Subtotal</span>
              <strong>{formatAmount(subtotal)}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                color: '#374151',
              }}
            >
              <span>
                Discount
                {discountRate !== '' ? ` (${discountRate}%)` : ''}
              </span>
              <strong>- {formatAmount(discount)}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                color: '#374151',
              }}
            >
              <span>
                Tax
                {taxRate !== '' ? ` (${taxRate}%)` : ''}
              </span>
              <strong>{formatAmount(tax)}</strong>
            </div>

            <div
              style={{
                marginTop: '8px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <span
                style={{
                  color: '#0B1F2A',
                  fontWeight: '800',
                }}
              >
                Total
              </span>

              <strong
                style={{
                  color: '#1F6F8B',
                  fontSize: '1.15rem',
                  fontWeight: '800',
                }}
              >
                {formatAmount(total)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() =>
            booking
              ? router.push(`/jobs/${booking.id}`)
              : router.push('/jobs')
          }
          disabled={saving}
          style={{
            padding: '11px 18px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: 'white',
            color: '#374151',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '11px 20px',
            border: 'none',
            borderRadius: '8px',
            background: saving ? '#94a3b8' : '#1F6F8B',
            color: 'white',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving Estimate...' : 'Save Draft'}
        </button>
      </div>
    </div>
  );
}

export default function NewEstimatePage() {
  return (
    <Suspense
      fallback={
        <div
          className="dashboard-content"
          style={{ padding: '32px 20px' }}
        >
          <p style={{ color: '#6B7280' }}>Loading estimate form...</p>
        </div>
      }
    >
      <NewEstimateForm />
    </Suspense>
  );
}
