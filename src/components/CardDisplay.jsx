import { CreditCard, Lock, Unlock } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsAPI } from '../services/api'
import { useState } from 'react'

function CardDisplay({ card, compact = false }) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const lockMutation = useMutation({
    mutationFn: (data) => cardsAPI.lockCard(card.cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cards'])
    }
  })

  const unlockMutation = useMutation({
    mutationFn: (data) => cardsAPI.unlockCard(card.cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cards'])
    }
  })

  const handleLockToggle = async () => {
    setIsLoading(true)
    try {
      if (card.cardStatus === 'ACTIVE') {
        await lockMutation.mutateAsync({ reason: 'CUSTOMER_REQUEST' })
      } else if (card.cardStatus === 'LOCKED') {
        await unlockMutation.mutateAsync({ reason: 'CUSTOMER_REQUEST' })
      }
    } catch (error) {
      console.error('Error toggling card lock:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCardBrandColor = (brand) => {
    switch (brand) {
      case 'VISA': return 'from-blue-600 to-blue-800'
      case 'MASTERCARD': return 'from-red-500 to-yellow-500'
      case 'AMEX': return 'from-green-600 to-green-800'
      default: return 'from-gray-600 to-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-success-100 text-success-800'
      case 'LOCKED': return 'bg-warning-100 text-warning-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      case 'EXPIRED': return 'bg-danger-100 text-danger-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded bg-gradient-to-r ${getCardBrandColor(card.cardBrand)} flex items-center justify-center`}>
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {card.cardBrand} {card.cardType}
            </p>
            <p className="text-xs text-gray-500">{card.cardNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`badge ${getStatusColor(card.cardStatus)}`}>
            {card.cardStatus}
          </span>
          <button
            onClick={handleLockToggle}
            disabled={isLoading || card.cardStatus === 'CLOSED' || card.cardStatus === 'EXPIRED'}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            {card.cardStatus === 'ACTIVE' ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-8 rounded bg-gradient-to-r ${getCardBrandColor(card.cardBrand)} flex items-center justify-center`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {card.cardBrand} {card.cardType}
              </h3>
              <p className="text-sm text-gray-500">{card.cardNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`badge ${getStatusColor(card.cardStatus)}`}>
              {card.cardStatus}
            </span>
            <button
              onClick={handleLockToggle}
              disabled={isLoading || card.cardStatus === 'CLOSED' || card.cardStatus === 'EXPIRED'}
              className="btn btn-sm btn-secondary"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : card.cardStatus === 'ACTIVE' ? (
                <>
                  <Lock className="w-4 h-4 mr-1" />
                  Lock
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-1" />
                  Unlock
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Cardholder</p>
            <p className="font-medium">{card.cardholderName}</p>
          </div>
          <div>
            <p className="text-gray-500">Expires</p>
            <p className="font-medium">{card.expiryDate}</p>
          </div>
          {card.creditLimit && (
            <div>
              <p className="text-gray-500">Credit Limit</p>
              <p className="font-medium">${card.creditLimit.value.toLocaleString()}</p>
            </div>
          )}
          {card.availableCredit && (
            <div>
              <p className="text-gray-500">Available Credit</p>
              <p className="font-medium">${card.availableCredit.value.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardDisplay
