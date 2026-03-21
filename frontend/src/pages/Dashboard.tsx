import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { DocenteDashboard } from './DocenteDashboard';

export const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin' || user?.role === 'division_investigacion') {
    return <AdminDashboard />;
  }
  return (
    <div className="animate-fade-in space-y-8">
      <DocenteDashboard />
    </div>
  );
};
