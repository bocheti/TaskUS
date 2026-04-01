import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { projectService, userService } from "@/services/api";
import { User } from "@/types";
import { toast } from "sonner";
import { X, UserMinus, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface ProjectMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  members: User[];
  onMembersUpdated: () => void;
}

export const ProjectMembersModal = ({
  open,
  onOpenChange,
  projectId,
  members,
  onMembersUpdated,
}: ProjectMembersModalProps) => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && user?.role === "admin") {
      fetchAllUsers();
    }
  }, [open, user?.role]);

  const fetchAllUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const memberToRemove = members.find(m => m.id === userId);
    if (!memberToRemove) return;

    const confirmed = window.confirm(
      `Remove ${memberToRemove.firstName} ${memberToRemove.lastName} from this project?`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      await projectService.removeUserFromProject(projectId, userId);
      toast.success("Member removed from project");
      onMembersUpdated();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      setIsLoading(true);
      await projectService.addUserToProject(projectId, userId);
      toast.success("Member added to project");
      setShowAddUser(false);
      onMembersUpdated();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setIsLoading(false);
    }
  };

  const availableUsers = allUsers.filter(
    u => !members.some(m => m.id === u.id)
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-[600px] max-h-[80vh] mx-4 p-6 z-50 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">
              Project Members
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
  {members.map((member) => (
    <div
      key={member.id}
      className={`flex items-center justify-between p-3 bg-background rounded-lg border-2 border-border ${
        user?.role === "admin" ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={() => user?.role === "admin" && navigate(`/profile/${member.id}`)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
          {member.firstName[0]}{member.lastName[0]}
        </div>
        <div>
          <div className="font-semibold text-base">
            {member.firstName} {member.lastName}
          </div>
          <div className="text-[0.625rem] md:text-sm text-muted-foreground">
            {member.email}
          </div>
        </div>
        {member.role === "admin" && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Admin
          </span>
        )}
      </div>

      {user?.role === "admin" && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveMember(member.id);
          }}
          disabled={isLoading}
          className="text-red-500 hover:text-red-600 flex-shrink-0"
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </div>
  ))}

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No members in this project
            </div>
          )}
        </div>

        {user?.role === "admin" && (
          <div className="border-t border-border pt-4">
            {!showAddUser ? (
              <Button
                onClick={() => setShowAddUser(true)}
                className="w-full flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Add User to Project</h4>
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>

                {availableUsers.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableUsers.map((availableUser) => (
                      <div
                        key={availableUser.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                            {availableUser.firstName[0]}{availableUser.lastName[0]}
                          </div>
                          <div className="text-sm">
                            {availableUser.firstName} {availableUser.lastName}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddMember(availableUser.id)}
                          disabled={isLoading}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All users are already members of this project
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};