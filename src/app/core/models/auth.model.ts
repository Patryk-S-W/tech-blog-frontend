export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserProfile {
  userId: number;
  username: string;
}
