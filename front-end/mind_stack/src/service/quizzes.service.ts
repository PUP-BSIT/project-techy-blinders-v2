import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum QuizType {
  MULTIPLE_CHOICE = 'multiple_choice',
  IDENTIFICATION_ANSWER = 'identification_answer'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  IDENTIFICATION = 'identification'
}

export interface QuizItem {
  quizId?: number;
  quizType: QuizType;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  identificationAnswer?: string;
  points?: number;
}

export interface QuizSet {
  quiz_set_id?: number;
  user_id: number;
  title: string;
  description: string;
  is_public: boolean;
  quiz_type: QuizType;
  slug?: string;
  quizzes: QuizItem[];
  created_at?: Date;
  updated_at?: Date;
}

interface CreateQuizSetRequest {
  userId: number;
  title: string;
  description: string;
  isPublic: boolean;
  quizType: QuizType;
  quizzes: {
    quizType: QuizType;
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
    identificationAnswer?: string;
    points?: number;
  }[];
}

interface QuizSetResponse {
  quizSetId: number;
  userId: number;
  title: string;
  description: string;
  isPublic: boolean;
  slug: string;
  quizType: QuizType;
  quizzes: {
    quizId: number;
    quizSetId: number;
    quizType: QuizType;
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
    identificationAnswer?: string;
    selectedAnswer?: string;
    isCorrect?: boolean;
  }[];
}

interface QuizItemRequest {
  quizType: QuizType;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  identificationAnswer?: string;
  points?: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/quizzes';

  createQuizSet(userId: number, title: string, description: string, isPublic: boolean, quizType: QuizType, quizzes: QuizItem[]): Observable<QuizSet> {
    const request: CreateQuizSetRequest = {
      userId,
      title,
      description,
      isPublic,
      quizType,
      quizzes: quizzes.map(q => ({
        quizType: q.quizType,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        identificationAnswer: q.identificationAnswer,
        points: q.points || 1
      }))
    };

    return this.http.post<QuizSetResponse>(this.apiUrl, request).pipe(
      map(response => {
        console.log('Create quiz set response:', response);
        return this.mapResponseToQuizSet(response);
      })
    );
  }

  getQuizSetsByUserId(userId: number): Observable<QuizSet[]> {
    return this.http.get<QuizSetResponse[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(responses => {
        console.log('Get quiz sets response:', responses);
        return (responses || []).map(response => this.mapResponseToQuizSet(response));
      })
    );
  }

  getQuizSetById(id: number): Observable<QuizSet> {
    return this.http.get<QuizSetResponse>(`${this.apiUrl}/id/${id}`).pipe(
      map(response => this.mapResponseToQuizSet(response))
    );
  }

  getQuizSetBySlug(slug: string): Observable<QuizSet> {
    return this.http.get<QuizSetResponse>(`${this.apiUrl}/slug/${slug}`).pipe(
      map(response => this.mapResponseToQuizSet(response))
    );
  }

  updateQuizSet(id: number, userId: number, title: string, description: string, isPublic: boolean, quizType: QuizType, quizzes: QuizItem[]): Observable<QuizSet> {
    const request: CreateQuizSetRequest = {
      userId,
      title,
      description,
      isPublic,
      quizType,
      quizzes: quizzes.map(q => ({
        quizType: q.quizType,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        identificationAnswer: q.identificationAnswer,
        points: q.points || 1
      }))
    };

    return this.http.put<QuizSetResponse>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => this.mapResponseToQuizSet(response))
    );
  }

  deleteQuizSet(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  getPublicQuizSets(): Observable<QuizSet[]> {
    return this.http.get<QuizSetResponse[]>(`${this.apiUrl}/public`).pipe(
      map(responses => responses.map(response => this.mapResponseToQuizSet(response)))
    );
  }

  addQuizToSet(quizSetId: number, quiz: QuizItem): Observable<any> {
    const request: QuizItemRequest = {
      quizType: quiz.quizType,
      question: quiz.question,
      optionA: quiz.optionA,
      optionB: quiz.optionB,
      optionC: quiz.optionC,
      optionD: quiz.optionD,
      correctAnswer: quiz.correctAnswer,
      identificationAnswer: quiz.identificationAnswer,
      points: quiz.points || 1
    };

    return this.http.post(`${this.apiUrl}/${quizSetId}/quiz`, request, { responseType: 'text' as 'json' });
  }

  deleteQuiz(quizId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/quiz/${quizId}`, { responseType: 'text' as 'json' });
  }

  private mapResponseToQuizSet(response: QuizSetResponse): QuizSet {
    return {
      quiz_set_id: response.quizSetId,
      user_id: response.userId,
      title: response.title,
      description: response.description,
      is_public: response.isPublic,
      quiz_type: response.quizType,
      slug: response.slug,
      quizzes: (response.quizzes || []).map(q => ({
        quizId: q.quizId,
        quizType: q.quizType,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        identificationAnswer: q.identificationAnswer,
        points: 1
      }))
    };
  }
}

