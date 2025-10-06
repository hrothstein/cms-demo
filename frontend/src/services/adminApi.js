const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class AdminApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/admin`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Customers
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customers${queryString ? `?${queryString}` : ''}`);
  }

  async getCustomer(customerId) {
    return this.request(`/customers/${customerId}`);
  }

  // Cards
  async getCards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/cards${queryString ? `?${queryString}` : ''}`);
  }

  async getCard(cardId) {
    return this.request(`/cards/${cardId}`);
  }

  async lockCard(cardId, reason, notes) {
    return this.request(`/cards/${cardId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ reason, notes })
    });
  }

  async unlockCard(cardId, notes) {
    return this.request(`/cards/${cardId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }

  async updateCardControls(cardId, controls) {
    return this.request(`/cards/${cardId}/controls`, {
      method: 'PUT',
      body: JSON.stringify(controls)
    });
  }

  // Transactions
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransaction(transactionId) {
    return this.request(`/transactions/${transactionId}`);
  }

  async flagTransaction(transactionId, reason, notes) {
    return this.request(`/transactions/${transactionId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason, notes })
    });
  }

  // Disputes
  async getDisputes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/disputes${queryString ? `?${queryString}` : ''}`);
  }

  async getDispute(disputeId) {
    return this.request(`/disputes/${disputeId}`);
  }

  async updateDispute(disputeId, updates) {
    return this.request(`/disputes/${disputeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async assignDispute(disputeId, assignedTo) {
    return this.request(`/disputes/${disputeId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo })
    });
  }

  // Alerts
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/alerts${queryString ? `?${queryString}` : ''}`);
  }

  async getAlert(alertId) {
    return this.request(`/alerts/${alertId}`);
  }

  async reviewAlert(alertId, reviewNotes, actionTaken, dismiss = false) {
    return this.request(`/alerts/${alertId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ reviewNotes, actionTaken, dismiss })
    });
  }

  async dismissAlert(alertId, reason, notes) {
    return this.request(`/alerts/${alertId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ reason, notes })
    });
  }

  // Reports
  async getDashboardStats() {
    return this.request('/reports/dashboard');
  }

  async generateReport(reportData) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }

  // Audit Logs
  async getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/audit-logs${queryString ? `?${queryString}` : ''}`);
  }

  async getAuditLog(logId) {
    return this.request(`/audit-logs/${logId}`);
  }

  async getAuditLogStats(startDate, endDate) {
    const queryString = new URLSearchParams({ startDate, endDate }).toString();
    return this.request(`/audit-logs/stats/summary?${queryString}`);
  }

  // Notes
  async getNotes(referenceType, referenceId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notes/${referenceType}/${referenceId}${queryString ? `?${queryString}` : ''}`);
  }

  async addNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  async updateNote(noteId, noteData) {
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData)
    });
  }

  async deleteNote(noteId) {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE'
    });
  }
}

export const adminApi = new AdminApiService();
