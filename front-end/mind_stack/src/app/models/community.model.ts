export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  rating: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  timestamp: Date;
  comments: Comment[];
  showComments: boolean;
  quizTitle?: string;
  flashcardCount?: number;
}

export interface QuestionData {
  title: string;
  content: string;
}