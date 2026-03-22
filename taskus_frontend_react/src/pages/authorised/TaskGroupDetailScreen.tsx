import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'react-router-dom';

export const TaskGroupDetailScreen = () => {
  const { taskGroupId } = useParams();
  const { user } = useAuth();
  return (
    <AuthorizedLayout title="Project Detail">
      <p>Welcome, {user?.firstName} {user?.lastName}! Task group {taskGroupId} details will go here</p>
    </AuthorizedLayout>
  );  
};
