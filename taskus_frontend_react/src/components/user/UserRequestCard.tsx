import { Calendar, Check, X } from "lucide-react";
import { UserRequest } from "@/types";

interface UserRequestCardProps {
  request: UserRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onDelete?: () => void;
}

export const UserRequestCard = ({ request, onAccept, onReject }: UserRequestCardProps) => {
  return (
    <div className="bg-background rounded-lg border-2 border-border p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground flex-shrink-0">
          {request.firstName[0]}{request.lastName[0]}
        </div>

        {/* Request Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate mb-0.5">
            {request.firstName} {request.lastName}
          </h3>
          <p className="text-[0.625rem] md:text-sm text-muted-foreground truncate mb-0.5">{request.email}</p>
          <p className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-[0.625rem] md:text-sm">
                <Calendar size={14} />
                <span> Created {new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onAccept(request.id)}
            className="p-2 rounded-lg text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="p-2 rounded-lg text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};