import api from './api';

const FlashcardService = {
  getAllFlashcards: async (params = {}) => {
    try {
      const response = await api.get('/flashcards', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcards:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getFlashcardById: async (id) => {
    try {
      const response = await api.get(`/flashcards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flashcard ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  createFlashcard: async (flashcardData) => {
    try {
      const response = await api.post('/flashcards', flashcardData);
      return response.data;
    } catch (error) {
      console.error('Error creating flashcard:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateFlashcard: async (id, flashcardData) => {
    try {
      const response = await api.put(`/flashcards/${id}`, flashcardData);
      return response.data;
    } catch (error) {
      console.error(`Error updating flashcard ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteFlashcard: async (id) => {
    try {
      const response = await api.delete(`/flashcards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting flashcard ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getFlashcardsByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/flashcards/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching flashcards for category ${category}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getUserFlashcardProgress: async (flashcardId) => {
    try {
      const response = await api.get(`/flashcards/progress/${flashcardId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching progress for flashcard ${flashcardId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateUserFlashcardProgress: async (flashcardId, progressData) => {
    try {
      const response = await api.post(`/flashcards/progress/${flashcardId}`, progressData);
      return response.data;
    } catch (error) {
      console.error(`Error updating progress for flashcard ${flashcardId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getFlashcardsForReview: async (params = {}) => {
    try {
      const response = await api.get('/flashcards/review/due', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcards for review:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getFlashcardProgressStats: async () => {
    try {
      const response = await api.get('/flashcards/progress/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcard progress stats:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default FlashcardService; 