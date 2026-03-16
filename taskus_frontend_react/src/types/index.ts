export type UserRole = "member" | "admin";

export interface User {
  userId: string;
  username: string;
  email: string;
  organisationId: string;
  role: UserRole;
  pic: string | null;
}

export interface UserRequest {
  id: string;
  organisationId: string;
  username: string;
  email: string;
  timestamp: string;
  pic: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  authToken: string;
  userInfo: User;
}

export interface CreateAccountRequest {
  username: string;
  email: string;
  password: string;
  organisationId: string;
  pic?: string;
}

export interface UpdateUserInfoRequest {
  newUsername?: string;
  newEmail?: string;
  newPic?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPassword {
  token: string;
  newPassword: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRoleRequest {
  newRole: UserRole;
}



export interface Organisation {
  id: string;
  name: string;
  description: string | null;
  pic: string | null;
}

export interface CreateOrganisationRequest {
  organisationName: string;
  organisationDescription?: string;
  username: string;
  email: string;
  password: string;
}

export interface CreateOrganisationResponse {
  authToken: string;
  userInfo: User;
}

export interface UpdateOrganisationRequest {
  newName?: string;
  newDescription?: string;
  newPic?: string;
}



export interface Project {
  projectId: string;
  title: string;
  description: string;
  pic: string | null;
  organisationId: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  pic?: string;
}



export interface TaskGroup {
  taskGroupId: string;
  title: string;
  description: string;
  projectId: string;
}

export interface CreateTaskGroupRequest {
  title: string;
  description: string;
  projectId: string;
}

export interface UpdateTaskGroupRequest {
  newTitle: string;
  newDescription: string;
}



export type TaskStatus = "Pending" | "In Progress" | "Done";

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  responsibleId: string;
  taskGroupId: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  responsibleId: string;
  taskGroupId: string;
}

export interface UpdateTaskStatusRequest {
  newStatus: TaskStatus;
}

export interface UpdateTaskResponsibleRequest {
  newResponsibleId: string;
}


export interface UploadPicResponse {
  url: string;
}


// For dropdown selections
export interface OrganisationOption {
  id: string;
  name: string;
  pic: string | null;
}

// For user stats (mentioned in user stories)
export interface UserStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completionRate: number;
}

// For project progress
export interface ProjectProgress {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}