import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { userService } from "@/services/api/userService";

interface UserCardProps {
  user: User;
  onDelete?: () => void;
}

export const UserCard = ({ user, onDelete }: UserCardProps) => {
  const navigate = useNavigate();

  const handleDeleteUser = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await userService.deleteUser(user.id);
      toast.success("User deleted successfully");
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="bg-background rounded-lg border-2 border-border p-3 hover:shadow-md transition-shadow" onClick={() => navigate(`/profile/${user.id}`)}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium flex-shrink-0">
          {user.pic ? (
            <img
              src={user.pic}
              alt={user.firstName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            `${user.firstName[0]}${user.lastName[0]}`
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-base truncate">
              {user.firstName} {user.lastName}
            </h3>
            {user.role === "admin" && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded flex-shrink-0">
                Admin
              </span>
            )}
          </div>
          <p className="text-[0.625rem] md:text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button
        variant="destructive"
        size="sm"
        onClick={handleDeleteUser}
        className="text-xs"
        >
        Delete
        </Button>
      </div>
    </div>
  );
};