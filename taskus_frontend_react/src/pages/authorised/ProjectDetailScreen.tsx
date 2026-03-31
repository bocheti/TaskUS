import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Image as ImageIcon, Upload, Trash2, Users, Edit, ArrowLeft } from "lucide-react";
import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { projectService, taskGroupService, taskService } from "@/services/api";
import { Project, TaskGroup, Task, User } from "@/types";
import { toast } from "sonner";
import { TaskGroupCard } from "@/components/taskgroup/TaskGroupCard";
import { CreateTaskGroupDialog } from "@/components/taskgroup/CreateTaskGroupDialog";
import { ProjectMembersModal } from "@/components/project/ProjectMembersModal";
import { EditProjectDialog } from "@/components/project/EditProjectDialog";

export const ProjectDetailScreen = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);


  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
      const taskGroupsData = await taskGroupService.getTaskGroupsByProject(projectId);
      setTaskGroups(taskGroupsData);
      let tasksData: Task[];
      if (user?.role === "admin") {
        tasksData = await taskService.getTasksByProject(projectId);
      } else {
        tasksData = await taskService.getTasksByUserAndProject(projectId);
      }
      setTasks(tasksData);
      const membersData = await projectService.getProjectMembers(projectId);
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskGroupClick = (taskGroupId: string) => {
    navigate(`/taskgroups/${taskGroupId}`);
  };

  const handleTaskGroupCreated = () => {
    setCreateDialogOpen(false);
    fetchProjectData();
    toast.success("Task group created successfully!");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const response = await projectService.uploadPic(projectId, file);
      if (project) {
        setProject({ ...project, pic: response.pic });
      }
      
      toast.success("Project picture updated!");
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !project) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone and will delete all task groups and tasks.`);
    if (!confirmed) return;
    try {
      await projectService.deleteProject(projectId);
      toast.success("Project deleted successfully");
      navigate("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "InProgress").length;
  const doneTasks = tasks.filter(t => t.status === "Done").length;

  const pendingPercentage = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;
  const inProgressPercentage = totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;
  const donePercentage = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  if (isLoading) {
    return (
      <AuthorizedLayout title="Project Details">
        <div className="text-center py-12 text-muted-foreground">
          Loading project...
        </div>
      </AuthorizedLayout>
    );
  }

  if (!project) {
    return (
      <AuthorizedLayout title="Project Details">
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">Project not found</p>
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </div>
      </AuthorizedLayout>
    );
  }

  return (
    <AuthorizedLayout title={project.title}>
      <div className="space-y-6">
        <div className="flex gap-3 items-items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {/* Admin Controls */}
          {user?.role === "admin" && (
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden md:inline">Edit Project</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden md:inline">{isUploading ? "Uploading..." : "Change Picture"}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteProject}
                className="flex items-center gap-2 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden md:inline">Delete Project</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                />
            </div>
          )}
        </div>

  {/* Project Header */}
  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
    {/* Left: Project Image */}
    <div className="md:col-span-2 bg-background rounded-lg border-2 border-border overflow-hidden flex items-center justify-center">
      <div className="w-full aspect-square bg-background flex items-center justify-center relative">
        {project.pic ? (
          <img
            src={project.pic}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-contain p-1"
          />
        ) : (
          <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
        )}
      </div>
    </div>

  {/* Right: Project Info & Progress */}
  <div className="md:col-span-5 space-y-2 flex flex-col min-h-[16rem]">
            {/* Description */}
            <div className="bg-background rounded-lg border-2 border-border p-4">
              <p className="text-muted-foreground text-base">
                {project.description || "No description provided"}
              </p>
            </div>

            {/* Members Preview */}
            <div className="bg-background rounded-lg border-2 border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">
                  Members
                </h3>
                <button
                  onClick={() => setMembersModalOpen(true)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  View All
                </button>
              </div>
              
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <span className="text-sm">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.role === "admin" && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                  {members.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{members.length - 3} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members yet</p>
              )}
            </div>

            {/* Progress Overview */}
            <div className="bg-background rounded-lg border-2 border-border p-4">
              <h3 className="text-base font-semibold mb-3">
                {user?.role === "admin" ? "Overall Progress" : "Your Progress"}
              </h3>
              
              {totalTasks > 0 ? (
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-bold text-status-pending">{pendingTasks}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-status-progress">{inProgressTasks}</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-status-done">{doneTasks}</div>
                      <div className="text-xs text-muted-foreground">Done</div>
                    </div>
                  </div>

                  {/* Segmented Progress Bar */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
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

                  {/* Completion Rate */}
                  <div className="text-center">
                    <span className="text-sm font-medium">
                      {Math.round(donePercentage)}% Complete
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({doneTasks} / {totalTasks} tasks)
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-2 text-sm">
                  No tasks yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Task Groups Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Task Groups
            </h3>
            {user?.role === "admin" && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Task Group
              </Button>
            )}
          </div>

          {/* Task Groups List */}
          {taskGroups.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-lg border-2 border-border">
              <p className="text-muted-foreground mb-4">No task groups yet</p>
              {user?.role === "admin" && (
                <p className="text-sm text-muted-foreground">
                  Create a task group to organize tasks
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskGroups.map((taskGroup) => (
                <TaskGroupCard
                  key={taskGroup.id}
                  taskGroup={taskGroup}
                  onClick={() => handleTaskGroupClick(taskGroup.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Group Dialog */}
      {user?.role === "admin" && projectId && (
        <CreateTaskGroupDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTaskGroupCreated={handleTaskGroupCreated}
          projectId={projectId}
        />
      )}

      {/* Members Modal */}
      {projectId && (
        <ProjectMembersModal
          open={membersModalOpen}
          onOpenChange={setMembersModalOpen}
          projectId={projectId}
          members={members}
          onMembersUpdated={fetchProjectData}
        />
      )}

      {user?.role === "admin" && project && (
        <EditProjectDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          project={project}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </AuthorizedLayout>
  );
};