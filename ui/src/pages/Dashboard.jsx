import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Clock,
  FileImage,
  FileText,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, refreshProfile, API_BASE } = useAuth();
  const [stats, setStats] = useState({
    usage: null,
    recentRequests: [],
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usageResponse, historyResponse] = await Promise.all([
        axios.get(`${API_BASE}/screenshots/usage`, {
          headers: { 'X-API-Key': user?.apiKeys?.[0]?.key }
        }),
        axios.get(`${API_BASE}/screenshots/history?limit=5`, {
          headers: { 'X-API-Key': user?.apiKeys?.[0]?.key }
        })
      ]);

      setStats({
        usage: usageResponse.data,
        recentRequests: historyResponse.data.requests,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </div>
              {trend && (
                <div className="ml-2 flex items-baseline text-sm">
                  <span className={`text-${trend > 0 ? 'green' : 'red'}-600`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'pdf' ? FileText : FileImage;
  };

  if (stats.loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your Screenshot API account
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Credits Remaining"
          value={user?.credits || 0}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Requests This Month"
          value={stats.usage?.requests || 0}
          icon={Camera}
          color="green"
        />
        <StatCard
          title="API Keys"
          value={user?.apiKeys?.length || 0}
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Account Plan"
          value={user?.plan || 'Free'}
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="p-6">
              {stats.recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentRequests.map((request, index) => {
                    const TypeIcon = getTypeIcon(request.type);
                    return (
                      <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        {/* Thumbnail for completed screenshots */}
                        {request.status === 'completed' && request.type === 'screenshot' && request.filePath ? (
                          <div className="flex-shrink-0 w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                            <img 
                              src={`${process.env.NODE_ENV === 'production' ? 'https://screenshot.support' : 'http://localhost:3000'}${request.filePath}`}
                              alt="Screenshot thumbnail"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                              <TypeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                            <TypeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {request.url}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.type.toUpperCase()} • {formatDate(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          {request.processingTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {request.processingTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No requests yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by taking your first screenshot
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Usage Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Usage Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Credits Used</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {100 - (user?.credits || 0)}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${((100 - (user?.credits || 0)) / 100) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Current Month</span>
                <span>{stats.usage?.month}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/playground"
                className="block w-full text-left px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <div className="flex items-center">
                  <Camera className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Try the Playground</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Test the API interactively</div>
                  </div>
                </div>
              </a>
              <a
                href="/api-keys"
                className="block w-full text-left px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Manage API Keys</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Create and manage keys</div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Account Status */}
          {user?.credits <= 10 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Low Credits Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    You have {user?.credits} credits remaining. Credits reset monthly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;