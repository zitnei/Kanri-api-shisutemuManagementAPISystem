import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FullPageSpinner } from '../ui/Spinner';

export function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex">
      <Sidebar />

      {/* Main content area with sidebar offset */}
      <div className="flex-1 flex flex-col min-h-screen ml-64 transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
