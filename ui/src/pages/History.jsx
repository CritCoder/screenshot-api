import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  History as HistoryIcon, 
  FileImage, 
  FileText, 
  Search, 
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download
} from 'lucide-react';
import axios from 'axios';

const History = () => {
  const { user, API_BASE } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const apiKey = user?.apiKeys?.[0]?.key;

  useEffect(() => {
    if (apiKey) {
      loadHistory();
    }
  }, [pagination.page, pagination.limit, filters, apiKey]);

  const loadHistory = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(`${API_BASE}/screenshots/history?${params}`, {
        headers: { 'X-API-Key': apiKey }
      });

      let filteredRequests = response.data.requests;

      // Client-side search filter
      if (filters.search) {
        filteredRequests = filteredRequests.filter(request =>
          request.url.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setRequests(filteredRequests);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'pdf' ? FileText : FileImage;
  };

  const getTypeColor = (type) => {
    return type === 'pdf' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100';
  };

  const clearFilters = () => {
    setFilters({ type: '', status: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (!apiKey) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-none">
        <div className="text-center py-12">
          <HistoryIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No API Key Found</h3>
          <p className="mt-1 text-gray-500">
            You need an API key to view request history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-none">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request History</h1>
          <p className="text-gray-600">
            View and manage your screenshot and PDF generation requests
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search URL
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by URL..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="screenshot">Screenshot</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        ) : requests.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200">
              {requests.map((request, index) => {
                const TypeIcon = getTypeIcon(request.type);
                return (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-md ${getTypeColor(request.type)}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                              {request.type.toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                            {request.url}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                            {request.processingTime && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{request.processingTime}ms</span>
                              </div>
                            )}
                            {request.fileSize && (
                              <span>{(request.fileSize / 1024).toFixed(1)} KB</span>
                            )}
                          </div>
                          
                          {request.errorMessage && (
                            <p className="text-xs text-red-600 mt-2">
                              Error: {request.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {request.filePath && request.status === 'completed' && (
                          <>
                            <a
                              href={`http://localhost:3000${request.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 p-2 rounded-md hover:bg-primary-50 transition-colors"
                              title="Open file"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <a
                              href={`http://localhost:3000${request.filePath}`}
                              download
                              className="text-gray-600 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50 transition-colors"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <HistoryIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-gray-500">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters or make your first request'
                : 'Make your first screenshot request to see it here'
              }
            </p>
            {Object.values(filters).some(f => f) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;