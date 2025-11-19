import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { Observable } from 'rxjs';
import { User,
  RegisterRequest, 
  RegisterResponse, 
  LoginRequest, 
  LoginResponse, 
  AuthError,
  EditProfileRequest,
  EditProfileResponse 
 } from '../app/models/user.model';
@Injectable({
  providedIn: 'root'
})

export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable <User[]> {
    return this.http.get<User[]>(this.apiUrl)
  }

  createUser(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<RegisterResponse>(this.apiUrl, registerRequest, { headers });
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest, { headers });
  }

  editProfile(editRequest: EditProfileRequest): Observable<EditProfileResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<EditProfileResponse>(`${this.apiUrl}/profile`, editRequest, { headers });
  }
}
