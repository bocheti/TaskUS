import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { taskGroupService } from "@/services/api";
import { TaskGroup } from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { X } from "lucide-react";

interface EditTaskGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskGroup: TaskGroup;
  onTaskGroupUpdated: (updatedTaskGroup: TaskGroup) => void;
}

export const EditTaskGroupDialog = ({ 
  open, 
  onOpenChange, 
  taskGroup,
  onTaskGroupUpdated 
}: EditTaskGroupDialogProps) => {
  const [title, setTitle] = useState(taskGroup.title);
  const [description, setDescription] = useState(taskGroup.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(taskGroup.title);
    setDescription(taskGroup.description || "");
  }, [taskGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task group title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedTaskGroup = await taskGroupService.updateTaskGroup(taskGroup.id, {
        newTitle: title.trim(),
        newDescription: description.trim() || "",
      });

      toast.success("Task group updated successfully!");
      onTaskGroupUpdated(updatedTaskGroup);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task group:", error);
      
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Failed to update task group";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle(taskGroup.title);
    setDescription(taskGroup.description || "");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={handleCancel}
      />
      
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-[500px] mx-4 p-6 z-50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Edit Task Group</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update task group details
            </p>
          </div>
          <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-taskgroup-title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-taskgroup-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter task group title"
              maxLength={100}
              disabled={isSubmitting}
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-taskgroup-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="edit-taskgroup-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Enter task group description (optional)"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length} / 500
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};