import api from './api';

const ExerciseService = {
  getAllExercises: async ({ page = 1, limit = 10, search = '', lessonId = null }) => {
    try {
      const params = {
        page,
        limit,
        search
      };
      
      if (lessonId) {
        params.lessonId = lessonId;
      }
      
      const response = await api.get('/exercises', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  getExerciseById: async (id) => {
    try {
      const response = await api.get(`/exercises/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      throw error;
    }
  },

  createExercise: async (exerciseData) => {
    try {
      const response = await api.post('/exercises', exerciseData);
      return response.data;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  },

  updateExercise: async (id, exerciseData) => {
    try {
      const response = await api.put(`/exercises/${id}`, exerciseData);
      return response.data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  },

  deleteExercise: async (id) => {
    try {
      const response = await api.delete(`/exercises/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  },

  // Quản lý câu hỏi
  addQuestion: async (exerciseId, questionData) => {
    try {
      const response = await api.post(`/exercises/${exerciseId}/questions`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  },

  updateQuestion: async (exerciseId, questionId, questionData) => {
    try {
      const response = await api.put(`/exercises/${exerciseId}/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  deleteQuestion: async (exerciseId, questionId) => {
    try {
      const response = await api.delete(`/exercises/${exerciseId}/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Sắp xếp lại thứ tự câu hỏi
  reorderQuestions: async (exerciseId, questionOrder) => {
    try {
      const response = await api.put(`/exercises/${exerciseId}/questions/reorder`, {
        questionOrder
      });
      return response.data;
    } catch (error) {
      console.error('Error reordering questions:', error);
      throw error;
    }
  },
  
  // Lấy tất cả câu hỏi của một bài tập
  getQuestionsByExerciseId: async (exerciseId) => {
    try {
      const response = await api.get(`/exercises/${exerciseId}/questions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },
  
  // Lấy thông tin câu hỏi chi tiết
  getQuestionById: async (exerciseId, questionId) => {
    try {
      const response = await api.get(`/exercises/${exerciseId}/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question details:', error);
      throw error;
    }
  },
  
  // Gửi kết quả làm bài 
  submitExerciseResult: async (exerciseId, resultData) => {
    try {
      const response = await api.post(`/exercises/${exerciseId}/results`, resultData);
      return response.data;
    } catch (error) {
      console.error('Error submitting exercise result:', error);
      throw error;
    }
  },
  
  // Lấy kết quả làm bài
  getExerciseResults: async (exerciseId, userId = null) => {
    try {
      const params = {};
      if (userId) {
        params.userId = userId;
      }
      
      const response = await api.get(`/exercises/${exerciseId}/results`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise results:', error);
      throw error;
    }
  }
};

export default ExerciseService; 