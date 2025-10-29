export interface Comment {
    commnet_id: number;
    flashcard_id: number;
    content: string;
    user_id: number;
    created_at: Date;
}

export interface CommentRequest {
    content: string;
}

export interface CommentResponse {
    comment_id: number;
}

export interface CommentError {
  error_message: string;
}