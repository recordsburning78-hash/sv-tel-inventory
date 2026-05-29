import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingScreen from '../ui/LoadingScreen.jsx';

export default function ProtectedRoute() {
  const { firebaseUser, loading, suspended } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (suspended) return <Navigate to="/suspended" replace />;
  return <Outlet />;
}
