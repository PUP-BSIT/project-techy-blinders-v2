export interface QuizResult {
    quizId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
}

export interface QuizAttemptResponse {
    attemptId: number;
    quizSetId: number;
    userId: number;
    quizSetTitle: string;
    attemptedDate: Date;
    totalScore: number;
    maxScore: number;
    percentage: number;
    results: QuizResult[];
}

export interface SubmitQuizAnswer {
    quizId: number;
    userAnswer: string;
}

export interface SubmitQuizAttemptRequest {
    userId: number;
    quizSetId: number;
    answers: SubmitQuizAnswer[];
}