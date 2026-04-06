import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginCredentials, LoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Define your backend URL (equivalent to your VITE_API_BASE_URL)
  private readonly API_URL = `${environment.apiUrl}`;

  // BehaviorSubjects hold the current state (like useState in React)
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  // Observables allow components to "listen" to state changes
  public user$: Observable<User | null> = this.userSubject.asObservable();
  public token$: Observable<string | null> = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check localStorage when the app first loads
    this.loadFromStorage();
  }

  // Getters for synchronous access when you don't want to subscribe
  get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  get currentTokenValue(): string | null {
    return this.tokenSubject.value;
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/user/login`, credentials).pipe(
      tap((response) => {
        this.setAuthData(response.authToken, response.userInfo);
      })
    );
  }

  logout(): void {
    this.userSubject.next(null);
    this.tokenSubject.next(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  setAuthData(token: string, user: User): void {
    this.tokenSubject.next(token);
    this.userSubject.next(user);
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateUser(updatedUser: User): void {
    this.userSubject.next(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }

  // Helper to load session on refresh
  private loadFromStorage(): void {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      this.tokenSubject.next(storedToken);
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  // Helper for Route Guards
  isAuthenticated(): boolean {
    return !!this.currentTokenValue;
  }
}