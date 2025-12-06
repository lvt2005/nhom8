import { defineStore } from 'pinia';
import axiosInstance from '@/api/axiosInstance';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),
  actions: {
    // Example action to fetch all users (admin only usually)
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await axiosInstance.get('/users');
        this.users = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
