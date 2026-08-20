'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DashboardShellProvider } from '../../components/dashboard/DashboardShellContext';
import Sidebar from '../../components/sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isMobileNavigation, setIsMobileNavigation] = useState(false);
  const [logoutHandler, setLogoutHandler] = useState(null);
  const navigationTriggerRef = useRef(null);

  const closeNavigation = useCallback((restoreFocus = true) => {
    setIsNavigationOpen((wasOpen) => {
      if (wasOpen && restoreFocus) {
        requestAnimationFrame(() => {
          const trigger = navigationTriggerRef.current?.current;
          if (trigger?.isConnected) trigger.focus();
        });
      }

      return false;
    });
  }, []);

  const setNavigationTriggerRef = useCallback((ref) => {
    navigationTriggerRef.current = ref;
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeNavigation();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [closeNavigation]);

  useEffect(() => {
    if (!isNavigationOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isNavigationOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1101px)');
    const updateNavigationMode = (event) => {
      const isDesktop = event.matches;
      setIsMobileNavigation(!isDesktop);
      if (isDesktop) closeNavigation(false);
    };

    updateNavigationMode(mediaQuery);
    mediaQuery.addEventListener('change', updateNavigationMode);
    return () => mediaQuery.removeEventListener('change', updateNavigationMode);
  }, [closeNavigation]);

  const handleLogout = () => {
    closeNavigation(false);
    logoutHandler?.();
  };

  return (
    <DashboardShellProvider value={{ openNavigation: () => setIsNavigationOpen(true), isNavigationOpen, setLogoutHandler, setNavigationTriggerRef }}>
      <div className="dashboard-shell">
        <Sidebar
          isOpen={isNavigationOpen}
          isDrawer={isMobileNavigation}
          onClose={closeNavigation}
          onLogout={handleLogout}
        />

        <main className="dashboard-main" inert={isMobileNavigation && isNavigationOpen}>
          {children}
        </main>
      </div>
    </DashboardShellProvider>
  );
}
