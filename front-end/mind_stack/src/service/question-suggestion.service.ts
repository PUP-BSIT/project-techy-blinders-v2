import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionSuggestion } from '../app/models/question-suggest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionSuggestionService {
  private apiUrl = 'https://techymindstack.site/api/suggestions';

  constructor(private http: HttpClient){}

  generateSuggestion(title: string, description: string): Observable<QuestionSuggestion> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      title: title,
      description: description
    };

    return this.http.post<QuestionSuggestion> (
      `${this.apiUrl}/questions`,
      body,
      {headers}
    );
  }
  
}
