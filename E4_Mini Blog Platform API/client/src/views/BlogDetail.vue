<template>
  <div v-if="loading" class="text-center py-10">Loading...</div>
  <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>
  <div v-else-if="blog" class="bg-white overflow-hidden shadow sm:rounded-lg">
    <img v-if="blog.image" :src="getImageUrl(blog.image)" alt="Blog Image" class="w-full h-64 object-cover">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-2xl leading-6 font-medium text-gray-900">
        {{ blog.title }}
      </h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        By {{ blog.user?.username }} on {{ new Date(blog.createdAt).toLocaleDateString() }}
      </p>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div class="px-4 py-5 sm:px-6">
        <p class="text-gray-900 whitespace-pre-wrap">{{ blog.content }}</p>
      </div>
    </div>
    <div class="px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-between items-center">
      <div>
        <span v-for="tag in blog.tags" :key="tag" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
          {{ tag }}
        </span>
      </div>
      <div v-if="isOwner">
        <button @click="deleteBlog" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import blogApi from '@/api/blog';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const blog = ref(null);
const loading = ref(false);
const error = ref(null);

const isOwner = computed(() => {
  return authStore.user && blog.value && authStore.user._id === blog.value.user._id;
});

const fetchBlog = async () => {
  loading.value = true;
  try {
    const response = await blogApi.getBlogById(route.params.id);
    blog.value = response.data;
  } catch (err) {
    error.value = 'Failed to load blog';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteBlog = async () => {
  if (!confirm('Are you sure you want to delete this blog?')) return;
  try {
    await blogApi.deleteBlog(blog.value._id);
    router.push('/');
  } catch (err) {
    alert('Failed to delete blog');
  }
};

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${path}`;
};

onMounted(() => {
  fetchBlog();
});
</script>
