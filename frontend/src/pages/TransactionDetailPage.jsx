import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Receipt, MapPin, CreditCard } from 'lucide-react'
import { transactionsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function TransactionDetailPage() {
  const { transactionId } = useParams()
  
  const { data: transactionData, isLoading } = useQuery({
    queryKey: ['transactions', transactionId],
    queryFn: () => transactionsAPI.getTransaction(transactionId),
  })

  const transaction = transactionData?.data?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Transaction not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The transaction you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/transactions" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Link>
        </div>
      </div>
    )
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-success'
      case 'DECLINED': return 'badge-danger'
      case 'PENDING': return 'badge-warning'
      case 'DISPUTED': return 'badge-warning'
      default: return 'badge-gray'
    }
  }

  const getFraudRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return 'text-danger-600'
      case 'MEDIUM': return 'text-warning-600'
      case 'LOW': return 'text-success-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/transactions" className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Transaction ID: {transaction.transactionId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Transaction Overview</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {transaction.merchant.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.merchant.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(transaction.amount.value)}
                </p>
                <span className={`badge ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Transaction Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(transaction.transactionDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaction Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.transactionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Method</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.transactionMethod}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Authorization Code</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.authorizationCode || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Security */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Location & Security</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-500">
                  {transaction.location.city}, {transaction.location.state} {transaction.location.country}
                </p>
                {transaction.location.coordinates && (
                  <p className="text-xs text-gray-400 mt-1">
                    Coordinates: {transaction.location.coordinates.lat.toFixed(4)}, {transaction.location.coordinates.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">International</span>
                <span className={`badge ${transaction.isInternational ? 'badge-warning' : 'badge-gray'}`}>
                  {transaction.isInternational ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Online Transaction</span>
                <span className={`badge ${transaction.isOnline ? 'badge-warning' : 'badge-gray'}`}>
                  {transaction.isOnline ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Fraud Risk</span>
                <span className={`text-sm font-medium ${getFraudRiskColor(transaction.fraudRiskLevel)}`}>
                  {transaction.fraudRiskLevel}
                </span>
              </div>
              {transaction.fraudScore > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Fraud Score</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(transaction.fraudScore * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Actions</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            {transaction.canBeDisputed && (
              <button className="btn btn-danger">
                File Dispute
              </button>
            )}
            <button className="btn btn-secondary">
              Download Receipt
            </button>
            <button className="btn btn-secondary">
              Report Fraud
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailPage
