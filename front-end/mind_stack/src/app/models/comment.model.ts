export interface Comment {
  comment_id: string;
  flashcard_id?: number;
  content: string;
  user_id: string;
  user_name: string;
  created_at: Date;
}

export interface CommentRequest {
  content: string;
  flashcard_id?: number;
}

export interface CommentResponse {
  comment_id: string;
}

export interface CommentError {
  error_message: string;
}