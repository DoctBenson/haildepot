'use client';

import Link from 'next/link';

export default function Topbar({
  title,
  userName,
  actions,
  onLogout,
  children,
}) {                         
  return (
    <header
      style={{
        height: '72px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div>
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: '#0B1F2A',
          }}
        >
          Hail<span style={{ color: '#1F6F8B' }}>Depot</span>
        </Link>

        <h2
          style={{
            margin: '6px 0 0',
            fontSize: '1rem',
            color: '#6B7280',
            fontWeight: 500,
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {children ?? actions}

        <span
          style={{
            fontWeight: 600,
            color: '#374151',
          }}
        >
          {userName}
        </span>

        <button
          onClick={onLogout}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Log out
        </button>
      </div>
    </header>
  );
}