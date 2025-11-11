import { Injectable } from '@angular/core';

export interface StudySet {
  flashcard_id: number;
  title: string;
  description: string;
  flashcards: { keyTerm: string; definition: string }[];
  created_at: Date;
  is_public: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StudySetsService {
  private studySets: StudySet[] = [];

  getStudySets(): StudySet[] {
    return [...this.studySets];
  }

  addStudySet(studySet: StudySet): void {
    this.studySets.push({ ...studySet });
  }

  deleteStudySet(flashcardId: number): void {
    this.studySets = this.studySets.filter(set => set.flashcard_id !== flashcardId);
  }

  getStudySetById(id: number): StudySet | undefined {
    const found = this.studySets.find(set => set.flashcard_id === id);
    return found ? { ...found, flashcards: [...found.flashcards] } : undefined;
  }

  updateStudySet(studySet: StudySet): void {
    const index = this.studySets.findIndex(set => set.flashcard_id === studySet.flashcard_id);
    if (index !== -1) {
      this.studySets[index] = { ...studySet };
    }
  }
}