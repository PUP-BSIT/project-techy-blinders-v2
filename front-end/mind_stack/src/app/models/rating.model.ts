export interface Rating {
  rating_id: string;
  comment_id: string;
  user_id: string;
  rating_value: number;
  created_at?: Date;
}

export interface RatingRequest {
  comment_id: string;
  user_id: string;
  rating_value: number;
}

export interface RatingResponse {
  rating_id: string;
}

export interface RatingError {
  error_message: string;
}