import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { taskService } from '@/services/api';
import { Task } from '@/types';
import { toast } from 'sonner';
import { StatsOverviewCard } from '@/components/dashboard/StatsOverviewCard';
import { RecentCompletedCard } from '@/components/dashboard/RecentCompletedCard';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';
import { useNavigate } from 'react-router-dom';
import { TaskCalendar } from '@/components/dashboard/TaskCalendar';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let userTasks: Task[] = [];
        if (user?.role === 'admin') {
          userTasks = await taskService.getAllTasks();
        } else {
          userTasks = await taskService.getTasksByUser(user!.id);
        }
        setTasks(userTasks);
      } catch {
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getPendingTasksToDisplay = () => {
    const tasksToBeDone = tasks.filter(task => task.status !== 'Done');
    const tasksWithDeadline = tasksToBeDone.filter(task => task.deadline);
    const tasksWithoutDeadline = tasksToBeDone.filter(task => !task.deadline);
    // sort tasks w deadline by deadline
    const sortedByDeadline = tasksWithDeadline.sort(
      (a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    );
    // sort tasks w/o deadline by created date (oldest first)
    const sortedByCreated = tasksWithoutDeadline.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    // combine: tasks with deadlines first, then fill with oldest created
    return [...sortedByDeadline, ...sortedByCreated].slice(0, 3);
  };

  const tasksToDisplay = getPendingTasksToDisplay();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AuthorizedLayout title="My Dashboard">
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {getGreeting()}, {user?.firstName}!
        </h2>
        <p className="text-md text-muted-foreground mt-1">
          {getCurrentDate()}
        </p>
      </div>

      {/* two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-6">
            <h3 className="text-sm md:text-lg font-semibold text-foreground">
              Tasks Requiring Attention
            </h3>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-xs text-primary hover:underline"
            >
              View All Tasks
            </button>
          </div>
          {/* task cards */}
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-muted-foreground">Loading tasks...</p>
            ) : tasksToDisplay.length === 0 ? (
              <div className="bg-background rounded-lg p-6 border-2 border-border text-center">
                <p className="text-muted-foreground">
                  No pending tasks! You're all caught up.
                </p>
              </div>
            ) : (
              tasksToDisplay.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
          <h3 className="text-sm md:text-lg font-semibold text-foreground pt-4">
            Deadlines calendar
          </h3>
            <TaskCalendar
              tasks={tasks}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
            />
        </div>
        {/* right column */}
        <div className="space-y-4">
          <StatsOverviewCard tasks={tasks} isLoading={isLoading} />
          <RecentCompletedCard tasks={tasks} isLoading={isLoading} />
        </div>
      </div>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={(updatedTask) => {
            // Update the task in the local state
            setTasks(tasks.map(t => 
              t.id === updatedTask.id ? updatedTask : t
            ));
          }}
        />
      )}
    </AuthorizedLayout>
  );
};