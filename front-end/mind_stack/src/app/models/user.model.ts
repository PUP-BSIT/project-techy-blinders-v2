export interface User {
  userId: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  account_successfully_created: boolean;
  user_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
}

export interface AuthError {
  error_message: string;
}

export interface EditProfileRequest {
  name: string;
  email: string;
  username: string;
}

export interface EditProfileResponse {
  message: string;
  updated: boolean;
}