import { useParams } from 'react-router-dom';

export const ProjectDetailScreen = () => {
  const { projectId } = useParams();
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">Project Details</h1>
      <p className="text-foreground">Project {projectId} details will go here</p>
    </div>
  );
};