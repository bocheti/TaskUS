import { Task } from '@/types';
import { X, Calendar, Clock, User, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { taskService, userService } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export const TaskModal = ({ task, isOpen, onClose, onTaskUpdated }: TaskModalProps) => {
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(task);
  const { user } = useAuth();
  const [responsibleUser, setResponsibleUser] = useState<{ firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    const fetchResponsibleUser = async () => {
      try {
        const user = await userService.getUserInfo(currentTask.responsibleId);
        setResponsibleUser({ firstName: user.firstName, lastName: user.lastName });
      } catch (error) {
        console.error('Error fetching responsible user:', error);
      }
    };

    fetchResponsibleUser();
  }, [currentTask.responsibleId]);
  
  if (!isOpen) return null;

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);

    try {
      let newStatus: 'Pending' | 'InProgress' | 'Done';
      if (currentTask.status === 'Pending') {
        newStatus = 'InProgress';
      } else if (currentTask.status === 'InProgress') {
        newStatus = 'Done';
      } else {
        newStatus = 'Pending';
      }

      const updatedTask = await taskService.updateTaskStatus(currentTask.id, { newStatus });
      setCurrentTask(updatedTask);
      toast.success(`Task status updated to ${newStatus}`);
      
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    } catch {
      toast.error('Failed to update task status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteTask = async () => {
    setIsDeleteDialogOpen(false);
    try {
      await taskService.deleteTask(currentTask.id);
      toast.success('Task deleted successfully');
      onClose();
      if (onTaskUpdated) {
        window.location.reload();
      }
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const getStatusColor = () => {
    switch (currentTask.status) {
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

  const getNextStatusText = () => {
    if (currentTask.status === 'Pending') return 'Start Working';
    if (currentTask.status === 'InProgress') return 'Mark as Done';
    return 'Restart Task';
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline';
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineMidnight = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    
    const diffTime = deadlineMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due on ${deadlineDate.toLocaleDateString()}`;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg">
        <div className="sticky top-0 bg-background border-b-2 border-border p-6 flex items-start justify-between">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{currentTask.title}</h2>
              <div className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
            </div>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium text-foreground">{currentTask.status == 'InProgress' ? 'In Progress' : currentTask.status}</span>
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-foreground hover:text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
            <p className="text-foreground">{currentTask.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="text-foreground font-medium">
                {new Date(currentTask.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className={`font-medium ${
                currentTask.deadline && new Date(currentTask.deadline) < new Date() 
                  ? 'text-status-pending' 
                  : 'text-foreground'
              }`}>
                {formatDeadline(currentTask.deadline)}
              </span>
            </div>

            {currentTask.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Completed:</span>
                <span className="text-foreground font-medium">
                  {new Date(currentTask.completedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="text-foreground font-medium">
                {responsibleUser 
                  ? `${responsibleUser.firstName} ${responsibleUser.lastName}${currentTask.responsibleId === user?.id ? ' (You)' : ''}`
                  : 'Loading...'
                }
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            {(user?.role === "admin" || currentTask.responsibleId === user?.id) ? (
              <div className="flex gap-3">
                <button
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTogglingStatus ? 'Updating...' : getNextStatusText()}
                </button>
                
                {user?.role === 'admin' && (
                  <button
                    onClick={handleDeleteClick}
                    className="px-4 py-3 rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-2">
                This task is assigned to another user.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${currentTask.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        onConfirm={executeDeleteTask}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};