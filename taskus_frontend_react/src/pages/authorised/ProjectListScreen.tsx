import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { projectService } from "../../services/api";
import { Project } from "../../types";
import { toast } from "sonner";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";

export const ProjectListScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const fetchedProjects = await projectService.getProjectsByUser();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleProjectCreated = () => {
    setCreateDialogOpen(false);
    fetchProjects(); // Refresh the list
    toast.success("Project created successfully!");
  };

  return (
    <AuthorizedLayout title="My Projects">
      <div className="space-y-6">
        {/* Header with Create button for admins */}
        {user?.role === "admin" && (
          <div className="flex justify-end">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            Loading projects...
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No projects yet</p>
            {user?.role === "admin" && (
              <p className="text-sm text-muted-foreground">
                Create your first project to get started
              </p>
            )}
          </div>
        )}

        {/* Project grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      {user?.role === "admin" && (
        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </AuthorizedLayout>
  );
};

export default ProjectListScreen;