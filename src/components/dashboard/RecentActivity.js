
import Link from 'next/link'
import {
  Calendar,
  CheckCircle,
  Wrench,
} from 'lucide-react'

export default function RecentActivity({ activities = [] }) {
  const icons = {
    booking: <Calendar size={18} color="#1F6F8B" />,
    completed: <CheckCircle size={18} color="#10B981" />,
    profile: <Wrench size={18} color="#F59E0B" />,
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        minWidth: 0,
      }}
    >
      <h2
        style={{
          margin: '0 0 20px',
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#0B1F2A',
        }}
      >
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <p style={{ color: '#6B7280', margin: 0 }}>
          No recent activity.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {activities.map((activity, index) => {
            const isClickable = Boolean(activity.bookingId)
            const Row = isClickable ? Link : 'div'

            return (
              <Row
                key={activity.bookingId ?? `${activity.type}-${index}`}
                {...(isClickable
                  ? { href: `/jobs/${activity.bookingId}` }
                  : {})}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  margin: '-8px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'background-color 150ms ease',
                  minWidth: 0,
                }}
                onMouseEnter={(event) => {
                  if (isClickable) {
                    event.currentTarget.style.backgroundColor = '#F8FAFC'
                  }
                }}
                onMouseLeave={(event) => {
                  if (isClickable) {
                    event.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
                onFocus={(event) => {
                  if (isClickable) {
                    event.currentTarget.style.outline = '2px solid #1F6F8B'
                    event.currentTarget.style.outlineOffset = '3px'
                  }
                }}
                onBlur={(event) => {
                  event.currentTarget.style.outline = 'none'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    flexShrink: 0,
                  }}
                >
                  {icons[activity.type] ?? <Calendar size={18} color="#1F6F8B" />}
                </div>

                <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: '600',
                      color: '#0B1F2A',
                    }}
                  >
                    {activity.title}
                  </p>

                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '0.85rem',
                      color: '#6B7280',
                    }}
                  >
                    {activity.time}
                  </p>
                </div>
              </Row>
            )
          })}
        </div>
      )}
    </div>
  )
}
