import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDisputeDetailPage = () => {
  const { disputeId } = useParams();
  const [dispute, setDispute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  const fetchDispute = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getDispute(disputeId);
      if (response.success) {
        setDispute(response.data);
      } else {
        setError('Failed to load dispute details');
      }
    } catch (err) {
      console.error('Dispute fetch error:', err);
      setError('Failed to load dispute details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Dispute not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The dispute you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/admin/disputes" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Disputes
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    {dispute.id}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dispute Details
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            dispute.status === 'PENDING' 
              ? 'bg-yellow-100 text-yellow-800' 
              : dispute.status === 'RESOLVED'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {dispute.status}
          </span>
        </div>
      </div>

      {/* Dispute Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Dispute Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Dispute details and resolution information.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dispute ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dispute.id}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="text-lg font-semibold text-red-600">
                  ${dispute.amount.toFixed(2)}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Reason</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dispute.reason}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link 
                  to={`/admin/transactions/${dispute.transaction_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {dispute.transaction_id}
                </Link>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link 
                  to={`/admin/customers/${dispute.customer_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {dispute.customer_id}
                </Link>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(dispute.created_at).toLocaleString()}
              </dd>
            </div>
            {dispute.description && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {dispute.description}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Evidence */}
      {dispute.evidence && dispute.evidence.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Evidence
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {dispute.evidence.map((item, index) => (
                <li key={index} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.type}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Timeline */}
      {dispute.timeline && dispute.timeline.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Timeline
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {dispute.timeline.map((event, index) => (
                <li key={index} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.action}</p>
                      <p className="text-sm text-gray-500">{event.note}</p>
                      <p className="text-xs text-gray-400">by {event.user}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputeDetailPage;
