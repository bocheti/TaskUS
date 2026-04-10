import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CreateTaskRequest, Task, UpdateTaskResponsibleRequest, UpdateTaskStatusRequest } from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = `${environment.apiUrl}/task`;

  constructor(private http: HttpClient) {}

  // authenticated routes
  getTask(taskId: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${taskId}`);
  }

  updateTaskStatus(taskId: string, data: UpdateTaskStatusRequest): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/status/${taskId}`, data);
  }

  getTasksByUser(userId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/byUser/${userId}`);
  }

  getTasksByTaskGroup(taskGroupId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/byTaskGroup/${taskGroupId}`);
  }

  getTasksByUserAndProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/byUserAndProject/${projectId}`);
  }

  // admin routes
  createTask(data: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}`, data);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${taskId}`);
  }

  updateTaskResponsible(taskId: string, data: UpdateTaskResponsibleRequest): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${taskId}`, data);
  }

  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/byProject/${projectId}`);
  }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/all`);
  }
}