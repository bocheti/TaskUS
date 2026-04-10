export type UserRole = "member" | "admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organisationId: string;
  role: UserRole;
  pic: string | null;
}

export interface UserRequest {
  id: string;
  organisationId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  pic: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  authToken: string;
  userInfo: User;
}

export interface CreateAccountRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organisationId: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPassword {
  token: string;
  newPassword: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Organisation {
  id: string;
  name: string;
  description: string | null;
  pic: string | null;
}

export interface OrganisationListItem {
  id: string;
  name: string;
}

export interface CreateOrganisationRequest {
  organisationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateOrganisationResponse {
  authToken: string;
  userInfo: User;
}

export interface UpdateOrganisationRequest {
  newName: string;
  newDescription: string;
}

export interface Project {
  id: string;
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
  id: string;
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

export type TaskStatus = "Pending" | "InProgress" | "Done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  deadline: string | null;
  responsibleId: string;
  taskGroupId: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  responsibleId: string;
  taskGroupId: string;
  deadline?: string | null;
}

export interface UpdateTaskStatusRequest {
  newStatus: TaskStatus;
}

export interface UpdateTaskResponsibleRequest {
  newResponsibleId: string;
}

export interface UpdateProjectRequest {
  newTitle?: string;
  newDescription?: string;
}

export interface ApiError {
  error: string;
}

export interface UserStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface ProjectProgress {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}