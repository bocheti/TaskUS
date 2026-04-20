import { useState } from "react";
import { Button } from "@/components/ui/button";
import { taskService, projectService } from "@/services/api";
import { User } from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import { useEffect } from "react";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  taskGroupId: string;
  projectId: string;
}

export const CreateTaskDialog = ({ 
  open, 
  onOpenChange, 
  onTaskCreated, 
  taskGroupId,
  projectId
}: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const allUsers = await projectService.getProjectMembers(projectId);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!responsibleId) {
      toast.error("Please assign the task to a user");
      return;
    }

    try {
      setIsSubmitting(true);
      await taskService.createTask({
        title: title.trim(),
        description: description.trim() || "",
        responsibleId,
        taskGroupId,
        deadline: deadline || null,
      });

      setTitle("");
      setDescription("");
      setDeadline("");
      setResponsibleId("");
      
      onTaskCreated();
    } catch (error) {
      console.error("Error creating task:", error);
      
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Failed to create task";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setResponsibleId("");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={handleCancel}
      />
      
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-[500px] mx-4 p-6 z-50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Create Task</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new task to this group
            </p>
          </div>
          <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter task title"
              maxLength={100}
              disabled={isSubmitting}
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task-responsible" className="text-sm font-medium">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              id="task-responsible"
              value={responsibleId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setResponsibleId(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="task-deadline" className="text-sm font-medium">
              Deadline (optional)
            </label>
            <input
              id="task-deadline"
              type="date"
              value={deadline}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !responsibleId}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};