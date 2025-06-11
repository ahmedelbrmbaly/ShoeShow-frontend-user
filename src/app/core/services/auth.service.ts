import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      this.fetchUserProfile(Number(userId)).subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId.toString());
          this.fetchUserProfile(response.userId).subscribe();
        })
      );
  }

  register(userData: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.currentUserSubject.next(null);
  }

  private fetchUserProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${userId}`)
      .pipe(
        tap(user => this.currentUserSubject.next(user))
      );
  }

  getUserProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${userId}`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  updateUserProfile(userId: number, userData: Partial<User>): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/users/${userId}`, userData).pipe(
      tap(() => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          this.currentUserSubject.next({ ...currentUser, ...userData });
        }
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }
}
