import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'react-router-dom';

export const ProjectDetailScreen = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  return (
    <AuthorizedLayout title="Project Detail">
      <p>Welcome, {user?.firstName} {user?.lastName}! Project {projectId} details will go here</p>
    </AuthorizedLayout>
  );
};