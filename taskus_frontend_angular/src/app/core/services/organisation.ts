import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  private readonly API_URL = 'http://localhost:3000/organisation';

  constructor(private http: HttpClient) {}

  // public routes
  getAllOrganisations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/all`);
  }

  createOrganisation(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}`, data);
  }

  // authenticated routes
  getOrganisation(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}`);
  }

  updateOrganisation(data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}`, data);
  }

  uploadPic(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pic', file);
    // NO headers passed here! angular/browser handles multipart boundary automatically.
    return this.http.post<any>(`${this.API_URL}/uploadPic`, formData);
  }
}