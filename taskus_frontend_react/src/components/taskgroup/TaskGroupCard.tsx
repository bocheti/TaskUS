import { TaskGroup } from "@/types";
import { Card } from "../ui/card";
import { FolderOpen } from "lucide-react";

interface TaskGroupCardProps {
  taskGroup: TaskGroup;
  onClick: () => void;
}

export const TaskGroupCard = ({ taskGroup, onClick }: TaskGroupCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer bg-white hover:shadow-lg transition-shadow duration-200 p-6 group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {taskGroup.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {taskGroup.description || "No description provided"}
          </p>
        </div>
      </div>
    </Card>
  );
};