<template>
  <div class="bg-white shadow sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Create New Blog</h3>
      <form @submit.prevent="handleSubmit" class="mt-5 space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
          <div class="mt-1">
            <input type="text" name="title" id="title" v-model="form.title" required class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border">
          </div>
        </div>

        <div>
          <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
          <div class="mt-1">
            <textarea id="content" name="content" rows="5" v-model="form.content" required class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"></textarea>
          </div>
        </div>

        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <div class="mt-1">
            <input type="text" name="tags" id="tags" v-model="form.tags" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Cover Image</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileChange">
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          <p v-if="file" class="mt-2 text-sm text-gray-500">Selected: {{ file.name }}</p>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {{ loading ? 'Creating...' : 'Create Blog' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import blogApi from '@/api/blog';

const router = useRouter();
const loading = ref(false);
const file = ref(null);

const form = reactive({
  title: '',
  content: '',
  tags: '',
});

const handleFileChange = (e) => {
  file.value = e.target.files[0];
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('tags', form.tags); // Backend handles splitting
    if (file.value) {
      formData.append('image', file.value);
    }

    await blogApi.createBlog(formData);
    router.push('/');
  } catch (error) {
    console.error(error);
    alert('Failed to create blog');
  } finally {
    loading.value = false;
  }
};
</script>
