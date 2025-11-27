export interface Post {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  timestamp: Date;
  commentCount: number;
  showComments: boolean;
  quizTitle?: string;
  flashcardCount?: number;
}

export interface QuestionData {
  title: string;
  content: string;
}