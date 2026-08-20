'use client';

import Topbar from '../topbar/Topbar';
import { useEffect, useRef } from 'react';
import { useDashboardShell } from './DashboardShellContext';

export default function DashboardPage({
  title,
  userName,
  onLogout,
  children,
}) {
  const { openNavigation, isNavigationOpen, setLogoutHandler, setNavigationTriggerRef } = useDashboardShell();
  const logoutHandlerRef = useRef(onLogout);
  const navigationTriggerRef = useRef(null);
  logoutHandlerRef.current = onLogout;

  useEffect(() => {
    setLogoutHandler(() => () => logoutHandlerRef.current?.());
    return () => setLogoutHandler(null);
  }, [setLogoutHandler]);

  useEffect(() => {
    setNavigationTriggerRef(navigationTriggerRef);
    return () => setNavigationTriggerRef(null);
  }, [setNavigationTriggerRef]);

  return (
    <>
      <Topbar
        title={title}
        userName={userName}
        onLogout={onLogout}
        onMenuOpen={openNavigation}
        isNavigationOpen={isNavigationOpen}
        menuButtonRef={navigationTriggerRef}
      />

      <div className="dashboard-page-content">
        {children}
      </div>
    </>
  );
}
