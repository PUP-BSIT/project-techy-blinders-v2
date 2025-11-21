export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    IDENTFICATION = 'identfication',
    TRUE_FALSE = 'true_false'
}

export interface Quiz {
    quiz_id: number;
    flashcard_id: number;
    question: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    identfication_answer?: string;
    correct_answer: string;
    created_at: Date;
}

export interface QuizRequest {
    question: string;
    question_type: QuestionType;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    identification_answer?: string;
    correct_answer: string;
}

export interface QuizResponse {
    quiz_id: number;
}

export interface QuizError {
  error_message: string;
}