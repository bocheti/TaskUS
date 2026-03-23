import { Task } from '@/types';

interface RecentCompletedCardProps {
  tasks: Task[];
  isLoading: boolean;
}

export const RecentCompletedCard = ({ tasks, isLoading }: RecentCompletedCardProps) => {
  const recentlyCompleted = tasks
    .filter(task => task.status === 'Done' && task.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);
  return (
    <div className="bg-background rounded-lg p-4 border-2 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Recently Completed
      </h3>
      
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : recentlyCompleted.length === 0 ? (
        <p className="text-muted-foreground text-sm">No completed tasks yet.</p>
      ) : (
        <div className="space-y-2">
          {recentlyCompleted.map(task => (
            <div key={task.taskId} className="pb-2 border-b border-border last:border-0">
              <p className="text-sm font-medium text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(task.completedAt!).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};