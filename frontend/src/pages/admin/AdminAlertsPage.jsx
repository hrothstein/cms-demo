import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';

const AdminAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    type: '',
    status: '',
    search: ''
  });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAlerts(filters);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await adminApi.acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await adminApi.resolveAlert(alertId);
      fetchAlerts();
      setShowModal(false);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'fraud': '🚨',
      'security': '🔒',
      'system': '⚙️',
      'transaction': '💳',
      'card': '💳',
      'customer': '👤'
    };
    return icons[type] || '⚠️';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-red-100 text-red-800',
      'acknowledged': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'dismissed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Alerts Dashboard</h1>
        <p className="text-gray-600">Monitor system alerts and security events</p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Critical</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alerts.filter(a => a.severity === 'high' && a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Medium</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alerts.filter(a => a.severity === 'medium' && a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alerts.filter(a => a.severity === 'low' && a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({...filters, severity: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="fraud">Fraud</option>
              <option value="security">Security</option>
              <option value="system">System</option>
              <option value="transaction">Transaction</option>
              <option value="card">Card</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search alerts..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No alerts found
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-lg shadow border-l-4 border-l-red-500">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{getTypeIcon(alert.type)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{alert.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Type: {alert.type}</span>
                        <span>•</span>
                        <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                        {alert.updated_at && (
                          <>
                            <span>•</span>
                            <span>Updated: {new Date(alert.updated_at).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-300 rounded-md hover:bg-indigo-50"
                    >
                      View Details
                    </button>
                    {alert.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-900 border border-yellow-300 rounded-md hover:bg-yellow-50"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1 text-sm text-green-600 hover:text-green-900 border border-green-300 rounded-md hover:bg-green-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      {showModal && selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Alert Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900">{selectedAlert.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAlert.status)}`}>
                      {selectedAlert.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">{new Date(selectedAlert.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAlert.description}</p>
                </div>
                
                {selectedAlert.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Details</label>
                    <pre className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(selectedAlert.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedAlert.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <pre className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedAlert.status === 'active' && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
                  >
                    Acknowledge
                  </button>
                )}
                {selectedAlert.status === 'acknowledged' && (
                  <button
                    onClick={() => handleResolve(selectedAlert.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlertsPage;
