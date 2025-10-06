import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { notificationsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function AlertsPage() {
  const [filters, setFilters] = useState({
    status: '',
    severity: ''
  })

  const queryClient = useQueryClient()

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => notificationsAPI.getAlerts(filters),
  })

  const markAsReadMutation = useMutation({
    mutationFn: (alertId) => notificationsAPI.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts'])
    }
  })

  const alerts = alertsData?.data?.data || []
  const summary = alertsData?.data?.summary

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-danger-500" />
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-danger-500" />
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-warning-500" />
      case 'LOW': return <Bell className="w-5 h-5 text-gray-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'border-danger-200 bg-danger-50'
      case 'HIGH': return 'border-danger-200 bg-danger-50'
      case 'MEDIUM': return 'border-warning-200 bg-warning-50'
      case 'LOW': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'READ': return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'NEW': return <Clock className="w-4 h-4 text-warning-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleMarkAsRead = async (alertId) => {
    try {
      await markAsReadMutation.mutateAsync(alertId)
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your security alerts and notifications
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unread Alerts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {summary.unreadCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-danger-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Action Required</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {summary.actionRequiredCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="NEW">New</option>
                <option value="READ">Read</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <label className="label">Severity</label>
              <select
                className="input"
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              >
                <option value="">All Severity</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Alerts</h3>
        </div>
        <div className="card-body">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
              <p className="mt-1 text-sm text-gray-500">
                No alerts found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.alertId}
                  className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {alert.alertTitle}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(alert.status)}
                          <span className="text-xs text-gray-500">
                            {formatDate(alert.alertDate)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {alert.alertMessage}
                      </p>
                      {alert.actionRequired && (
                        <div className="mt-2">
                          <span className="badge badge-warning">
                            Action Required
                          </span>
                        </div>
                      )}
                      {alert.status === 'NEW' && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleMarkAsRead(alert.alertId)}
                            disabled={markAsReadMutation.isPending}
                            className="btn btn-sm btn-primary"
                          >
                            Mark as Read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlertsPage
