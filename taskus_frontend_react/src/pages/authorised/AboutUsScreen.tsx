import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useAuth } from '@/hooks/useAuth';

export const AboutUsScreen = () => {
  const { user } = useAuth();
  return (
    <AuthorizedLayout title="About Us">
      <p>Welcome, {user?.firstName} {user?.lastName}! About Us content goes here!</p>
    </AuthorizedLayout>
  );
};