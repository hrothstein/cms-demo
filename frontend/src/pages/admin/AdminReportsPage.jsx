import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getReports(dateRange);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType) => {
    try {
      const response = await adminApi.generateReport(reportType, dateRange);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const getReportIcon = (type) => {
    const icons = {
      'transactions': '💳',
      'customers': '👥',
      'cards': '💳',
      'fraud': '🚨',
      'disputes': '⚖️',
      'audit': '📋',
      'financial': '💰',
      'security': '🔒'
    };
    return icons[type] || '📊';
  };

  const getReportColor = (type) => {
    const colors = {
      'transactions': 'bg-blue-100 text-blue-800',
      'customers': 'bg-green-100 text-green-800',
      'cards': 'bg-purple-100 text-purple-800',
      'fraud': 'bg-red-100 text-red-800',
      'disputes': 'bg-orange-100 text-orange-800',
      'audit': 'bg-gray-100 text-gray-800',
      'financial': 'bg-yellow-100 text-yellow-800',
      'security': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const reportTypes = [
    {
      id: 'transactions',
      name: 'Transaction Report',
      description: 'Detailed transaction analysis and trends',
      metrics: ['Total Volume', 'Transaction Count', 'Average Amount', 'Success Rate']
    },
    {
      id: 'customers',
      name: 'Customer Report',
      description: 'Customer demographics and behavior analysis',
      metrics: ['New Customers', 'Active Customers', 'Churn Rate', 'Customer Lifetime Value']
    },
    {
      id: 'cards',
      name: 'Card Report',
      description: 'Card issuance, activation, and usage statistics',
      metrics: ['Cards Issued', 'Activation Rate', 'Usage Rate', 'Blocked Cards']
    },
    {
      id: 'fraud',
      name: 'Fraud Report',
      description: 'Fraud detection and prevention metrics',
      metrics: ['Fraud Attempts', 'Detection Rate', 'False Positives', 'Loss Prevention']
    },
    {
      id: 'disputes',
      name: 'Dispute Report',
      description: 'Dispute resolution and customer satisfaction',
      metrics: ['Disputes Filed', 'Resolution Time', 'Resolution Rate', 'Customer Satisfaction']
    },
    {
      id: 'audit',
      name: 'Audit Report',
      description: 'System access and administrative activities',
      metrics: ['Admin Logins', 'System Changes', 'Data Access', 'Security Events']
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Revenue, costs, and profitability analysis',
      metrics: ['Revenue', 'Operating Costs', 'Profit Margin', 'ROI']
    },
    {
      id: 'security',
      name: 'Security Report',
      description: 'Security events and threat analysis',
      metrics: ['Security Alerts', 'Threats Blocked', 'Vulnerabilities', 'Compliance Score']
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and view comprehensive system reports</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReports}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Refresh Reports
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Generated Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">⏱️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Generation Time</p>
              <p className="text-2xl font-semibold text-gray-900">2.3s</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">98.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {reportTypes.map((reportType) => (
          <div key={reportType.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">{getReportIcon(reportType.id)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{reportType.name}</h3>
                  <p className="text-sm text-gray-500">{reportType.description}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportColor(reportType.id)}`}>
                {reportType.id}
              </span>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Metrics:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {reportType.metrics.map((metric, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => generateReport(reportType.id)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                Generate
              </button>
              <button
                onClick={() => {
                  setSelectedReport(reportType);
                  setShowModal(true);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">{getReportIcon(report.type)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.name}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportColor(report.type)}`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.period_start} - {report.period_end}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => window.open(report.download_url, '_blank')}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedReport.name || selectedReport.title}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportColor(selectedReport.type || selectedReport.id)}`}>
                      {selectedReport.type || selectedReport.id}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Period</label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.period_start || dateRange.start} - {selectedReport.period_end || dateRange.end}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedReport.description}</p>
                </div>
                
                {selectedReport.metrics && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Key Metrics</label>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      {selectedReport.metrics.map((metric, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                          <div className="text-lg font-semibold text-indigo-600">{metric.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedReport.summary && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Summary</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedReport.summary}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedReport.download_url && (
                  <button
                    onClick={() => window.open(selectedReport.download_url, '_blank')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Download
                  </button>
                )}
                {!selectedReport.download_url && (
                  <button
                    onClick={() => generateReport(selectedReport.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Generate Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
