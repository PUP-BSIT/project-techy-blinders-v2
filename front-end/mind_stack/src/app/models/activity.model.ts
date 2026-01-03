export interface Activity {
  id: string;
  type: 'quiz' | 'flashcard';
  title: string;
  timestamp: Date;
  studySetId?: number;
  quizSetId?: number;
  score?: {
    totalScore: number;
    maxScore: number;
    percentage: number;
  };
}

export interface ActivityRequest {
  type: 'quiz' | 'flashcard';
  title: string;
  studySetId?: number;
  quizSetId?: number;
  score?: {
    totalScore: number;
    maxScore: number;
    percentage: number;
  };
}