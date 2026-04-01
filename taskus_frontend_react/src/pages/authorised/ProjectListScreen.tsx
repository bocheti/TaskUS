import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { ProjectList } from '@/components/project/ProjectList';

export const ProjectListScreen = () => {
  return (
    <AuthorizedLayout title="My Projects">
      <ProjectList />
    </AuthorizedLayout>
  );
};