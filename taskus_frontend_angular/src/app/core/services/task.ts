import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000/task';

  constructor(private http: HttpClient) {}

  // authenticated routes
  getTask(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${taskId}`);
  }

  updateTaskStatus(taskId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/status/${taskId}`, data);
  }

  getTasksByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/byUser/${userId}`);
  }

  getTasksByTaskGroup(taskGroupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/byTaskGroup/${taskGroupId}`);
  }

  getTasksByUserAndProject(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/byUserAndProject/${projectId}`);
  }

  // admin routes
  createTask(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}`, data);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${taskId}`);
  }

  updateTaskResponsible(taskId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${taskId}`, data);
  }

  getTasksByProject(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/byProject/${projectId}`);
  }

  getAllTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/all`);
  }
}