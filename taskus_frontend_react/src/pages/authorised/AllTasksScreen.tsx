import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useState, useEffect } from 'react';
import { taskService } from '@/services/api';
import { Task, TaskStatus } from '@/types';
import { toast } from 'sonner';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { KanbanBoard } from '@/components/task/KanbanBoard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type FilterStatus = 'All' | TaskStatus;

export const AllTasksScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      let userTasks: Task[] = [];
        if (user?.role === 'admin') {
          userTasks = await taskService.getAllTasks();
        } else {
          userTasks = await taskService.getTasksByUser(user!.id);
        }
      userTasks.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
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

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await taskService.updateTaskStatus(taskId, { newStatus });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      toast.success(`Task moved to ${newStatus}`);
    } catch {
      toast.error('Failed to update task status');
    }
  };

  return (
    <AuthorizedLayout title="All Tasks">
      { isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner/>
          <p className="text-muted-foreground animate-pulse">Loading all tasks...</p>
        </div>
      ) : 
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 w-full relative min-h-[56px]">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground z-10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* View Mode Toggle */}
            <div className="flex justify-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 w-full sm:w-auto">
              <div className="bg-muted p-1 rounded-full inline-flex gap-1 text-sm lg:text-lg">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-4 sm:px-4 py-2 rounded-full font-medium transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Kanban View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 sm:px-4 py-2 rounded-full font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>
          </div>

          { viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
              onStatusChange={handleStatusChange}
            />
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
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto ml-auto max-w-full justify-end">
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
                    {/* mobile & tablet */}
                    <span className="lg:hidden flex items-center">
                      {status === 'All' ? (
                        'All'
                      ) : (
                        <span className={`w-3 h-3 rounded-full ${getStatusDotColor(status)}`} />
                      )}
                    </span>
                    {/* desktop */}
                    <span className="hidden lg:inline">
                      {status === 'InProgress' ? 'In Progress' : status}
                    </span>
                    <span className="ml-1 md:ml-2 text-xs md:text-sm opacity-75 hidden lg:inline">
                      ({statusCounts[status]})
                    </span>
                  </button>
                ))}
              </div>
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
            </div>
          )}
        </div>
      }
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