import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useState, useEffect } from 'react';
import { taskService } from '@/services/api';
import { Task, TaskStatus } from '@/types';
import { toast } from 'sonner';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type FilterStatus = 'All' | TaskStatus;

export const AllTasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const userTasks = await taskService.getTasksByUser();
      setTasks(userTasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = filterStatus === 'All' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  const statusCounts = {
    All: tasks.length,
    Pending: tasks.filter(t => t.status === 'Pending').length,
    InProgress: tasks.filter(t => t.status === 'InProgress').length,
    Done: tasks.filter(t => t.status === 'Done').length,
  };

  const getStatusDotColor = (status: FilterStatus) => {
    switch (status) {
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

  return (
    <AuthorizedLayout title="All Tasks">
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
            <ArrowLeft className="h-4 w-4" />
            Back
            </button>
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto ml-auto max-w-full">
            {(['All', 'Pending', 'InProgress', 'Done'] as FilterStatus[]).map((status) => (
                <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center justify-center px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                    filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border-2 border-border text-foreground hover:bg-muted'
                }`}
                >
                {/* Mobile */}
                <span className="sm:hidden flex items-center">
                    {status === 'All' ? (
                    'All'
                    ) : (
                    <span className={`w-3 h-3 rounded-full ${getStatusDotColor(status)}`} />
                    )}
                </span>

                {/* Desktop */}
                <span className="hidden sm:inline">
                    {status === 'InProgress' ? 'In Progress' : status}
                </span>

                <span className="ml-1 md:ml-2 text-xs md:text-sm opacity-75 hidden sm:inline">
                    ({statusCounts[status]})
                </span>
                </button>
            ))}
            </div>
          </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-background rounded-lg border-2 border-border">
            <p className="text-muted-foreground">
              {filterStatus === 'All' 
                ? "You don't have any tasks yet"
                : `No ${filterStatus === 'InProgress' ? 'In Progress' : filterStatus.toLowerCase()} tasks`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredTasks.map(task => (
            <div key={task.id} className="min-w-0">
                <TaskCard
                task={task}
                onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                }}
                />
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={(updatedTask) => {
            setTasks(tasks.map(t => 
              t.id === updatedTask.id ? updatedTask : t
            ));
          }}
        />
      )}
    </AuthorizedLayout>
  );
};