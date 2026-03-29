import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit } from "lucide-react";
import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { taskGroupService, taskService } from "@/services/api";
import { TaskGroup, Task } from "@/types";
import { toast } from "sonner";
import { TaskCard } from "@/components/task/TaskCard";
import { TaskModal } from "@/components/task/TaskModal";
import { CreateTaskDialog } from "@/components/task/CreateTaskDialog";
import { EditTaskGroupDialog } from "@/components/taskgroup/EditTaskGroupDialog";

export const TaskGroupDetailScreen = () => {
  const { taskGroupId } = useParams<{ taskGroupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [taskGroup, setTaskGroup] = useState<TaskGroup | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (taskGroupId) {
      fetchTaskGroupData();
    }
  }, [taskGroupId]);

  const fetchTaskGroupData = async () => {
    if (!taskGroupId) return;

    try {
      setIsLoading(true);
      
      const taskGroupData = await taskGroupService.getTaskGroup(taskGroupId);
      setTaskGroup(taskGroupData);

      const tasksData = await taskService.getTasksByTaskGroup(taskGroupId);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching task group data:", error);
      toast.error("Failed to load task group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskCreated = () => {
    setCreateDialogOpen(false);
    fetchTaskGroupData();
    toast.success("Task created successfully!");
  };

  const handleTaskGroupUpdated = (updatedTaskGroup: TaskGroup) => {
    setTaskGroup(updatedTaskGroup);
  };

  const handleDeleteTaskGroup = async () => {
    if (!taskGroupId || !taskGroup) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${taskGroup.title}"? This will also delete all tasks in this group. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await taskGroupService.deleteTaskGroup(taskGroupId);
      toast.success("Task group deleted successfully");
      navigate(`/projects/${taskGroup.projectId}`);
    } catch (error) {
      console.error("Error deleting task group:", error);
      toast.error("Failed to delete task group");
    }
  };

  // Filter tasks for progress calculation (only user's tasks for members, all for admin)
  const myTasks = user?.role === "admin" 
    ? tasks 
    : tasks.filter(t => t.responsibleId === user?.userId);

  const totalTasks = myTasks.length;
  const pendingTasks = myTasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = myTasks.filter(t => t.status === "InProgress").length;
  const doneTasks = myTasks.filter(t => t.status === "Done").length;

  const pendingPercentage = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;
  const inProgressPercentage = totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;
  const donePercentage = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  if (isLoading) {
    return (
      <AuthorizedLayout title="Task Group">
        <div className="text-center py-12 text-muted-foreground">
          Loading task group...
        </div>
      </AuthorizedLayout>
    );
  }

  if (!taskGroup) {
    return (
      <AuthorizedLayout title="Task Group">
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">Task group not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </AuthorizedLayout>
    );
  }

  return (
    <AuthorizedLayout title={taskGroup.title}>
      <div className="space-y-6">
        {/* Admin Controls */}
        {user?.role === "admin" && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteTaskGroup}
              className="flex items-center gap-2 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}

        {/* Task Group Info & Progress */}
        <div className="bg-background rounded-lg border-2 border-border p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{taskGroup.title}</h2>
            <p className="text-muted-foreground">
              {taskGroup.description || "No description provided"}
            </p>
          </div>

          {/* Progress - based on user's tasks only (or all for admin) */}
          {totalTasks > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-status-pending">{pendingTasks}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-status-progress">{inProgressTasks}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-status-done">{doneTasks}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
              </div>

              <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
                {pendingPercentage > 0 && (
                  <div
                    className="bg-status-pending h-full transition-all duration-300"
                    style={{ width: `${pendingPercentage}%` }}
                  />
                )}
                {inProgressPercentage > 0 && (
                  <div
                    className="bg-status-progress h-full transition-all duration-300"
                    style={{ width: `${inProgressPercentage}%` }}
                  />
                )}
                {donePercentage > 0 && (
                  <div
                    className="bg-status-done h-full transition-all duration-300"
                    style={{ width: `${donePercentage}%` }}
                  />
                )}
              </div>

              <div className="text-center">
                <span className="text-sm font-medium">
                  {Math.round(donePercentage)}% Complete
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({doneTasks} / {totalTasks} tasks)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Tasks</h3>
            {user?.role === "admin" && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-lg border-2 border-border">
              <p className="text-muted-foreground mb-4">No tasks yet</p>
              {user?.role === "admin" && (
                <p className="text-sm text-muted-foreground">
                  Create a task to get started
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const isMyTask = user?.role === "admin" || task.responsibleId === user?.userId;
                return (
                  <div
                    key={task.id}
                    className={!isMyTask ? "opacity-50" : ""}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => handleTaskClick(task)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
            setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
          }}
        />
      )}

      {/* Create Task Dialog */}
      {user?.role === "admin" && taskGroupId && (
        <CreateTaskDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTaskCreated={handleTaskCreated}
          taskGroupId={taskGroupId}
        />
      )}

      {/* Edit Task Group Dialog */}
      {user?.role === "admin" && taskGroup && (
        <EditTaskGroupDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          taskGroup={taskGroup}
          onTaskGroupUpdated={handleTaskGroupUpdated}
        />
      )}
    </AuthorizedLayout>
  );
};