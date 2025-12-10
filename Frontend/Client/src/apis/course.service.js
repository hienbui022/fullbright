import api from './api';

const CourseService = {
  getAllCourses: async (params = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    try {
      const response = await api.get('/courses', {
        params: {
          page,
          limit,
          search
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getCourseById: async (id) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course by ID:', error.response?.data || error.message);
      throw error;
    }
  },

  createCourse: async (courseData) => {
    try {
      console.log('Creating course with token:', localStorage.getItem('token'));
      console.log('Course data:', courseData);
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCourse: async (id, courseData) => {
    try {
      console.log('Updating course with token:', localStorage.getItem('token'));
      console.log('Course data:', courseData);
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      console.log('Deleting course with token:', localStorage.getItem('token'));
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error.response?.data || error.message);
      throw error;
    }
  },


  publishCourse: async (id, isPublished) => {
    try {
      const response = await api.patch(`/courses/${id}/publish`, { isPublished });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLessonsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/lessons`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEnrollmentStats: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default CourseService; 