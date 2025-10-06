import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, CreditCard } from 'lucide-react'
import { cardsAPI } from '../services/api'
import CardDisplay from '../components/CardDisplay'
import LoadingSpinner from '../components/LoadingSpinner'

function CardsPage() {
  const { data: cardsData, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => cardsAPI.getCards(),
  })

  const cards = cardsData?.data?.data || []

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your debit and credit cards
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Request New Card
        </button>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cards</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by requesting a new card.
          </p>
          <div className="mt-6">
            <button className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Request New Card
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link key={card.cardId} to={`/cards/${card.cardId}`}>
              <CardDisplay card={card} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default CardsPage
