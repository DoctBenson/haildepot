'use client'

export default function StatsCard({
  title,
  value,
  icon,
  color = '#1F6F8B',
  onClick,

}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow =
          '0 10px 24px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow =
          '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}