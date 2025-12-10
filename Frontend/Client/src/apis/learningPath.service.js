import api from './api';

const LearningPathService = {
  getAllLearningPaths: async (params = {}) => {
    try {
      const response = await api.get('/learning-paths', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLearningPathById: async (id) => {
    try {
      const response = await api.get(`/learning-paths/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createLearningPath: async (learningPathData) => {
    try {
      // Use FormData if the learning path contains images
      if (learningPathData.thumbnail instanceof File) {
        const formData = new FormData();
        Object.keys(learningPathData).forEach(key => {
          formData.append(key, learningPathData[key]);
        });
        
        const response = await api.post('/learning-paths', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.post('/learning-paths', learningPathData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  updateLearningPath: async (id, learningPathData) => {
    try {
      // Use FormData if the learning path contains images
      if (learningPathData.thumbnail instanceof File) {
        const formData = new FormData();
        Object.keys(learningPathData).forEach(key => {
          formData.append(key, learningPathData[key]);
        });
        
        const response = await api.put(`/learning-paths/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.put(`/learning-paths/${id}`, learningPathData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  deleteLearningPath: async (id) => {
    try {
      const response = await api.delete(`/learning-paths/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadThumbnail: async (id, formData) => {
    try {
      const response = await api.post(`/learning-paths/${id}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách khóa học để thêm vào lộ trình
  getCoursesForPath: async () => {
    try {
      const response = await api.get('/courses', { 
        params: { 
          limit: 100,
          published: true
        } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addCoursesToLearningPath: async (learningPathId, courseIds) => {
    try {
      const response = await api.post(`/learning-paths/${learningPathId}/courses`, { courseIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeCoursesFromLearningPath: async (learningPathId, courseIds) => {
    try {
      const response = await api.delete(`/learning-paths/${learningPathId}/courses`, { 
        data: { courseIds } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default LearningPathService; 