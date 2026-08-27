'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarItem({
  icon: Icon,
  label,
  href = '#',
  onClick,
}) {
  const pathname = usePathname();

  const isActive =
    href !== '#' &&
    (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`sidebar-item${isActive ? ' is-active' : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        size={20}
        strokeWidth={2}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}