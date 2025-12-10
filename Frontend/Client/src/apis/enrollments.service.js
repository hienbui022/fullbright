import api from './api';

const EnrollmentService = {
  // Đăng ký khóa học
  enroll: async (courseId) => {
    try {
      const response = await api.post('/enrollments/enroll', { courseId });
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy danh sách khóa học đã đăng ký
  getMyEnrollments: async (params = {}) => {
    console.log(params);
    const { page = 1, limit = 10 } = params;
    try {
      const response = await api.get('/enrollments/my-enrollments', {
        params: {
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my enrollments:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy chi tiết đăng ký
  getEnrollmentById: async (id) => {
    try {
      const response = await api.get(`/enrollments/enrollment/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật tiến độ học tập
  updateProgress: async (id, progress) => {
    try {
      const response = await api.put(`/enrollments/enrollment/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error.response?.data || error.message);
      throw error;
    }
  },

  // Hủy đăng ký
  cancelEnrollment: async (id) => {
    try {
      const response = await api.delete(`/enrollments/enrollment/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling enrollment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Kiểm tra trạng thái đăng ký
  checkEnrollmentStatus: async (courseId) => {
    try {
      const response = await api.get(`/enrollments/course/${courseId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking enrollment status:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy danh sách học viên của một khóa học (cho admin)
  getCourseEnrollments: async (courseId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    try {
      const response = await api.get(`/enrollments/course/${courseId}/enrollments`, {
        params: {
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course enrollments:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default EnrollmentService; 