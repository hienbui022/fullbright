import api from './api';

const CommentService = {
  // Get comments for a forum post or lesson
  getComments: async (params = {}) => {
    try {
      const response = await api.get('/community/comments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new comment
  createComment: async (commentData) => {
    try {
      const response = await api.post('/community/comments', commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a comment
  updateComment: async (id, commentData) => {
    try {
      const response = await api.put(`/community/comments/${id}`, commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (id) => {
    try {
      const response = await api.delete(`/community/comments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like/Unlike a comment
  toggleLike: async (id) => {
    try {
      const response = await api.post(`/community/comments/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark comment as accepted answer
  acceptAnswer: async (id) => {
    try {
      const response = await api.put(`/community/comments/${id}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get replies for a comment
  getReplies: async (commentId) => {
    try {
      const response = await api.get('/community/comments', {
        params: {
          parentId: commentId
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a reply to a comment
  createReply: async (parentId, content) => {
    try {
      const response = await api.post('/community/comments', {
        parentId,
        content
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default CommentService; 