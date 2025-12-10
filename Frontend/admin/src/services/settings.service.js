import api from './api';

const SettingsService = {
  getGeneralSettings: async () => {
    try {
      const response = await api.get('/settings/general');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateGeneralSettings: async (settings) => {
    try {
      const response = await api.put('/settings/general', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEmailSettings: async () => {
    try {
      const response = await api.get('/settings/email');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEmailSettings: async (settings) => {
    try {
      const response = await api.put('/settings/email', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  testEmailConnection: async (settings) => {
    try {
      const response = await api.post('/settings/email/test', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPaymentSettings: async () => {
    try {
      const response = await api.get('/settings/payment');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePaymentSettings: async (settings) => {
    try {
      const response = await api.put('/settings/payment', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSystemSettings: async () => {
    try {
      const response = await api.get('/settings/system');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/settings/system', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  clearCache: async () => {
    try {
      const response = await api.post('/settings/cache/clear');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default SettingsService; 