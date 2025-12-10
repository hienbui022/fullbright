import api from './api';

const CommunityService = {
  getAllPosts: async (params = {}) => {
    try {
      const response = await api.get('/community/posts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPostById: async (id) => {
    try {
      const response = await api.get(`/community/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      // Use FormData if the post contains images
      if (postData.image instanceof File) {
        const formData = new FormData();
        Object.keys(postData).forEach(key => {
          formData.append(key, postData[key]);
        });
        
        const response = await api.post('/community/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.post('/community/posts', postData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    try {
      // Use FormData if the post contains images
      if (postData.image instanceof File) {
        const formData = new FormData();
        Object.keys(postData).forEach(key => {
          formData.append(key, postData[key]);
        });
        
        const response = await api.put(`/community/posts/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.put(`/community/posts/${id}`, postData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      const response = await api.delete(`/community/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Comments
  getComments: async (postId) => {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/community/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default CommunityService; 