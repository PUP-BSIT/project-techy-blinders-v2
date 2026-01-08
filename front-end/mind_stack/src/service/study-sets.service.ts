import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StudySet {
  flashcard_id: number;
  title: string;
  description: string;
  flashcards: { flashcardId?: number; keyTerm: string; definition: string }[];
  created_at: Date;
  is_public: boolean;
}

// Backend DTOs
interface CreateFlashcardSetRequest {
  userId: number;
  title: string;
  description: string;
  /**
   * Frontend uses `isPublic` but backend boolean properties are often exposed as `public`.
   * Keep `isPublic` for type safety and also send a `public` flag for compatibility.
   */
  isPublic: boolean;
  flashcards: { flashcardId?: number; title: string; description: string }[];
  // Optional alias used by some backends
  public?: boolean;
}

interface FlashcardSetResponse {
  studySetId: number;
  userId: number;
  title: string;
  description: string;
  /**
   * Support both shapes coming from the backend (`public` or `isPublic`).
   */
  public?: boolean;
  isPublic?: boolean;
  slug: string;
  flashcards: {
    flashcardId: number;
    studySetId: number;
    title: string;
    description: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class StudySetsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/flashcards';

  /**
   * Create a new flashcard set
   * POST /api/flashcards
   */
  createStudySet(userId: number, title: string, description: string, isPublic: boolean, flashcards: { keyTerm: string; definition: string; flashcardId?: number }[]): Observable<StudySet> {
    const request: CreateFlashcardSetRequest = {
      userId,
      title,
      description,
      isPublic,
      flashcards: flashcards.map(f => ({
        flashcardId: f.flashcardId,
        title: f.keyTerm,
        description: f.definition
      }))
    };
    // Ensure compatibility with backends that expect `public` instead of `isPublic`
    (request as any).public = isPublic;

    return this.http.post<FlashcardSetResponse>(this.apiUrl, request).pipe(
      map(response => {
        console.log('Create study set response:', response);
        return this.mapResponseToStudySet(response);
      })
    );
  }

  /**
   * Get all flashcard sets for a user
   * GET /api/flashcards/user/{userId}
   */
  getStudySetsByUserId(userId: number): Observable<StudySet[]> {
    return this.http.get<FlashcardSetResponse[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(responses => {
        console.log('Get study sets response:', responses);
        return (responses || []).map(response => this.mapResponseToStudySet(response));
      })
    );
  }

  /**
   * Get a flashcard set by ID
   * GET /api/flashcards/id/{id}
   */
  getStudySetById(id: number): Observable<StudySet> {
    return this.http.get<FlashcardSetResponse>(`${this.apiUrl}/id/${id}`).pipe(
      map(response => this.mapResponseToStudySet(response))
    );
  }

  /**
   * Update a flashcard set
   * PUT /api/flashcards/{id}
   */
  updateStudySet(id: number, userId: number, title: string, description: string, isPublic: boolean, flashcards: { keyTerm: string; definition: string; flashcardId?: number }[]): Observable<StudySet> {
    const request: CreateFlashcardSetRequest = {
      userId,
      title,
      description,
      isPublic,
      flashcards: flashcards.map(f => ({
        flashcardId: f.flashcardId,
        title: f.keyTerm,
        description: f.definition
      }))
    };
    // Ensure compatibility with backends that expect `public` instead of `isPublic`
    (request as any).public = isPublic;

    return this.http.put<FlashcardSetResponse>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => this.mapResponseToStudySet(response))
    );
  }

  /**
   * Delete a flashcard set
   * DELETE /api/flashcards/{id}
   */
  deleteStudySet(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  /**
   * Get all public flashcard sets
   * GET /api/flashcards/public
   */
  getPublicStudySets(): Observable<StudySet[]> {
    return this.http.get<FlashcardSetResponse[]>(`${this.apiUrl}/public`).pipe(
      map(responses => responses.map(response => this.mapResponseToStudySet(response)))
    );
  }

  /**
   * Add a single flashcard to an existing set
   * POST /api/flashcards/{studySetId}/flashcard
   */
  addFlashcardToSet(studySetId: number, keyTerm: string, definition: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${studySetId}/flashcard`, {
      title: keyTerm,
      description: definition
    }, { responseType: 'text' as 'json' });
  }

  /**
   * Update a single flashcard
   * PUT /api/flashcards/flashcard/{flashcardId}
   */
  updateFlashcard(flashcardId: number, keyTerm: string, definition: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/flashcard/${flashcardId}`, {
      title: keyTerm,
      description: definition
    }, { responseType: 'text' as 'json' });
  }

  /**
   * Delete a single flashcard
   * DELETE /api/flashcards/flashcard/{flashcardId}
   */
  deleteFlashcard(flashcardId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/flashcard/${flashcardId}`, { responseType: 'text' }) as Observable<string>;
  }

  /**
   * Map backend response to frontend StudySet format
   */
  private mapResponseToStudySet(response: FlashcardSetResponse): StudySet {
    if (!response) {
      throw new Error('Response is null or undefined');
    }

    const resolvedIsPublic =
      (response as any).public ??
      response.isPublic ??
      false;

    return {
      flashcard_id: response.studySetId || 0,
      title: response.title || '',
      description: response.description || '',
      flashcards: (response.flashcards || [])
        .sort((a, b) => (a.flashcardId || 0) - (b.flashcardId || 0))
        .map(f => ({
          flashcardId: f.flashcardId,
          keyTerm: f.title || '',
          definition: f.description || ''
        })),
      created_at: new Date(),
      is_public: resolvedIsPublic
    };
  }
}