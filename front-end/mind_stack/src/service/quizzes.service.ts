import { Injectable } from '@angular/core';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false'
}

export interface QuestionItem {
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  answer?: string;
}

export interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  questions: QuestionItem[];
  questionType: QuestionType;
  created_at: Date;
  is_public: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {
  private quizzes: Quiz[] = [];

  getQuizzes(): Quiz[] {
    return [...this.quizzes];
  }

  addQuiz(quiz: Quiz): void {
    this.quizzes.push({ ...quiz });
  }

  deleteQuiz(quizId: number): void {
    this.quizzes = this.quizzes.filter(quiz => quiz.quiz_id !== quizId);
  }

  getQuizById(id: number): Quiz | undefined {
    const found = this.quizzes.find(quiz => quiz.quiz_id === id);
    return found ? { 
      ...found, 
      questions: [...found.questions.map(q => ({ ...q }))] 
    } : undefined;
  }

  updateQuiz(quiz: Quiz): void {
    const index = this.quizzes.findIndex(q => q.quiz_id === quiz.quiz_id);
    if (index !== -1) {
      this.quizzes[index] = { ...quiz };
    }
  }
}

