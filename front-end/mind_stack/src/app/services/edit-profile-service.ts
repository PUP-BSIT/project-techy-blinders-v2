import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EditProfileRequest, EditProfileResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EditProfileService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/profile';

  constructor() {}

  updateProfile(data: EditProfileRequest): Observable<EditProfileResponse> {
    return this.http.put<EditProfileResponse>(`${this.apiUrl}/update`, data);
  }

  getProfile(): Observable<EditProfileRequest> {
    return this.http.get<EditProfileRequest>(`${this.apiUrl}`);
  }
}