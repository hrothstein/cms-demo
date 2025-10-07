import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminCardDetailPage = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAdmin();
  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCardDetails();
  }, [cardId]);

  const fetchCardDetails = async () => {
    try {
      setIsLoading(true);
      // For now, we'll use mock data since we don't have a specific card detail API
      // In a real implementation, this would call adminApi.getCard(cardId)
      // Mock data based on cardId - CARD-001 is DEBIT, CARD-002 is CREDIT
      const mockCard = cardId === 'CARD-002' ? {
        card_id: cardId,
        card_number: '5555555555555678',
        card_type: 'CREDIT',
        card_brand: 'MASTERCARD',
        card_status: 'ACTIVE',
        customer_name: 'Jane Smith',
        customer_id: 'CUST-67890',
        expiry_date: '2027-02-01',
        issue_date: '2024-02-01',
        activation_date: '2024-02-02T14:20:00Z',
        creditLimit: 5000.00,
        availableCredit: 4500.00,
        is_primary: false,
        card_format: 'VIRTUAL',
        created_at: '2024-02-01T08:00:00Z',
        updated_at: '2024-02-01T08:00:00Z',
        customer: {
          username: 'janesmith',
          email: 'jane@example.com',
          phone: '+1987654321'
        }
      } : {
        card_id: cardId,
        card_number: '4111111111111234',
        card_type: 'DEBIT',
        card_brand: 'VISA',
        card_status: 'ACTIVE',
        customer_name: 'John Doe',
        customer_id: 'CUST-12345',
        expiry_date: '2027-01-15',
        issue_date: '2024-01-15',
        activation_date: '2024-01-16T10:30:00Z',
        creditLimit: null,
        availableCredit: null,
        is_primary: true,
        card_format: 'PHYSICAL',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:00:00Z',
        customer: {
          username: 'johndoe',
          email: 'john@example.com',
          phone: '+1234567890'
        }
      };
      
      setCard(mockCard);
    } catch (err) {
      setError('Failed to fetch card details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (cardNumber, canViewFull = false) => {
    if (!cardNumber) return '**** **** **** ****';
    if (canViewFull && hasPermission('VIEW_FULL_CARD_NUMBER')) {
      return cardNumber;
    }
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ACTIVE: 'bg-green-100 text-green-800',
      LOCKED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const handleLockCard = () => {
    // Implement lock card functionality
    console.log('Lock card:', cardId);
  };

  const handleUnlockCard = () => {
    // Implement unlock card functionality
    console.log('Unlock card:', cardId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/cards')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Cards
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Card not found</p>
          <button
            onClick={() => navigate('/admin/cards')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/cards')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2"
            >
              ← Back to Cards
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Card Details</h1>
            <p className="text-gray-600">Card ID: {card.card_id}</p>
          </div>
          <div className="flex space-x-3">
            {card.card_status === 'ACTIVE' && hasPermission('LOCK_CARDS') && (
              <button
                onClick={handleLockCard}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Lock Card
              </button>
            )}
            {card.card_status === 'LOCKED' && hasPermission('LOCK_CARDS') && (
              <button
                onClick={handleUnlockCard}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Unlock Card
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Card Information</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Card Number</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {formatCardNumber(card.card_number, true)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(card.card_status)}`}>
                  {card.card_status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Card Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.card_type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Card Brand</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.card_brand}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Cardholder Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.customer_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.expiry_date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.issue_date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Activation Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {card.activation_date ? new Date(card.activation_date).toLocaleString() : 'Not activated'}
              </dd>
            </div>
            {card.creditLimit && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Credit Limit</dt>
                <dd className="mt-1 text-sm text-gray-900">${card.creditLimit.toLocaleString()}</dd>
              </div>
            )}
            {card.availableCredit && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Available Credit</dt>
                <dd className="mt-1 text-sm text-gray-900">${card.availableCredit.toLocaleString()}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Primary Card</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.is_primary ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Card Format</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.card_format}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.customer_id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.customer.username}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.customer.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{card.customer.phone}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Timestamps */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Timestamps</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(card.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(card.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default AdminCardDetailPage;
