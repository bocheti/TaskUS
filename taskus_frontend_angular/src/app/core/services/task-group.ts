import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTaskGroupRequest, TaskGroup, UpdateTaskGroupRequest } from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class TaskGroupService {
private readonly API_URL = `${environment.apiUrl}/taskGroup`;

  constructor(private http: HttpClient) {}

  getTaskGroup(taskGroupId: string): Observable<TaskGroup> {
    return this.http.get<TaskGroup>(`${this.API_URL}/${taskGroupId}`);
  }

  getTaskGroupsByProject(projectId: string): Observable<TaskGroup[]> {
    return this.http.get<TaskGroup[]>(`${this.API_URL}/byProject/${projectId}`);
  }

  // admin routes
  createTaskGroup(data: CreateTaskGroupRequest): Observable<TaskGroup> {
    return this.http.post<TaskGroup>(`${this.API_URL}`, data);
  }

  updateTaskGroup(taskGroupId: string, data: UpdateTaskGroupRequest ): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${taskGroupId}`, data);
  }

  deleteTaskGroup(taskGroupId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${taskGroupId}`);
  }
}