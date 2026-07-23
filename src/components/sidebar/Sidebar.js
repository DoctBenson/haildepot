'use client';

import {
  Home,
  Briefcase,
  Users,
  FileText,
  ShoppingCart,
  Star,
  GraduationCap,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { label: 'Home', icon: Home },
    { label: 'Jobs', icon: Briefcase },
    { label: 'Customers', icon: Users },
    { label: 'Estimates & Invoices', icon: FileText },
    { label: 'Marketplace', icon: ShoppingCart },
    { label: 'Reviews', icon: Star },
    { label: 'Academy', icon: GraduationCap },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '260px',
        minHeight: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: '32px 20px',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          margin: '0 0 40px',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#0B1F2A',
        }}
      >
        Hail<span style={{ color: '#1F6F8B' }}>Depot</span>
      </h2>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={20} strokeWidth={2} />

              <span
                style={{
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}