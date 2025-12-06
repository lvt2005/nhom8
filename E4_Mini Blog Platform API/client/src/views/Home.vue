<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Latest Blogs</h1>
      <div class="flex space-x-4">
        <input 
          v-model="search" 
          @input="handleSearch" 
          type="text" 
          placeholder="Search..." 
          class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        >
        <select v-model="sort" @change="handleSort" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      Loading...
    </div>

    <div v-else-if="error" class="text-center py-10 text-red-500">
      {{ error }}
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
      <div v-for="blog in blogs" :key="blog._id" class="bg-white overflow-hidden shadow rounded-lg">
        <img v-if="blog.image" :src="getImageUrl(blog.image)" alt="Blog Image" class="h-48 w-full object-cover">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            <router-link :to="{ name: 'BlogDetail', params: { id: blog._id } }" class="hover:underline">
              {{ blog.title }}
            </router-link>
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            By {{ blog.user?.username }} on {{ new Date(blog.createdAt).toLocaleDateString() }}
          </p>
          <p class="mt-2 text-sm text-gray-500 line-clamp-3">
            {{ blog.content }}
          </p>
          <div class="mt-4">
            <span v-for="tag in blog.tags" :key="tag" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import blogApi from '@/api/blog';

const blogs = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref('');
const sort = ref('desc');

const fetchBlogs = async () => {
  loading.value = true;
  try {
    const response = await blogApi.getBlogs({ search: search.value, sort: sort.value });
    blogs.value = response.data;
  } catch (err) {
    error.value = 'Failed to load blogs';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchBlogs();
  }, 500);
};

let searchTimeout = null;

const handleSort = () => {
  fetchBlogs();
};

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${path}`;
};

onMounted(() => {
  fetchBlogs();
});
</script>
