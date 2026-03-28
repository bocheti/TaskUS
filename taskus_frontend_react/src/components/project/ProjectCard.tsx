import { Project, Task } from "../../types";
import { Card } from "../ui/card";
import { Image } from "lucide-react";
import { useEffect, useState } from "react";
import { taskService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let tasksData: Task[];
        if (user?.role === "admin") {
          tasksData = await taskService.getTasksByProject(project.id);
        } else {
          tasksData = await taskService.getTasksByUserAndProject(project.id);
        }
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks for project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [project.id, user?.role]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
    >
      {/* Project Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {project.pic ? (
          <img
            src={project.pic}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card">
            <Image className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2">
            {project.description || "No description provided"}
          </p>
        </div>

        {/* Progress Section */}
        {!isLoading && totalTasks > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Progress</span>
              <span className="font-medium">
                {completedTasks} / {totalTasks} tasks
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            
            <div className="text-right">
              <span className="text-xs font-medium text-primary">
                {completionPercentage}% Complete
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectCard;