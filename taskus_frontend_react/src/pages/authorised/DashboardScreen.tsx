import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useAuth } from '@/hooks/useAuth';

export const DashboardScreen = () => {
  const { user } = useAuth();
  return (
    <AuthorizedLayout title="My Dashboard">
      <p>Welcome, {user?.firstName} {user?.lastName}! Dashboard content goes here!</p>
    </AuthorizedLayout>
  );
};