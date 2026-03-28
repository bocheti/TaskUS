import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { projectService } from "@/services/api";
import { Project } from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { X } from "lucide-react";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onProjectUpdated: (updatedProject: Project) => void;
}

export const EditProjectDialog = ({ 
  open, 
  onOpenChange, 
  project,
  onProjectUpdated 
}: EditProjectDialogProps) => {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when project changes
  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description || "");
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedProject = await projectService.updateProject(project.id, {
        newTitle: title.trim(),
        newDescription: description.trim() || "",
      });

      toast.success("Project updated successfully!");
      onProjectUpdated(updatedProject);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating project:", error);
      
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Failed to update project";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle(project.title);
    setDescription(project.description || "");
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
              Edit Project
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update project details
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
          {/* Project Title */}
          <div className="space-y-2">
            <label htmlFor="edit-project-title" className="text-sm font-medium">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-project-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter project title"
              maxLength={100}
              disabled={isSubmitting}
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label htmlFor="edit-project-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="edit-project-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Enter project description (optional)"
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
              {isSubmitting ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};