'use client';

import { useEffect, useRef } from 'react';

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

import SidebarItem from './SidebarItem';

const customerMenuItems = [
  { label: 'Home', icon: Home, href: '/dashboard/customer' },
  { label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { label: 'Marketplace', icon: ShoppingCart, href: '/tradespeople' },
  { label: 'Reviews', icon: Star, href: '/reviews' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

const tradespersonMenuItems = [
  { label: 'Home', icon: Home, href: '/dashboard/tradesperson' },
  { label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { label: 'Customers', icon: Users, href: '/customers' },
  { label: 'Estimates & Invoices', icon: FileText, href: '/estimates' },
  { label: 'Marketplace', icon: ShoppingCart, href: '/tradespeople' },
  { label: 'Reviews', icon: Star, href: '/reviews' },
  { label: 'Academy', icon: GraduationCap, href: '/academy' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar({
  role,
  isOpen = false,
  isDrawer = false,
  onClose,
  onLogout,
}) {
  const navigationRef = useRef(null);

  const handleItemClick = () => onClose?.();

  const menuItems =
    role === 'tradesperson'
      ? tradespersonMenuItems
      : customerMenuItems;

  const trapFocus = (event) => {
    if (!isDrawer || !isOpen || event.key !== 'Tab') return;

    const focusableElements = [
      ...navigationRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((element) => !element.hasAttribute('inert'));

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  useEffect(() => {
    if (!isDrawer || !isOpen) return;

    navigationRef.current?.querySelector('a, button')?.focus();
  }, [isDrawer, isOpen]);

  return (
    <>
      <button
        type="button"
        className={`dashboard-drawer-backdrop${isOpen ? ' is-open' : ''}`}
        aria-label="Close navigation menu"
        tabIndex={-1}
        onClick={onClose}
      />

      <aside
        ref={navigationRef}
        id="dashboard-navigation"
        className={`dashboard-sidebar${isOpen ? ' is-open' : ''}`}
        aria-label="Dashboard navigation"
        aria-hidden={isDrawer && !isOpen}
        inert={isDrawer && !isOpen}
        onKeyDown={trapFocus}
      >
        <div className="sidebar-brand">
          Hail<span>Depot</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              onClick={handleItemClick}
            />
          ))}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          Log out
        </button>
      </aside>
    </>
  );
}