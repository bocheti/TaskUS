import { Task } from '@/types';

interface StatsOverviewCardProps {
  tasks: Task[];
  isLoading: boolean;
}

export const StatsOverviewCard = ({ tasks, isLoading }: StatsOverviewCardProps) => {
  // Calculate stats
  const pendingTasks = tasks.filter(task => task.status === 'Pending');
  const inProgressTasks = tasks.filter(task => task.status === 'InProgress');
  const doneTasks = tasks.filter(task => task.status === 'Done');
  
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="bg-background rounded-lg p-4 border-2 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Stats Overview
      </h3>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading stats...</p>
      ) : (
        <div className="space-y-3">
          {/* total tasks */}
          <div>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
          </div>
          {/* breakdown w progress bars */}
          <div className="space-y-3">
            {/* pending */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-foreground">{pendingTasks.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-status-pending h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (pendingTasks.length / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
            {/* in Progress */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-sm font-semibold text-foreground">{inProgressTasks.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-status-progress h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (inProgressTasks.length / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
            {/* done */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Done</span>
                <span className="text-sm font-semibold text-foreground">{doneTasks.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-status-done h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
          {/* completion rate */}
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-xl font-bold text-primary">{completionRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
};