'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Topbar({
  title,
  userName,
  actions,
  onLogout,
  onMenuOpen,
  isNavigationOpen = false,
  menuButtonRef,
  children,
}) {                         
  return (
    <header className="dashboard-topbar">
      <div className="topbar-heading">
        <button
          type="button"
          className="topbar-menu-button"
          aria-label="Open navigation menu"
          aria-expanded={isNavigationOpen}
          aria-controls="dashboard-navigation"
          onClick={onMenuOpen}
          ref={menuButtonRef}
        >
          <Menu size={24} aria-hidden="true" />
        </button>
        <div>
          <Link href="/" className="topbar-brand">
          Hail<span style={{ color: '#1F6F8B' }}>Depot</span>
        </Link>
          <h2 className="topbar-title">{title}</h2>
        </div>
      </div>

      <div className="topbar-actions">
        {children ?? actions}
        <span className="topbar-user">{userName}</span>
        <button onClick={onLogout} className="topbar-logout">Log out</button>
      </div>
    </header>
  );
}
