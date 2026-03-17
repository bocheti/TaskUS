import { useAuth } from '@/hooks/useAuth';

export const DashboardScreen = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Welcome, {user?.firstName} {user?.lastName}!
      </h1>
      <p className="text-foreground">Dashboard content will go here</p>
    </div>
  );
};