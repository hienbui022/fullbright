import api from './api';

const ForumService = {
  // Get all forum posts with filters and pagination
  getAllPosts: async (params = {}) => {
    try {
      const response = await api.get('/community/forum/posts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single forum post by ID
  getPostById: async (id) => {
    try {
      const response = await api.get(`/community/forum/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new forum post
  createPost: async (postData) => {
    try {
      // Use FormData if the post contains images
      if (postData.image instanceof File) {
        const formData = new FormData();
        Object.keys(postData).forEach(key => {
          formData.append(key, postData[key]);
        });
        
        const response = await api.post('/community/forum/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.post('/community/forum/posts', postData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  // Update a forum post
  updatePost: async (id, postData) => {
    try {
      // Use FormData if the post contains images
      if (postData.image instanceof File) {
        const formData = new FormData();
        Object.keys(postData).forEach(key => {
          formData.append(key, postData[key]);
        });
        
        const response = await api.put(`/community/forum/posts/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.put(`/community/forum/posts/${id}`, postData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  // Delete a forum post
  deletePost: async (id) => {
    try {
      const response = await api.delete(`/community/forum/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark a post as resolved
  markAsResolved: async (id) => {
    try {
      const response = await api.put(`/community/forum/posts/${id}/resolve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like/Unlike a post
  toggleLike: async (id) => {
    try {
      const response = await api.post(`/community/forum/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search posts
  searchPosts: async (searchParams) => {
    try {
      const response = await api.get('/community/forum/posts', {
        params: {
          search: searchParams.query,
          category: searchParams.category,
          tag: searchParams.tag,
          sort: searchParams.sort,
          page: searchParams.page,
          limit: searchParams.limit
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ForumService; 