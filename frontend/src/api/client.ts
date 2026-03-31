import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - attach auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401 and retry
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/login')
      ) {
        if (isRefreshing) {
          // Queue requests while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(client(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

        if (!refreshToken) {
          clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          setTokens(newAccessToken, newRefreshToken);
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Retry wrapper with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const axiosErr = error as AxiosError;
      const isNetworkError = !axiosErr.response;
      const isServerError = axiosErr.response?.status && axiosErr.response.status >= 500;

      if ((!isNetworkError && !isServerError) || attempt === maxAttempts) {
        throw error;
      }

      const delay = Math.min(100 * Math.pow(2, attempt - 1) + Math.random() * 100, 5000);
      await sleep(delay);
    }
  }

  throw lastError;
}

export const apiClient = createApiClient();
export default apiClient;
