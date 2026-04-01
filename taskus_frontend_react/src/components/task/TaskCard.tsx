import { Task } from '@/types';
import { Calendar, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  // Determine status color
  const getStatusColor = () => {
    switch (task.status) {
      case 'Pending':
        return 'bg-status-pending';
      case 'InProgress':
        return 'bg-status-progress';
      case 'Done':
        return 'bg-status-done';
      default:
        return 'bg-muted';
    }
  };

    const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
        return { text: 'Invalid date', isOverdue: false };
    }
    
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineMidnight = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const diffTime = deadlineMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // check if overdue
    if (diffDays < 0) {
        return { text: `Overdue by ${Math.abs(diffDays)} days`, isOverdue: true };
    } else if (diffDays === 0) {
        return { text: 'Due today', isOverdue: false };
    } else if (diffDays === 1) {
        return { text: 'Due tomorrow', isOverdue: false };
    } else if (diffDays <= 7) {
        return { text: `Due in ${diffDays} days`, isOverdue: false };
    } else {
        return { text: deadlineDate.toLocaleDateString(), isOverdue: false };
    }
    };

  const deadlineInfo = formatDeadline(task.deadline);

  return (
    <div
      onClick={onClick}
      className={`bg-background rounded-lg p-4 border-2 border-border transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-foreground flex-1">{task.title}</h4>
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} flex-shrink-0 mt-1`} />
      </div>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {task.description}
      </p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        {deadlineInfo && (
          <div className={`flex items-center gap-1 ${deadlineInfo.isOverdue ? 'text-status-pending font-semibold' : ''}`}>
            <Clock size={14} />
            <span>{deadlineInfo.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};