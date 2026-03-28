import { useState } from "react";
import { Button } from "@/components/ui/button";
import { taskGroupService } from "@/services/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { X } from "lucide-react";

interface CreateTaskGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskGroupCreated: () => void;
  projectId: string;
}

export const CreateTaskGroupDialog = ({ 
  open, 
  onOpenChange, 
  onTaskGroupCreated, 
  projectId 
}: CreateTaskGroupDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task group title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await taskGroupService.createTaskGroup({
        title: title.trim(),
        description: description.trim() || "",
        projectId: projectId,
      });

      // Reset form
      setTitle("");
      setDescription("");
      
      // Notify parent and close
      onTaskGroupCreated();
    } catch (error) {
      console.error("Error creating task group:", error);
      
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Failed to create task group";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-[500px] mx-4 p-6 z-50">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">
              Create Task Group
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Organize tasks into groups
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Group Title */}
          <div className="space-y-2">
            <label htmlFor="taskgroup-title" className="text-sm font-medium">
              Task Group Title <span className="text-red-500">*</span>
            </label>
            <input
              id="taskgroup-title"
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

          {/* Task Group Description */}
          <div className="space-y-2">
            <label htmlFor="taskgroup-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="taskgroup-description"
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Creating..." : "Create Task Group"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};