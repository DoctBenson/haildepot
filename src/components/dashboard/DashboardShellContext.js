'use client';

import { createContext, useContext } from 'react';

const DashboardShellContext = createContext({
  openNavigation: () => {},
  isNavigationOpen: false,
  setLogoutHandler: () => {},
  setNavigationTriggerRef: () => {},
});

export const DashboardShellProvider = DashboardShellContext.Provider;

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
