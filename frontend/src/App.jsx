import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AdminProvider } from './contexts/AdminContext'
import { useEffect } from 'react'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CardsPage from './pages/CardsPage'
import CardDetailPage from './pages/CardDetailPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionDetailPage from './pages/TransactionDetailPage'
import AlertsPage from './pages/AlertsPage'
import SettingsPage from './pages/SettingsPage'

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'

// Components
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Customer Routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="cards/:cardId" element={<CardDetailPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/:transactionId" element={<TransactionDetailPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={<AdminLoginPage />} 
          />
          <Route 
            path="/admin" 
            element={<AdminLayout />}
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="cards" element={<div className="p-6"><h1 className="text-2xl font-bold">Cards Management</h1><p className="text-gray-600">Coming soon...</p></div>} />
            <Route path="transactions" element={<div className="p-6"><h1 className="text-2xl font-bold">Transactions</h1><p className="text-gray-600">Coming soon...</p></div>} />
            <Route path="disputes" element={<div className="p-6"><h1 className="text-2xl font-bold">Disputes</h1><p className="text-gray-600">Coming soon...</p></div>} />
            <Route path="alerts" element={<div className="p-6"><h1 className="text-2xl font-bold">Alerts</h1><p className="text-gray-600">Coming soon...</p></div>} />
            <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-600">Coming soon...</p></div>} />
            <Route path="audit-logs" element={<div className="p-6"><h1 className="text-2xl font-bold">Audit Logs</h1><p className="text-gray-600">Coming soon...</p></div>} />
          </Route>
        </Routes>
      </div>
    </AdminProvider>
  )
}

export default App
