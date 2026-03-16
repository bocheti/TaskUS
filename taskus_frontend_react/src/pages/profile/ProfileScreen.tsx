import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'react-router-dom';

export const ProfileScreen = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  
  // If userId is provided, viewing another user's profile (admin mode)
  // If no userId, viewing own profile
  const isOwnProfile = !userId || userId === user?.userId;
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        {isOwnProfile ? 'My Profile' : 'User Profile'}
      </h1>
      <p className="text-foreground">Profile content will go here</p>
    </div>
  );
};