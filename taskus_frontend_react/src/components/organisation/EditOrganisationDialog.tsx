import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { organisationService } from "@/services/api";
import { Organisation } from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { X } from "lucide-react";

interface EditOrganisationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisation: Organisation;
  onOrganisationUpdated: (updatedOrg: Organisation) => void;
}

export const EditOrganisationDialog = ({ 
  open, 
  onOpenChange, 
  organisation,
  onOrganisationUpdated 
}: EditOrganisationDialogProps) => {
  const [name, setName] = useState(organisation.name);
  const [description, setDescription] = useState(organisation.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(organisation.name);
    setDescription(organisation.description || "");
  }, [organisation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Organisation name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedOrg = await organisationService.updateOrganisation({
        newName: name.trim(),
        newDescription: description.trim() || "",
      });

      toast.success("Organisation updated successfully!");
      onOrganisationUpdated(updatedOrg);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating organisation:", error);
      
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Failed to update organisation";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName(organisation.name);
    setDescription(organisation.description || "");
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
            <h2 className="text-2xl font-semibold">Edit Organisation</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update organisation details
            </p>
          </div>
          <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="org-name" className="text-sm font-medium">
              Organisation Name <span className="text-red-500">*</span>
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Enter organisation name"
              maxLength={100}
              disabled={isSubmitting}
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="org-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="org-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Enter organisation description (optional)"
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
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};