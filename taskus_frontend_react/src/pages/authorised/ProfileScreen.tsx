import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'react-router-dom';

export const ProfileScreen = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  
  // If userId is provided, viewing another user's profile (admin mode)
  // If no userId, viewing own profile
  const isOwnProfile = !userId || userId === user?.userId;
  
  return (
    <AuthorizedLayout title={isOwnProfile ? 'My Profile' : 'User Profile'}>
      <p>Welcome, {user?.firstName} {user?.lastName}! Profile information for user {userId} will go here</p>
    </AuthorizedLayout>
  );  
};