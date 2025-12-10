import api from './api';

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Token saved to localStorage:', response.data.token);
      } else {
        console.error('No token received in login response');
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerAdmin: async (adminData) => {
    try {
      // Add role as admin to the data
      const adminUserData = { ...adminData, role: 'admin' };
      // Use the register-admin endpoint
      const response = await api.post('/auth/register-admin', adminUserData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerFirstAdmin: async (adminData) => {
    try {
      // For initial admin setup
      const response = await api.post('/auth/first-admin', adminData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = AuthService.getCurrentUser();
    return user && user.role === 'admin';
  },

  getProfile: async () => {
    try {
      console.log('Getting profile with token:', localStorage.getItem('token'));
      const response = await api.get('/auth/profile');
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put(`/users/${userData.id}`, userData);
      // Cập nhật thông tin người dùng trong localStorage
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...response.data.user
        }));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AuthService; 