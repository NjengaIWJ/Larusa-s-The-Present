export interface ErrorResponse {
  message: string;
  errors?: Record<string, string>;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}