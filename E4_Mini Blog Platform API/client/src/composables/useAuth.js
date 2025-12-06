import { useAuthStore } from '@/store/auth';
import { storeToRefs } from 'pinia';

export function useAuth() {
  const authStore = useAuthStore();
  const { user, isAuthenticated, loading, error } = storeToRefs(authStore);
  const { login, register, logout, fetchUser } = authStore;

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    fetchUser,
  };
}
