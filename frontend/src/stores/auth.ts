import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types';
import { authApi } from '../api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const register = async (name: string, email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.register({
        name,
        email,
        password,
        role: 'USER',
      });

      if (response.success && response.data) {
        user.value = response.data.user;
        return true;
      } else {
        error.value = response.message || 'Registration failed';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration error';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.login({
        email,
        password,
      });

      if (response.success && response.data) {
        user.value = response.data.user;
        return true;
      } else {
        error.value = response.message || 'Login failed';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login error';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      await authApi.logout();
      user.value = null;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout error';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const checkSession = async () => {
    try {
      const response = await authApi.getCurrentSession();
      if (response.success && response.data) {
        user.value = response.data.user;
      }
    } catch (err) {
      user.value = null;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setError,
    register,
    login,
    logout,
    checkSession,
  };
});
