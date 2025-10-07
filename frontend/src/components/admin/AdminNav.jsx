import { NavLink, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

const AdminNav = ({ onLogout }) => {
  const { admin, hasPermission } = useAdmin();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', permission: 'GENERATE_REPORTS' },
    { name: 'Customers', href: '/admin/customers', icon: '👥', permission: 'VIEW_CUSTOMERS' },
    { name: 'Cards', href: '/admin/cards', icon: '💳', permission: 'VIEW_CARDS' },
    { name: 'Transactions', href: '/admin/transactions', icon: '💸', permission: 'VIEW_TRANSACTIONS' },
    { name: 'Disputes', href: '/admin/disputes', icon: '⚖️', permission: 'VIEW_DISPUTES' },
    { name: 'Alerts', href: '/admin/alerts', icon: '🚨', permission: 'VIEW_ALERTS' },
    { name: 'Reports', href: '/admin/reports', icon: '📈', permission: 'GENERATE_REPORTS' },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋', permission: 'VIEW_AUDIT_LOGS' }
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">CMS Admin</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {admin?.firstName?.charAt(0)}{admin?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {admin?.firstName} {admin?.lastName}
              </p>
              <p className="text-xs text-gray-500">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Logout"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
