import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateProjectRequest, Project, UpdateProjectRequest, User } from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = `${environment.apiUrl}/project`;

  constructor(private http: HttpClient) {}

  // authenticated routes
  getProject(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/${projectId}`);
  }

  getProjectsByUser(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/byUser`);
  }

  addUserToProject(projectId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${projectId}/member/${userId}`, {});
  }

  removeUserFromProject(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projectId}/member/${userId}`);
  }

  getProjectMembers(projectId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/${projectId}/members`);
  }

  // admin routes
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/all`);
  }

  createProject(data: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}`, data);
  }

  deleteProject(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projectId}`);
  }

  updateProject(projectId: string, data: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.API_URL}/${projectId}`, data);
  }

  uploadPic(projectId: string, file: File): Observable<Project> {
    const formData = new FormData();
    formData.append('pic', file);
    return this.http.post<Project>(`${this.API_URL}/${projectId}/uploadPic/`, formData);
  }
}