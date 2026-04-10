import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CreateAccountRequest, CreateUserRequest, LoginCredentials, LoginResponse, User, UserRequest } from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/user`;
  
  constructor(private http: HttpClient) {}

  // public routes
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials);
  }

  requestAccount(data: CreateAccountRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/request`, data);
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/resetPasswordRequest`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/resetPassword`, { token, newPassword });
  }

  // authenticated routes
  getUserInfo(userId: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${userId}`);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}`);
  }

  uploadPic(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('pic', file);
    return this.http.post<User>(`${this.API_URL}/uploadPic`, formData);
  }

  // admin routes
  createUser(data: CreateUserRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/create`, data);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/all`);
  }

  getAllUserRequests(): Observable<UserRequest[]> {
    return this.http.get<UserRequest[]>(`${this.API_URL}/requests`);
  }

  acceptUserRequest(userRequestId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userRequestId}/accept`, {});
  }

  rejectUserRequest(userRequestId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userRequestId}/reject`, {});
  }

  updateUserRole(userId: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${userId}/role`, {});
  }
}