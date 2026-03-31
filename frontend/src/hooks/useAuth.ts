import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth';

export function useAuth() {
  const { user, isAuthenticated, accessToken, refreshToken, setAuth, clearAuth } = useAuthStore();

  async function loginUser(email: string, password: string) {
    const result = await authApi.login(email, password);
    setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
    return result.user;
  }

  async function logoutUser() {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout errors - clear auth regardless
      }
    }
    clearAuth();
  }

  function hasPermission(permission: string): boolean {
    return user?.role.permissions.includes(permission) ?? false;
  }

  function hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some((p) => hasPermission(p));
  }

  return {
    user,
    isAuthenticated,
    accessToken,
    loginUser,
    logoutUser,
    hasPermission,
    hasAnyPermission,
  };
}
