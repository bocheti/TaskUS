import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Trash2, UserCog, ArrowLeft } from "lucide-react";
import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { userService, taskService } from "@/services/api";
import { User, Task } from "@/types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TaskStats } from "@/components/ui/TaskStats";
import axios from "axios"; 
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const ProfileScreen = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    fetchProfileData();
  }, [userId]);


  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setErrorStatus(null);
      
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;
      
      const userData = await userService.getUserInfo(targetUserId);
      setProfileUser(userData);
      
      const userTasks = await taskService.getTasksByUser(targetUserId);
      setTasks(userTasks);
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 403) {
          setErrorStatus(403);
        } else if (status === 404) {
          setErrorStatus(404);
        } else {
          toast.error("Failed to load profile");
        }
      } else {
        // Handles non-axios errors (like network failures or code crashes)
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
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
      await userService.uploadPic(file);
      toast.success("Profile picture updated!");
      fetchProfileData();
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleRole = () => {
    if (!profileUser) return;
    setIsRoleDialogOpen(true);
  };

  const executeToggleRole = async () => {
    if (!profileUser) return;
    
    setIsRoleDialogOpen(false);
    const newRole = profileUser.role === "admin" ? "member" : "admin";

    try {
      await userService.updateUserRole(profileUser.id);
      toast.success(`User ${newRole === "admin" ? "promoted" : "demoted"} successfully`);
      fetchProfileData();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = () => {
    if (!profileUser) return;
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteUser = async () => {
    if (!profileUser) return;
    
    setIsDeleteDialogOpen(false);

    try {
      await userService.deleteUser(profileUser.id);
      toast.success("User deleted successfully");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <AuthorizedLayout title="Profile">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner/>
          <p className="text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </AuthorizedLayout>
    );
  }

  if (errorStatus === 403) {
    return (
      <AuthorizedLayout title="Access Denied">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-destructive/10 p-6 rounded-full mb-6">
            <UserCog className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Private Profile</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            You do not have permission to view this profile. This user belongs to a different organization or is restricted.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="h-8 px-4" 
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </AuthorizedLayout>
    );
  }

  if (!profileUser) {
    return (
      <AuthorizedLayout title="Profile">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-xl text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </AuthorizedLayout>
    );
  }

  return (
    <AuthorizedLayout title={isOwnProfile ? "My Profile" : `${profileUser.firstName}'s Profile`}>
      <div className="space-y-6">
        {/* Back Button */}
        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {/* Profile Header */}
        <div className="bg-background rounded-lg border-2 border-border p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-36 h-36 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold overflow-hidden">
                {profileUser.pic ? (
                  <img src={profileUser.pic} alt={profileUser.firstName} className="w-full h-full object-cover" />
                ) : (
                  `${profileUser.firstName[0]}${profileUser.lastName[0]}`
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {profileUser.firstName} {profileUser.lastName}
              </h2>
              <p className="text-muted-foreground mb-2">{profileUser.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                profileUser.role === "admin" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-foreground"
              }`}>
                {profileUser.role === "admin" ? "Administrator" : "Member"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {(isOwnProfile || isAdmin) && (
                <>
                  <input
                    type="file"
                    id="profile-pic-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('profile-pic-upload')?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="hidden md:inline">{isUploading ? "Uploading..." : "Change Picture"}</span>
                  </Button>
                </>
              )}

              {isAdmin && !isOwnProfile && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleToggleRole}
                    className="flex items-center gap-2"
                  >
                    <UserCog className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {profileUser.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                    </span>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteUser}
                    className="flex items-center gap-2"
                    >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden md:inline">Delete User</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Component */}
        <TaskStats 
          tasks={tasks} 
          title={isOwnProfile ? "My Statistics" : `${profileUser.firstName}'s Statistics`} 
        />

        <ConfirmDialog
          isOpen={isRoleDialogOpen}
          title={profileUser.role === "admin" ? "Demote User" : "Promote User"}
          message={`Are you sure you want to ${profileUser.role === "admin" ? "demote" : "promote"} ${profileUser.firstName} ${profileUser.lastName} to ${profileUser.role === "admin" ? "member" : "admin"}?`}
          confirmText={profileUser.role === "admin" ? "Demote" : "Promote"}
          isDanger={profileUser.role === "admin"}
          onConfirm={executeToggleRole}
          onCancel={() => setIsRoleDialogOpen(false)}
        />

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Delete User"
          message={`Are you sure you want to delete ${profileUser.firstName} ${profileUser.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          isDanger={true}
          onConfirm={executeDeleteUser}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      </div>
    </AuthorizedLayout>
  );
};