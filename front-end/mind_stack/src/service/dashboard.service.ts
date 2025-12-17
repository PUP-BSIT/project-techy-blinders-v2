import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
      user: this.http.get<any>(`${this.apiUrl}/users/me`).pipe(
        catchError(() => of({ username: 'User', userId: userId, email: 'user@example.com' }))
      ),
      flashcards: this.http.get<any[]>(`/api/flashcards/user/${userId}`).pipe(
        catchError(() => of([]))
      ),
      quizzes: this.http.get<any[]>(`/api/quizzes/user/${userId}`).pipe(
        catchError(() => of([]))
      )
    }).pipe(
      map(({ user, flashcards, quizzes }) => ({
        userName: user.username,
        userId: user.userId,
        userEmail: user.email,
        flashcardCount: flashcards.length,
        quizCount: quizzes.length,
        recentFlashcards: [],
        recentQuizzes: []
      }))
    );
  }
}
