import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../app/models/user.model';

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  quizzesCreated: number;
  flashcardSetsCreated: number;
  totalLikes: number;
  // Add any other profile fields you need
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://techymindstack.site/api/users';

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  // Register user
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<any>(`${this.apiUrl}`, userData).pipe(
      map(res => ({
        account_successfully_created: true,
        user_id: res.userId || res.user_id
      } as RegisterResponse))
    );
  }

  // Login user
  login(userData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, userData).pipe(
      map(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.currentUserSubject.next(res);
        return res;
      })
    );
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get current user
  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  // Update password
  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    const body = { currentPassword, newPassword };
    return this.http.put<any>(`${this.apiUrl}/update-password`, body);
  }

  // Update email
  updateEmail(newEmail: string): Observable<any> {
    const body = { newEmail };
    return this.http.put<any>(`${this.apiUrl}/update-email`, body).pipe(
      map(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        return res;
      })
    );
  }

  // Update username
  updateUsername(newUsername: string): Observable<any> {
    const body = { newUsername };
    return this.http.put<any>(`${this.apiUrl}/update-username`, body);
  }

  // Reset password by email (for forgot password)
  resetPassword(request: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, request);
  }

  // Get user profile by ID
  getUserById(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`);
  }

  // Check if user is logged in and token is valid
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.parseJwt(token);
    if (!payload) return false;

    return payload.exp * 1000 > Date.now();
  }

  // Helper: parse JWT payload
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private getUserFromStorage(): LoginResponse | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}