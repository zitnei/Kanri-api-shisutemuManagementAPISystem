import apiClient from './client';
import type { ApiResponse, AuthUser } from '../types';

interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data.data!;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    '/auth/refresh',
    { refreshToken }
  );
  return response.data.data!;
}

export async function getProfile(): Promise<AuthUser> {
  const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/profile');
  return response.data.data!;
}
