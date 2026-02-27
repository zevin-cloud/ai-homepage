import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  allowedApps: string[];
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  async function fetchUser() {
    if (!token.value) return;
    
    try {
      // Mock decoding for now since we don't have jwt-decode on frontend
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      user.value = {
        id: payload.id,
        username: payload.username,
        email: '', // Not in token payload currently
        role: payload.role,
        allowedApps: [] // Not in token payload currently
      };
      
    } catch (e) {
      console.error('Failed to fetch user', e);
      clearAuth();
    }
  }

  function login() {
    window.location.href = '/api/auth/login';
  }

  function logout() {
    clearAuth();
    // Navigation should be handled by the component calling logout
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setToken,
    fetchUser,
    login,
    logout
  };
});
