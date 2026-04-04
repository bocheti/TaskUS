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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  authToken: string;
  userInfo: User;
}