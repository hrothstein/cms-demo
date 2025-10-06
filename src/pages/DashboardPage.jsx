import { useQuery } from '@tanstack/react-query'
import { CreditCard, TrendingUp, AlertTriangle, Receipt } from 'lucide-react'
import { cardsAPI, transactionsAPI, notificationsAPI } from '../services/api'
import CardDisplay from '../components/CardDisplay'
import LoadingSpinner from '../components/LoadingSpinner'

function DashboardPage() {
  // Fetch cards
  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => cardsAPI.getCards(),
  })

  // Fetch recent transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionsAPI.getTransactions({ limit: 5 }),
  })

  // Fetch alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => notificationsAPI.getAlerts({ limit: 5 }),
  })

  const cards = cardsData?.data?.data || []
  const transactions = transactionsData?.data?.data || []
  const alerts = alertsData?.data?.data || []

  if (cardsLoading || transactionsLoading || alertsLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your cards, transactions, and alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cards</p>
                <p className="text-2xl font-semibold text-gray-900">{cards.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Cards</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {cards.filter(card => card.cardStatus === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Receipt className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{transactions.length}</p>
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
                <p className="text-sm font-medium text-gray-500">Unread Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.filter(alert => alert.status === 'NEW').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cards Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Your Cards</h3>
          </div>
          <div className="card-body">
            {cards.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No cards found</p>
            ) : (
              <div className="space-y-4">
                {cards.slice(0, 3).map((card) => (
                  <CardDisplay key={card.cardId} card={card} compact />
                ))}
                {cards.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{cards.length - 3} more cards
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="card-body">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.transactionId} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.merchant.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${transaction.amount.value.toFixed(2)}
                      </p>
                      <span className={`badge ${
                        transaction.status === 'APPROVED' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.alertId} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.severity === 'HIGH' ? 'text-danger-500' : 
                      alert.severity === 'MEDIUM' ? 'text-warning-500' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.alertTitle}</p>
                    <p className="text-sm text-gray-500">{alert.alertMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.alertDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
