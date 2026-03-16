import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    if (!user) {
      toast.error('Please log in to access this page');
      hasShownToast.current = true;
    } else if (requireAdmin && user.role !== 'admin') {
      toast.error('You need admin privileges to access this page');
      hasShownToast.current = true;
    }
  }, [user, requireAdmin]);

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin when admin is required
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed
  return <>{children}</>;
};