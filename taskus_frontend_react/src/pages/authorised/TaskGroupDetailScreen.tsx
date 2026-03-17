import { useParams } from 'react-router-dom';

export const TaskGroupDetailScreen = () => {
  const { taskGroupId } = useParams();
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">Task Group Details</h1>
      <p className="text-foreground">Task group {taskGroupId} details will go here</p>
    </div>
  );
};