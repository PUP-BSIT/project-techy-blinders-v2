import { Quiz } from './quiz.model';

export interface Flashcard {
    flashcard_id: number;
    title: string;
    description: string;
    user_id?: number;
    quizzes?: Quiz[];
    created_at: Date;
    is_public: boolean
}

export interface FlashcardRequest {
    title: string;
    description: string;
}

export interface FlashcardResponse {
    flashcard_id: number;
}

export interface FlashcardError {
    error_message: string;
}