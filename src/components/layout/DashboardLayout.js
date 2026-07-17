import Sidebar from "../sidebar/Sidebar";
import Topbar from "../topbar/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">

        {/* Top Navigation */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>

    </div>
  );
}