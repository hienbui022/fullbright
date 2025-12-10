import api from './api';

const LessonService = {
  getAllLessons: async ({ page = 1, limit = 10, search = '', courseId = null }) => {
    try {
      const params = {
        page,
        limit,
        search
      };
      
      if (courseId) {
        params.courseId = courseId;
      }
      
      const response = await api.get('/lessons', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  getAllLessonsForSelect: async (courseId = null) => {
    try {
      const params = { limit: 9999 };
      if (courseId) {
        params.courseId = courseId;
      }
      const response = await api.get('/lessons', { params });
      return response.data?.data?.lessons || response.data?.data || [];
    } catch (error) {
      console.error('Error fetching all lessons for select:', error);
      return [];
    }
  },

  getLessonById: async (id) => {
    try {
      const response = await api.get(`/lessons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createLesson: async (lessonData) => {
    try {
      // Use FormData if the lesson contains files
      if (lessonData.content_file instanceof File || lessonData.thumbnail instanceof File) {
        const formData = new FormData();
        Object.keys(lessonData).forEach(key => {
          formData.append(key, lessonData[key]);
        });
        
        const response = await api.post('/lessons', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.post('/lessons', lessonData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  updateLesson: async (id, lessonData) => {
    try {
      // Use FormData if the lesson contains files
      if (lessonData.content_file instanceof File || lessonData.thumbnail instanceof File) {
        const formData = new FormData();
        Object.keys(lessonData).forEach(key => {
          formData.append(key, lessonData[key]);
        });
        
        const response = await api.put(`/lessons/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.put(`/lessons/${id}`, lessonData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  deleteLesson: async (id) => {
    try {
      const response = await api.delete(`/lessons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadContent: async (id, formData) => {
    try {
      const response = await api.post(`/lessons/${id}/content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  publishLesson: async (id, isPublished) => {
    try {
      const response = await api.patch(`/lessons/${id}/publish`, { isPublished });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  reorderLessons: async (courseId, lessonOrder) => {
    try {
      const response = await api.put(`/courses/${courseId}/lessons/reorder`, { lessonOrder });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default LessonService; 