import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  // public routes
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, credentials);
  }

  requestAccount(data: any): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/request`, data);
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/resetPasswordRequest`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/resetPassword`, { token, newPassword });
  }

  // authenticated routes
  getUserInfo(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${userId}`);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}`);
  }

  uploadPic(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pic', file);
    return this.http.post<any>(`${this.API_URL}/uploadPic`, formData);
  }

  // admin routes
  createUser(data: any): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/create`, data);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/all`);
  }

  getAllUserRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/requests`);
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