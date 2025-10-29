export interface QuizAttempt {
    attempt_id: number;
    quiz_id: number;
    user_id: number;
    selected_answer: string;
    is_correct: boolean;
    attempt_date: Date;
    total_score: number;
    study_streak: number;
}

export interface QuizAttemptRequest {
    quiz_id: string;
    flashcard_id: string;
    user_id: string;
    selected_answer?: string;
}

export interface QuizAttemptResponse {
  selected_answer: string;
  is_correct: boolean;
  attempt_date: Date;
  total_score: number;
  attempt_streak: number;
}

export interface QuizAttemptError {
  error_message: string;
}