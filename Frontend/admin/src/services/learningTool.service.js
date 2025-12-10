import api from './api';

const LearningToolService = {
  getAllLearningTools: async (params = {}) => {
    try {
      const response = await api.get('/learning-tools', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLearningToolById: async (id) => {
    try {
      const response = await api.get(`/learning-tools/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createLearningTool: async (toolData) => {
    try {
      // Use FormData if the tool contains images or files
      if (toolData.image instanceof File) {
        const formData = new FormData();
        Object.keys(toolData).forEach(key => {
          formData.append(key, toolData[key]);
        });
        
        const response = await api.post('/learning-tools', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.post('/learning-tools', toolData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  updateLearningTool: async (id, toolData) => {
    try {
      // Use FormData if the tool contains images or files
      if (toolData.image instanceof File) {
        const formData = new FormData();
        Object.keys(toolData).forEach(key => {
          formData.append(key, toolData[key]);
        });
        
        const response = await api.put(`/learning-tools/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.put(`/learning-tools/${id}`, toolData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  deleteLearningTool: async (id) => {
    try {
      const response = await api.delete(`/learning-tools/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default LearningToolService; 