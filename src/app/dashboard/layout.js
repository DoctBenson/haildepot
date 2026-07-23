import Sidebar from '../../components/sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f9fafb',
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </main>
    </div>
  );
}