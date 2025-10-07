import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardsAPI, transactionsAPI, alertsAPI } from '../services/api';
import { CreditCard, DollarSign, AlertTriangle, TrendingUp, Lock, Unlock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    totalBalance: 0,
    unreadAlerts: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load cards
      const cardsResponse = await cardsAPI.getCards();
      const cardsData = cardsResponse.data.data;
      setCards(cardsData);

      // Load recent transactions (from first card)
      if (cardsData.length > 0) {
        const transactionsResponse = await transactionsAPI.getCardTransactions(cardsData[0].cardId, { limit: 5 });
        setRecentTransactions(transactionsResponse.data.data.transactions);
      }

      // Load unread alerts
      const alertsResponse = await alertsAPI.getAlerts({ unreadOnly: 'true' });
      const alertsData = alertsResponse.data.data.alerts;
      setAlerts(alertsData);

      // Calculate stats
      const activeCards = cardsData.filter(card => card.cardStatus === 'ACTIVE' && !card.isLocked).length;
      const totalBalance = cardsData.reduce((sum, card) => {
        if (card.cardType === 'DEBIT') {
          return sum + (card.availableBalance || 0);
        } else if (card.cardType === 'CREDIT') {
          return sum + (card.availableCredit || 0);
        }
        return sum;
      }, 0);

      setStats({
        totalCards: cardsData.length,
        activeCards,
        totalBalance,
        unreadAlerts: alertsData.length,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCardLock = async (cardId, isLocked) => {
    try {
      if (isLocked) {
        await cardsAPI.unlockCard(cardId);
        toast.success('Card unlocked successfully');
      } else {
        await cardsAPI.lockCard(cardId, 'Temporary hold');
        toast.success('Card locked successfully');
      }
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Error toggling card lock:', error);
      toast.error('Failed to update card status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your cards, transactions, and account activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Cards</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalCards}</dd>
                </dl>
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Cards</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeCards}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Balance</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unread Alerts</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.unreadAlerts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cards Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Your Cards</h3>
          </div>
          <div className="card-body">
            {cards.length === 0 ? (
              <p className="text-sm text-gray-500">No cards found</p>
            ) : (
              <div className="space-y-4">
                {cards.map((card) => (
                  <div
                    key={card.cardId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/cards/${card.cardId}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CreditCard className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {card.cardType} •••• {card.cardNumberLast4}
                        </p>
                        <p className="text-xs text-gray-500">
                          {card.cardStatus} • {card.cardNetwork}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {card.cardType === 'DEBIT' 
                            ? `$${(card.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                            : `$${(card.availableCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {card.cardType === 'DEBIT' ? 'Available' : 'Available Credit'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardLock(card.cardId, card.isLocked);
                        }}
                        className={`p-2 rounded-full ${
                          card.isLocked 
                            ? 'text-success-600 hover:bg-success-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {card.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-footer">
            <button
              onClick={() => navigate('/cards')}
              className="btn btn-primary btn-sm"
            >
              View All Cards
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="card-body">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.transactionId}
                    className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2"
                    onClick={() => navigate(`/transactions/${transaction.transactionId}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {transaction.merchantName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.merchantName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.transactionStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-footer">
            <button
              onClick={() => navigate('/transactions')}
              className="btn btn-primary btn-sm"
            >
              View All Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {stats.unreadAlerts > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
              <span className="badge badge-warning">{stats.unreadAlerts} unread</span>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.alertId} className="flex items-start space-x-3 p-3 bg-warning-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.alertTitle}</p>
                    <p className="text-sm text-gray-600">{alert.alertMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <button
              onClick={() => navigate('/alerts')}
              className="btn btn-primary btn-sm"
            >
              View All Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
