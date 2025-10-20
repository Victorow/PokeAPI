export interface User {
  id: number;
  nome: string;
  login: string;
  email: string;
  role?: string;
}

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: User;
}

export interface RegisterRequest {
  nome: string;
  login: string;
  email: string;
  senha: string;
}
