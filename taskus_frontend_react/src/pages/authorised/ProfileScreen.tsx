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

export const ProfileScreen = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<7 | 30 | 90>(30);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user info
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;
      
      const userData = await userService.getUserInfo(targetUserId);
      setProfileUser(userData);
      const userTasks = await taskService.getTasksByUser(targetUserId);
      setTasks(userTasks);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
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

  // Calculate stats
  const completedTasks = tasks.filter(t => t.status === "Done");
  const activeTasks = tasks.filter(t => t.status !== "Done");
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Average completion time
  const completionTimes = completedTasks
    .filter(t => t.completedAt)
    .map(t => {
      const created = new Date(t.createdAt).getTime();
      const completed = new Date(t.completedAt!).getTime();
      return (completed - created) / (1000 * 60 * 60 * 24); // days
    });
  const avgCompletionTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : 0;

  // Filter tasks by time period
  const now = new Date();
  const filterDate = new Date(now.getTime() - timeFilter * 24 * 60 * 60 * 1000);
  const recentCompletedTasks = completedTasks.filter(t => 
    t.completedAt && new Date(t.completedAt) >= filterDate
  );

  // Group by day for line chart
  const tasksByDay = Array.from({ length: timeFilter }, (_, i) => {
    const date = new Date(now.getTime() - (timeFilter - 1 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = recentCompletedTasks.filter(t => {
      const completedDate = new Date(t.completedAt!).toISOString().split('T')[0];
      return completedDate === dateStr;
    }).length;
    return { date: dateStr, count };
  });

  // Group by month for bar chart
  const tasksByMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const count = completedTasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.getFullYear() === date.getFullYear() && 
             completedDate.getMonth() === date.getMonth();
    }).length;
    return { month: monthStr, count };
  });

  // Pie chart data
  const pendingCount = tasks.filter(t => t.status === "Pending").length;
  const inProgressCount = tasks.filter(t => t.status === "InProgress").length;
  const doneCount = tasks.filter(t => t.status === "Done").length;

  if (isLoading) {
    return (
      <AuthorizedLayout title="Profile">
        <div className="text-center py-12 text-muted-foreground">
          Loading profile...
        </div>
      </AuthorizedLayout>
    );
  }

  if (!profileUser) {
    return (
      <AuthorizedLayout title="Profile">
        <div className="text-center py-12">
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

        {/* Stats Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">My Statistics</h3>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
              <div className="text-3xl font-bold text-status-done">{completedTasks.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Tasks Completed</div>
            </div>
            <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
              <div className="text-3xl font-bold text-primary">{activeTasks.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Active Tasks</div>
            </div>
            <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
              <div className="text-3xl font-bold text-foreground">{completionRate}%</div>
              <div className="text-sm text-muted-foreground mt-1">Completion Rate</div>
            </div>
            <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
              <div className="text-3xl font-bold text-foreground">{avgCompletionTime}</div>
              <div className="text-sm text-muted-foreground mt-1">Avg Days to Complete</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Distribution Pie Chart */}
            <div className="bg-background rounded-lg border-2 border-border p-6">
              <h4 className="text-lg font-semibold mb-4">Task Distribution</h4>
              {totalTasks > 0 ? (
                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-40 h-40">
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="transparent"
                      stroke="hsl(var(--status-pending))"
                      strokeWidth="40"
                      strokeDasharray={`${(pendingCount / totalTasks) * 439.82} 439.82`}
                      transform="rotate(-90 100 100)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="transparent"
                      stroke="hsl(var(--status-progress))"
                      strokeWidth="40"
                      strokeDasharray={`${(inProgressCount / totalTasks) * 439.82} 439.82`}
                      strokeDashoffset={-((pendingCount / totalTasks) * 439.82)}
                      transform="rotate(-90 100 100)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="transparent"
                      stroke="hsl(var(--status-done))"
                      strokeWidth="40"
                      strokeDasharray={`${(doneCount / totalTasks) * 439.82} 439.82`}
                      strokeDashoffset={-(((pendingCount + inProgressCount) / totalTasks) * 439.82)}
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No tasks yet</p>
              )}
              <div className="flex justify-center gap-4 mt-4 text-xs md:text-base">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-pending" />
                  <span>Pending ({pendingCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-progress" />
                  <span>In Progress ({inProgressCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-done" />
                  <span>Done ({doneCount})</span>
                </div>
              </div>
            </div>

            {/* Completion Over Time Line Chart */}
            <div className="bg-background rounded-lg border-2 border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Completion Timeline</h4>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(Number(e.target.value) as 7 | 30 | 90)}
                  className="text-sm border border-input rounded px-2 py-1 bg-background"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
              {recentCompletedTasks.length > 0 ? (
                <div className="h-48">
                  <svg viewBox="0 0 400 150" className="w-full h-full">
                    {/* Simple line chart */}
                    {tasksByDay.map((day, i) => {
                      const x = (i / (tasksByDay.length - 1)) * 380 + 10;
                      const maxCount = Math.max(...tasksByDay.map(d => d.count), 1);
                      const y = 140 - (day.count / maxCount) * 120;
                      const nextDay = tasksByDay[i + 1];
                      const nextX = nextDay ? ((i + 1) / (tasksByDay.length - 1)) * 380 + 10 : x;
                      const nextY = nextDay ? 140 - (nextDay.count / maxCount) * 120 : y;
                      
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="3" fill="hsl(var(--primary))" />
                          {nextDay && (
                            <line
                              x1={x}
                              y1={y}
                              x2={nextX}
                              y2={nextY}
                              stroke="hsl(var(--primary))"
                              strokeWidth="2"
                            />
                          )}
                        </g>
                      );
                    })}
                    <line x1="10" y1="140" x2="390" y2="140" stroke="hsl(var(--border))" strokeWidth="1" />
                  </svg>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No completed tasks in this period</p>
              )}
            </div>
          </div>

          {/* Monthly Performance Bar Chart */}
          <div className="bg-background rounded-lg border-2 border-border p-6">
            <h4 className="text-lg font-semibold mb-4">Monthly Performance</h4>
            {completedTasks.length > 0 ? (
              <div className="h-64">
                <svg viewBox="0 0 600 200" className="w-full h-full">
                  {tasksByMonth.map((month, i) => {
                    const maxCount = Math.max(...tasksByMonth.map(m => m.count), 1);
                    const barHeight = (month.count / maxCount) * 160;
                    const x = i * 100 + 20;
                    const y = 180 - barHeight;
                    
                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={y}
                          width="60"
                          height={barHeight}
                          fill="hsl(var(--primary))"
                          rx="4"
                        />
                        <text
                          x={x + 30}
                          y={y - 5}
                          textAnchor="middle"
                          className="text-xs fill-foreground"
                        >
                          {month.count}
                        </text>
                        <text
                          x={x + 30}
                          y="195"
                          textAnchor="middle"
                          className="text-xs fill-muted-foreground"
                        >
                          {month.month.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                  <line x1="10" y1="180" x2="590" y2="180" stroke="hsl(var(--border))" strokeWidth="1" />
                </svg>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No completed tasks yet</p>
            )}
          </div>
        </div>
        {profileUser && (
        <>
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
        </>
      )}
      </div>
    </AuthorizedLayout>
  );
};