import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    // Not an admin, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Is admin, render children
  return children;
};

export default AdminRoute; 