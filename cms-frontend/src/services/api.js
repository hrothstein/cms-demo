import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Cards API
export const cardsAPI = {
  getCards: () => api.get('/cards'),
  getCard: (cardId) => api.get(`/cards/${cardId}`),
  lockCard: (cardId, reason) => api.put(`/cards/${cardId}/lock`, { reason }),
  unlockCard: (cardId) => api.put(`/cards/${cardId}/unlock`),
  updateControls: (cardId, controls) => api.put(`/cards/${cardId}/controls`, controls),
  reportLost: (cardId, data) => api.post(`/cards/${cardId}/report-lost`, data),
};

// Transactions API
export const transactionsAPI = {
  getCardTransactions: (cardId, params) => api.get(`/cards/${cardId}/transactions`, { params }),
  getTransaction: (transactionId) => api.get(`/transactions/${transactionId}`),
};

// Alerts API
export const alertsAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  markAsRead: (alertId) => api.put(`/alerts/${alertId}/read`),
  dismiss: (alertId) => api.put(`/alerts/${alertId}/dismiss`),
  getPreferences: () => api.get('/alerts/preferences'),
  updatePreferences: (preferences) => api.put('/alerts/preferences', preferences),
};

// Disputes API
export const disputesAPI = {
  submitDispute: (data) => api.post('/disputes', data),
  getDisputes: (params) => api.get('/disputes', { params }),
  getDispute: (disputeId) => api.get(`/disputes/${disputeId}`),
  addComment: (disputeId, comment) => api.post(`/disputes/${disputeId}/comments`, { comment }),
};

// Card Services API
export const cardServicesAPI = {
  viewPin: (data) => api.post('/card-services/view-pin', data),
  changePin: (data) => api.post('/card-services/change-pin', data),
  requestReplacement: (data) => api.post('/card-services/request-replacement', data),
  activateCard: (data) => api.post('/card-services/activate', data),
};

export default api;
