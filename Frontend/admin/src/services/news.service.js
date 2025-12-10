import api from './api';

const NewsService = {
  getAllNews: async ({ page = 1, limit = 10, search = '' }) => {
    try {
      const response = await api.get('/news', {
        params: {
          page,
          limit,
          search
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  getNewsById: async (id) => {
    try {
      const response = await api.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createNews: async (newsData) => {
    try {
      // Use FormData if the news contains images
      if (newsData.image instanceof File) {
        const formData = new FormData();
        Object.keys(newsData).forEach(key => {
          formData.append(key, newsData[key]);
        });
        
        const response = await api.post('/news', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.post('/news', newsData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  updateNews: async (id, newsData) => {
    try {
      // Use FormData if the news contains images
      if (newsData.image instanceof File) {
        const formData = new FormData();
        Object.keys(newsData).forEach(key => {
          formData.append(key, newsData[key]);
        });
        
        const response = await api.put(`/news/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.put(`/news/${id}`, newsData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadNewsImage: async (id, formData) => {
    try {
      const response = await api.post(`/news/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default NewsService; 