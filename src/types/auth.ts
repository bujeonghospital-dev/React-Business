// Authentication related types

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface AuthError {
  field?: string;
  message: string;
}
