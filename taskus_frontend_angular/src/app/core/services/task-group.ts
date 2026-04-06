import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskGroupService {
private readonly API_URL = `${environment.apiUrl}/taskGroup`;

  constructor(private http: HttpClient) {}

  getTaskGroup(taskGroupId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${taskGroupId}`);
  }

  getTaskGroupsByProject(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/byProject/${projectId}`);
  }

  // admin routes
  createTaskGroup(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}`, data);
  }

  updateTaskGroup(taskGroupId: string, data: any): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${taskGroupId}`, data);
  }

  deleteTaskGroup(taskGroupId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${taskGroupId}`);
  }
}