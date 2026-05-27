
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'candidate' | 'recruiter';
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: string;
  };
  token: string;
}