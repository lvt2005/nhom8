import { defineStore } from 'pinia';
import axiosInstance from '@/api/axiosInstance';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.post('/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data;
        localStorage.setItem('token', this.token);
        router.push('/');
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
      } finally {
        this.loading = false;
      }
    },
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.post('/auth/register', userData);
        this.token = response.data.token;
        this.user = response.data;
        localStorage.setItem('token', this.token);
        router.push('/');
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      router.push({ name: 'Login' });
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await axiosInstance.get('/auth/me');
        this.user = response.data;
      } catch (error) {
        this.logout();
      }
    },
  },
});
