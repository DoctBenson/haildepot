'use client';

import Topbar from '../topbar/Topbar';

export default function DashboardPage({
  title,
  userName,
  onLogout,
  children,
}) {
  return (
    <>
      <Topbar
        title={title}
        userName={userName}
        onLogout={onLogout}
      />

      <div
        style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </>
  );
}