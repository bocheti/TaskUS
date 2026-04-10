import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrganisationRequest, CreateOrganisationResponse, Organisation, OrganisationListItem, UpdateOrganisationRequest } from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  private readonly API_URL = `${environment.apiUrl}/organisation`;

  constructor(private http: HttpClient) {}

  // public routes
  getAllOrganisations(): Observable<OrganisationListItem[]> {
    return this.http.get<OrganisationListItem[]>(`${this.API_URL}/all`);
  }

  createOrganisation(data: CreateOrganisationRequest): Observable<CreateOrganisationResponse> {
    return this.http.post<CreateOrganisationResponse>(`${this.API_URL}`, data);
  }

  // authenticated routes
  getOrganisation(): Observable<Organisation> {
    return this.http.get<Organisation>(`${this.API_URL}`);
  }

  updateOrganisation(data: UpdateOrganisationRequest): Observable<Organisation> {
    return this.http.put<Organisation>(`${this.API_URL}`, data);
  }

  uploadPic(file: File): Observable<Organisation> {
    const formData = new FormData();
    formData.append('pic', file);
    // NO headers passed here! angular/browser handles multipart boundary automatically.
    return this.http.post<Organisation>(`${this.API_URL}/uploadPic`, formData);
  }
}