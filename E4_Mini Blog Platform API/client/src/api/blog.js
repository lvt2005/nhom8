import axiosInstance from './axiosInstance';

const getBlogs = (params) => {
  return axiosInstance.get('/blogs', { params });
};

const getBlogById = (id) => {
  return axiosInstance.get(`/blogs/${id}`);
};

const createBlog = (data) => {
  return axiosInstance.post('/blogs', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const updateBlog = (id, data) => {
  return axiosInstance.put(`/blogs/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const deleteBlog = (id) => {
  return axiosInstance.delete(`/blogs/${id}`);
};

export default {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
