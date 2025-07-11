import { apiRequest } from "./queryClient";
import type { User } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  address: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    this.removeToken();
    this.removeUser();
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data = await response.json();
    
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', credentials);
    const data = await response.json();
    
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiRequest('GET', '/api/auth/me');
    const data = await response.json();
    
    this.setUser(data.user);
    return data.user;
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
