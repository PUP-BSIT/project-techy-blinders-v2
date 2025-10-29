export interface User {
    user_id: number;
    username: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    account_succesfully_created: boolean;
    user_id: number;
}

export interface LoginRequest {
    user_id: number;
    passowrd: string;
}

export interface LoginResponse {
  login_successfull: boolean;
  user_id: number;
}

export interface AuthError {
  error_message: string;
}