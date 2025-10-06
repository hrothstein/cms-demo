import axios from 'axios'

// Create axios instance
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://cms-backend-1759769281-c3f75c1b055e.herokuapp.com/api/v1' : '/api/v1');

console.log('API Client baseURL:', baseURL);
console.log('Environment:', import.meta.env.PROD ? 'production' : 'development');

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API methods
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
}

export const cardsAPI = {
  getCards: () => apiClient.get('/cards'),
  getCard: (cardId) => apiClient.get(`/cards/${cardId}`),
  lockCard: (cardId, data) => apiClient.post(`/cards/${cardId}/lock`, data),
  unlockCard: (cardId, data) => apiClient.post(`/cards/${cardId}/unlock`, data),
  getCardControls: (cardId) => apiClient.get(`/cards/${cardId}/controls`),
  updateCardControls: (cardId, data) => apiClient.put(`/cards/${cardId}/controls`, data),
  requestNewCard: (data) => apiClient.post('/cards/request', data),
  replaceCard: (cardId, data) => apiClient.post(`/cards/${cardId}/replace`, data),
}

export const transactionsAPI = {
  getTransactions: (params = {}) => apiClient.get('/transactions', { params }),
  getTransaction: (transactionId) => apiClient.get(`/transactions/${transactionId}`),
  searchTransactions: (params = {}) => apiClient.get('/transactions/search', { params }),
}

export const customersAPI = {
  getProfile: () => apiClient.get('/customers/profile'),
  updateProfile: (data) => apiClient.put('/customers/profile', data),
}

export const fraudAPI = {
  getDisputes: () => apiClient.get('/fraud/disputes'),
  getDispute: (disputeId) => apiClient.get(`/fraud/disputes/${disputeId}`),
  fileDispute: (data) => apiClient.post('/fraud/disputes', data),
  reportFraud: (data) => apiClient.post('/fraud/report-fraud', data),
}

export const notificationsAPI = {
  getAlerts: (params = {}) => apiClient.get('/notifications/alerts', { params }),
  markAlertAsRead: (alertId) => apiClient.put(`/notifications/alerts/${alertId}/read`),
  getPreferences: () => apiClient.get('/notifications/preferences'),
  updatePreferences: (data) => apiClient.put('/notifications/preferences', data),
}

export { apiClient }
