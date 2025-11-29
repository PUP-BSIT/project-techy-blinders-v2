import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../app/models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  http = inject(HttpClient);

  private apiUrl = 'https://techymindstack.site/api/users';

  registerUser(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<any>(this.apiUrl, userData).pipe(
      map(response => {
        return {
          account_succesfully_created: true,
          user_id: response.userId || response.user_id
        } as RegisterResponse;
      })
    );
  }

  loginUser(userData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, userData);
  }
}
