import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  allowedApps: string[];
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const publicAccess = ref<boolean>(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isGuest = computed(() => user.value?.role === 'guest');

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  function setGuestUser() {
    user.value = {
      id: 'guest',
      username: 'guest',
      email: '',
      role: 'guest',
      allowedApps: []
    };
  }

  async function fetchPublicAccess() {
    try {
      const response = await fetch('/api/auth/config');
      const data = await response.json();
      publicAccess.value = data.publicAccess;
    } catch (e) {
      console.error('Failed to fetch public access config', e);
      publicAccess.value = false;
    }
  }

  async function fetchUser() {
    if (!token.value) return;
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token validation failed');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Token validation failed');
      }
      
      user.value = {
        id: result.user.id,
        username: result.user.username,
        email: '',
        role: result.user.role,
        allowedApps: []
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
  }

  return {
    user,
    token,
    publicAccess,
    isAuthenticated,
    isAdmin,
    isGuest,
    setToken,
    setGuestUser,
    fetchPublicAccess,
    fetchUser,
    login,
    logout
  };
});
