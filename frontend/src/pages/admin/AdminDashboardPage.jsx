import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatsCard from '../../components/admin/StatsCard';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError('Failed to load dashboard statistics');
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

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Cards',
      value: stats.totalCards.toLocaleString(),
      subtitle: `${stats.activeCards} active`,
      icon: '💳',
      color: 'blue',
      trend: stats.activeCards > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Transactions Today',
      value: stats.transactionsToday.toLocaleString(),
      subtitle: `$${stats.transactionVolumeToday.toLocaleString()}`,
      icon: '💸',
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Open Disputes',
      value: stats.openDisputes.toLocaleString(),
      subtitle: 'Require attention',
      icon: '⚖️',
      color: 'yellow',
      trend: stats.openDisputes > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts.toLocaleString(),
      subtitle: 'Immediate action needed',
      icon: '🚨',
      color: 'red',
      trend: stats.criticalAlerts > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      subtitle: 'Active accounts',
      icon: '👥',
      color: 'purple',
      trend: 'neutral'
    },
    {
      title: 'Unresolved Alerts',
      value: stats.unresolvedAlerts.toLocaleString(),
      subtitle: 'Need review',
      icon: '🔔',
      color: 'orange',
      trend: stats.unresolvedAlerts > 0 ? 'up' : 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of the Card Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Transaction Summary */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Transaction Summary
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">This Week:</span>
                        <span className="text-sm font-medium">{stats.transactionsThisWeek.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">This Month:</span>
                        <span className="text-sm font-medium">{stats.transactionsThisMonth.toLocaleString()}</span>
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Card Status Summary */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💳</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Card Status Summary
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Active:</span>
                        <span className="text-sm font-medium text-green-600">{stats.activeCards.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Locked:</span>
                        <span className="text-sm font-medium text-red-600">{stats.lockedCards.toLocaleString()}</span>
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/customers"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  👥
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Customers
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Search and manage customer accounts
                </p>
              </div>
            </a>

            <a
              href="/admin/alerts"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-red-50 text-red-700 ring-4 ring-white">
                  🚨
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Review Alerts
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check and resolve system alerts
                </p>
              </div>
            </a>

            <a
              href="/admin/disputes"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  ⚖️
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Disputes
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Review and resolve customer disputes
                </p>
              </div>
            </a>

            <a
              href="/admin/reports"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  📈
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Generate Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create custom reports and analytics
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
