import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import { userService } from "@/services/api";
import { User, UserRequest } from "@/types";
import { toast } from "sonner";
import { UserCard } from "@/components/user/UserCard";
import { UserRequestCard } from "@/components/user/UserRequestCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Tab = "users" | "requests";

export const UserManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, requestsData] = await Promise.all([
        userService.getAllUsers(),
        userService.getAllUserRequests(),
      ]);
      setUsers(usersData);
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };


  const handleAcceptClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsAcceptDialogOpen(true);
  };

  const executeAcceptRequest = async () => {
    if (!selectedRequestId) return;
    setIsAcceptDialogOpen(false);
    try {
      await userService.acceptUserRequest(selectedRequestId);
      toast.success("User request accepted");
      fetchData();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    } finally {
      setSelectedRequestId(null);
    }
  };

  const handleRejectClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRejectDialogOpen(true);
  };

  const executeRejectRequest = async () => {
    if (!selectedRequestId) return;
    setIsRejectDialogOpen(false);

    try {
      await userService.rejectUserRequest(selectedRequestId);
      toast.success("User request rejected");
      fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setSelectedRequestId(null);
    }
  };

  return (
    <AuthorizedLayout title="User Management">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner/>
          <p className="text-muted-foreground animate-pulse">Loading users...</p>
        </div>
      ) : 
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-muted p-1 rounded-full inline-flex gap-1">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeTab === "users"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Users
                <span className="ml-2 text-sm opacity-75">({users.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeTab === "requests"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Requests
                <span className="ml-2 text-sm opacity-75">({requests.length})</span>
              </button>
            </div>
          </div>

          { activeTab === "users" ? (
            <div className="space-y-3">
              {users.length === 0 ? (
                <div className="text-center py-12 bg-background rounded-lg border-2 border-border">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                users.map((user) => (
                  <UserCard key={user.id} user={user} onDelete={fetchData} />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-12 bg-background rounded-lg border-2 border-border">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                requests.map((request) => (
                  <UserRequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAcceptClick}
                    onReject={handleRejectClick}
                    onDelete={fetchData}
                  />
                ))
              )}
            </div>
          )}
        </div>
        } { isRejectDialogOpen &&
          <ConfirmDialog
            isOpen={isRejectDialogOpen}
            title="Reject Request"
            message="Are you sure you want to reject this request?"
            confirmText="Reject"
            isDanger={true}
            onConfirm={executeRejectRequest}
            onCancel={() => {
              setIsRejectDialogOpen(false);
              setSelectedRequestId(null);
            }}
          />
        } { isAcceptDialogOpen &&
          <ConfirmDialog
            isOpen={isAcceptDialogOpen}
            title="Accept Request"
            message="Are you sure you want to accept this request?"
            confirmText="Accept"
            isDanger={false}
            onConfirm={executeAcceptRequest}
            onCancel={() => {
              setIsAcceptDialogOpen(false);
              setSelectedRequestId(null);
            }}
          />
        }
    </AuthorizedLayout>
  );
};