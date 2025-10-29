export interface Rating {
  rating_id: number;
  comment_id: number;
  user_id: number;
  rating_value: number;
  createdAt?: Date;
}

export interface RatingRequest {
  comment_id: number;
  user_id: number;
  rating_value: number;
}

export interface RatingResponse {
  rating_id: number; 
}

export interface RatingError {
  error_message: string;
}