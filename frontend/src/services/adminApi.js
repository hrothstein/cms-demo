const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cms-backend-cards-fixed-8b8fe49bfe37.herokuapp.com';

class AdminApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      mode: 'cors',
      credentials: 'include',
      ...options
    };

    console.log('Admin API Request:', { url, config });

    try {
      const response = await fetch(url, config);
      console.log('Admin API Response:', { status: response.status, statusText: response.statusText });
      
      const data = await response.json();
      console.log('Admin API Data:', data);

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getProfile() {
    return this.request('/admin/auth/profile');
  }

  async logout() {
    return this.request('/admin/auth/logout', {
      method: 'POST'
    });
  }

  // Customers
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/customers?${queryString}`);
  }

  async getCustomer(customerId) {
    return this.request(`/admin/customers/${customerId}`);
  }

  async getCustomerCards(customerId) {
    return this.request(`/admin/customers/${customerId}/cards`);
  }

  async getCustomerTransactions(customerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/customers/${customerId}/transactions?${queryString}`);
  }

  // Cards
  async getCards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/cards?${queryString}`);
  }

  async getCard(cardId) {
    return this.request(`/admin/cards/${cardId}`);
  }

  async lockCard(cardId, reason) {
    return this.request(`/admin/cards/${cardId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async unlockCard(cardId, reason) {
    return this.request(`/admin/cards/${cardId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async updateCardControls(cardId, controls) {
    return this.request(`/admin/cards/${cardId}/controls`, {
      method: 'PUT',
      body: JSON.stringify(controls)
    });
  }

  // Transactions
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/transactions?${queryString}`);
  }

  async getTransaction(transactionId) {
    return this.request(`/admin/transactions/${transactionId}`);
  }

  // Disputes
  async getDisputes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/disputes?${queryString}`);
  }

  async getDispute(disputeId) {
    return this.request(`/admin/disputes/${disputeId}`);
  }

  async updateDispute(disputeId, updates) {
    return this.request(`/admin/disputes/${disputeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async updateDisputeStatus(disputeId, status) {
    return this.request(`/admin/disputes/${disputeId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async addDisputeNote(disputeId, note) {
    return this.request(`/admin/disputes/${disputeId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
  }

  async assignDispute(disputeId, adminId) {
    return this.request(`/admin/disputes/${disputeId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ adminId })
    });
  }

  // Alerts
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/alerts?${queryString}`);
  }

  async getAlert(alertId) {
    return this.request(`/admin/alerts/${alertId}`);
  }

  async acknowledgeAlert(alertId) {
    return this.request(`/admin/alerts/${alertId}/acknowledge`, {
      method: 'PUT'
    });
  }

  async resolveAlert(alertId) {
    return this.request(`/admin/alerts/${alertId}/resolve`, {
      method: 'PUT'
    });
  }

  async dismissAlert(alertId, reason) {
    return this.request(`/admin/alerts/${alertId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Reports
  async getDashboardStats() {
    return this.request('/admin/reports/dashboard');
  }

  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports?${queryString}`);
  }

  async generateReport(type, dateRange) {
    return this.request('/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, dateRange })
    });
  }

  async getTransactionReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/transactions?${queryString}`);
  }

  async getFraudReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/fraud?${queryString}`);
  }

  // Audit Logs
  async getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/audit-logs?${queryString}`);
  }

  // Notes
  async getNotes(noteType, referenceId) {
    return this.request(`/admin/notes/${noteType}/${referenceId}`);
  }

  async addNote(noteType, referenceId, noteData) {
    return this.request('/admin/notes', {
      method: 'POST',
      body: JSON.stringify({
        noteType,
        referenceId,
        ...noteData
      })
    });
  }

  async updateNote(noteId, updates) {
    return this.request(`/admin/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteNote(noteId) {
    return this.request(`/admin/notes/${noteId}`, {
      method: 'DELETE'
    });
  }
}

export const adminApi = new AdminApiService();