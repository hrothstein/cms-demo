import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Settings, Lock, Unlock } from 'lucide-react'
import { cardsAPI } from '../services/api'
import CardDisplay from '../components/CardDisplay'
import LoadingSpinner from '../components/LoadingSpinner'

function CardDetailPage() {
  const { cardId } = useParams()
  
  const { data: cardData, isLoading } = useQuery({
    queryKey: ['cards', cardId],
    queryFn: () => cardsAPI.getCard(cardId),
  })

  const { data: controlsData, isLoading: controlsLoading } = useQuery({
    queryKey: ['cards', cardId, 'controls'],
    queryFn: () => cardsAPI.getCardControls(cardId),
  })

  const card = cardData?.data?.data
  const controls = controlsData?.data?.data

  if (isLoading || controlsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Card not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The card you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/cards" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cards
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link to="/cards" className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Card Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your {card.cardBrand} {card.cardType.toLowerCase()} card
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Display */}
        <div>
          <CardDisplay card={card} />
        </div>

        {/* Card Controls */}
        {controls && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Card Controls</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Daily Limit</label>
                  <p className="text-sm text-gray-900">
                    ${controls.dailyLimit?.toLocaleString() || 'No limit'}
                  </p>
                </div>
                <div>
                  <label className="label">Per Transaction Limit</label>
                  <p className="text-sm text-gray-900">
                    ${controls.perTransactionLimit?.toLocaleString() || 'No limit'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Contactless Payments</span>
                  <span className={`badge ${controls.contactlessEnabled ? 'badge-success' : 'badge-gray'}`}>
                    {controls.contactlessEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Online Purchases</span>
                  <span className={`badge ${controls.onlineEnabled ? 'badge-success' : 'badge-gray'}`}>
                    {controls.onlineEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">International Transactions</span>
                  <span className={`badge ${controls.internationalEnabled ? 'badge-success' : 'badge-gray'}`}>
                    {controls.internationalEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">ATM Withdrawals</span>
                  <span className={`badge ${controls.atmEnabled ? 'badge-success' : 'badge-gray'}`}>
                    {controls.atmEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="btn btn-primary w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Controls
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-secondary">
              <Lock className="w-4 h-4 mr-2" />
              Lock Card
            </button>
            <button className="btn btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Update Controls
            </button>
            <button className="btn btn-secondary">
              Request Replacement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardDetailPage
