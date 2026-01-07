import { inject, Injectable } from '@angular/core';
import { ContactRequest, ContactResponse } from '../app/models/contact.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://techymindstack.site/api/contact';

  constructor(private http: HttpClient){}

  sendContactForm(contact: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, contact);
  }
}