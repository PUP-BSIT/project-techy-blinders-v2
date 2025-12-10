import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DashboardData {
  userName: string;
  userId: number;
  userEmail: string;
  flashcardCount: number;
  quizCount: number;
  recentFlashcards: any[];
  recentQuizzes: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'https://techymindstack.site/api';

  getDashboardData(userId: number): Observable<DashboardData> {
    return forkJoin({
      user: this.http.get<any>(`${this.apiUrl}/users/me`),
      flashcards: this.http.get<any[]>(`${this.apiUrl}/flashcards/user/${userId}`),
      quizzes: this.http.get<any[]>(`${this.apiUrl}/quiz`)
    }).pipe(
      map(({ user, flashcards, quizzes }) => ({
        userName: user.username,
        userId: user.userId,
        userEmail: user.email,
        flashcardCount: flashcards.length,
        quizCount: quizzes.length,
        recentFlashcards: flashcards.slice(0, 5),
        recentQuizzes: quizzes.slice(0, 5)
      }))
    );
  }
}
