'use client';

export default function SidebarItem({ icon: Icon, label, onClick }) {
  return (
    <button type="button" className="sidebar-item" onClick={onClick}>
      <Icon size={20} strokeWidth={2} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
