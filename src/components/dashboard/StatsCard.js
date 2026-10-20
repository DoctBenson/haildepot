'use client'
import Link from 'next/link'
export default function StatsCard({
  title,
  value,
  icon,
  color = '#1F6F8B',
  onClick,
  href,
  className = '',
}) {
  const isInteractive = Boolean(href || onClick)
  const Component = href ? Link : onClick ? 'button' : 'div'

  return (
    <Component
      {...(href ? { href } : {})}
      {...(onClick && !href ? { type: 'button' } : {})}
      {...(onClick && !href ? { onClick } : {})}
      className={`dashboard-stat-card ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: isInteractive ? 'pointer' : 'default',
        textDecoration: 'none',
        ...(onClick && !href ? { width: '100%', textAlign: 'left', font: 'inherit' } : {}),
        color: 'inherit',
      }}
      onMouseEnter={(event) => {
        if (!isInteractive) return

        event.currentTarget.style.transform = 'translateY(-4px)'
        event.currentTarget.style.boxShadow =
          '0 10px 24px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(event) => {
        if (!isInteractive) return

        event.currentTarget.style.transform = 'translateY(0)'
        event.currentTarget.style.boxShadow =
          '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#6B7280',
              fontWeight: 500,
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: '10px 0 0',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#0B1F2A',
            }}
          >
            {value}
          </h2>
        </div>

        <div
          aria-hidden="true"
          style={{
            width: '56px',
            height: '56px',
            flexShrink: 0,
            borderRadius: '16px',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
    </Component>
  )
}
