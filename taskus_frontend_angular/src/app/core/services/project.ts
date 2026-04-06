import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = 'http://localhost:3000/project';

  constructor(private http: HttpClient) {}

  // authenticated routes
  getProject(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${projectId}`);
  }

  getProjectsByUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/byUser`);
  }

  addUserToProject(projectId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${projectId}/member/${userId}`, {});
  }

  removeUserFromProject(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projectId}/member/${userId}`);
  }

  getProjectMembers(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${projectId}/members`);
  }

  // admin routes
  getAllProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/all`);
  }

  createProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}`, data);
  }

  deleteProject(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projectId}`);
  }

  updateProject(projectId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${projectId}`, data);
  }

  uploadPic(projectId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pic', file);
    return this.http.post<any>(`${this.API_URL}/${projectId}/uploadPic/`, formData);
  }
}