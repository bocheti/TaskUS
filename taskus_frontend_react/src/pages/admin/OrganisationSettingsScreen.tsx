import { useEffect, useState } from "react";
import { Upload, Edit } from "lucide-react";
import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { Button } from "@/components/ui/button";
import { organisationService, taskService } from "@/services/api";
import { Organisation, Task } from "@/types";
import { toast } from "sonner";
import { ProjectList } from "@/components/project/ProjectList";
import { EditOrganisationDialog } from "@/components/organisation/EditOrganisationDialog";
import { TaskStats } from "@/components/ui/TaskStats";

export const OrganisationSettingsScreen = () => {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [orgTasks, setOrgTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrganisation();
    fetchOrgTasks();
  }, []);

  const fetchOrganisation = async () => {
    try {
      setIsLoading(true);
      const orgData = await organisationService.getOrganisation();
      setOrganisation(orgData);
    } catch {
      toast.error("Failed to load organisation");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrgTasks = async () => {
    try {
      const tasksData = await taskService.getAllTasks();
      setOrgTasks(tasksData);
    } catch (error) {
      console.error("Error fetching org tasks:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      await organisationService.uploadPic(file);
      toast.success("Organisation picture updated!");
      fetchOrganisation();
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOrganisationUpdated = (updatedOrg: Organisation) => {
    setOrganisation(updatedOrg);
  };

  if (isLoading) {
    return (
      <AuthorizedLayout title="Organisation Settings">
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      </AuthorizedLayout>
    );
  }

  if (!organisation) {
    return (
      <AuthorizedLayout title="Organisation Settings">
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">Organisation not found</p>
        </div>
      </AuthorizedLayout>
    );
  }

  return (
    <AuthorizedLayout title="Organisation Settings">
      <div className="space-y-6">
        {/* Organisation Header */}
        <div className="bg-background rounded-lg border-2 border-border p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Organisation Picture */}
            <div className="flex-shrink-0">
              <div className="w-36 h-36 rounded-lg bg-primary/20 flex items-center justify-center text-4xl font-bold overflow-hidden">
                {organisation.pic ? (
                  <img 
                    src={organisation.pic} 
                    alt={organisation.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  organisation.name[0]
                )}
              </div>
            </div>

            {/* Organisation Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{organisation.name}</h2>
              <p className="text-muted-foreground mb-4">
                {organisation.description || "No description provided"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                id="org-pic-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('org-pic-upload')?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden md:inline">
                  {isUploading ? "Uploading..." : "Change Picture"}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden md:inline">Edit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Organisation Statistics */}
        <TaskStats 
          tasks={orgTasks} 
          title="Organisation Statistics" 
        />

        {/* Projects Section */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Projects</h3>
          <ProjectList showCreateButton={true} />
        </div>
      </div>

      {/* Edit Organisation Dialog */}
      <EditOrganisationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        organisation={organisation}
        onOrganisationUpdated={handleOrganisationUpdated}
      />
    </AuthorizedLayout>
  );
};