import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminCardsPage = () => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    pages: 0
  });
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [lockReason, setLockReason] = useState('');

  const { hasPermission } = useAdmin();

  useEffect(() => {
    if (pagination) {
      fetchCards();
    }
  }, [searchTerm, statusFilter, pagination?.offset]);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const params = {
        limit: pagination?.limit || 20,
        offset: pagination?.offset || 0,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'ALL' && { status: statusFilter })
      };

      const response = await adminApi.getCards(params);
      if (response.success) {
        setCards(response.data.cards || []);
        setPagination(response.data.pagination || { total: 0, limit: 20, offset: 0, pages: 1 });
      } else {
        setError(response.error?.message || 'Failed to fetch cards');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const handleLockCard = (card) => {
    setSelectedCard(card);
    setShowLockModal(true);
  };

  const handleUnlockCard = async (card) => {
    if (!hasPermission('LOCK_CARDS')) {
      setError('You do not have permission to unlock cards');
      return;
    }

    try {
      const response = await adminApi.unlockCard(card.card_id, 'Admin unlock');
      if (response.success) {
        fetchCards(); // Refresh the list
      } else {
        setError(response.error?.message || 'Failed to unlock card');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const confirmLockCard = async () => {
    if (!hasPermission('LOCK_CARDS')) {
      setError('You do not have permission to lock cards');
      return;
    }

    try {
      const response = await adminApi.lockCard(selectedCard.card_id, lockReason);
      if (response.success) {
        setShowLockModal(false);
        setSelectedCard(null);
        setLockReason('');
        fetchCards(); // Refresh the list
      } else {
        setError(response.error?.message || 'Failed to lock card');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const formatCardNumber = (cardNumber, canViewFull = false) => {
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
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'LOCKED', label: 'Locked' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Card Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Search, view, and manage customer cards
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Cards
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by card number, customer name..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">🔍</span>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status Filter
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              {pagination?.total || 0} cards found
            </div>
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {!cards || cards.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No cards found matching your criteria
            </li>
          ) : (
            cards.map((card) => (
              <li key={card.card_id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatCardNumber(card.card_number, true)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {card.customer_name} • {card.card_type} • Expires {card.expiry_date}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(card.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(card.card_status)}`}>
                      {card.card_status}
                    </span>
                    <div className="flex space-x-2">
                      {card.card_status === 'ACTIVE' && hasPermission('LOCK_CARDS') && (
                        <button
                          onClick={() => handleLockCard(card)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Lock Card
                        </button>
                      )}
                      {card.card_status === 'LOCKED' && hasPermission('LOCK_CARDS') && (
                        <button
                          onClick={() => handleUnlockCard(card)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Unlock Card
                        </button>
                      )}
                      <Link
                        to={`/admin/cards/${card.card_id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(0, (pagination?.offset || 0) - (pagination?.limit || 20)))}
              disabled={(pagination?.offset || 0) === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange((pagination?.offset || 0) + (pagination?.limit || 20))}
              disabled={(pagination?.offset || 0) + (pagination?.limit || 20) >= (pagination?.total || 0)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(pagination?.offset || 0) + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min((pagination?.offset || 0) + (pagination?.limit || 20), pagination?.total || 0)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination?.total || 0}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(Math.max(0, (pagination?.offset || 0) - (pagination?.limit || 20)))}
                  disabled={(pagination?.offset || 0) === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange((pagination?.offset || 0) + (pagination?.limit || 20))}
                  disabled={(pagination?.offset || 0) + (pagination?.limit || 20) >= (pagination?.total || 0)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Lock Card Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Lock Card
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Card: {formatCardNumber(selectedCard?.card_number, true)}
              </p>
              <div className="mb-4">
                <label htmlFor="lockReason" className="block text-sm font-medium text-gray-700">
                  Reason for locking
                </label>
                <textarea
                  id="lockReason"
                  name="lockReason"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter reason for locking this card..."
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowLockModal(false);
                    setSelectedCard(null);
                    setLockReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLockCard}
                  disabled={!lockReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lock Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCardsPage;
