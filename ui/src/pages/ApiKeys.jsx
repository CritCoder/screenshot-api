import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check,
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const ApiKeys = () => {
  const { user, refreshProfile, API_BASE } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [visibleKeys, setVisibleKeys] = useState({});
  const [copiedKeys, setCopiedKeys] = useState({});

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`);
      setApiKeys(response.data.user.apiKeys || []);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/auth/api-keys`, {
        name: newKeyName.trim()
      });

      await loadApiKeys();
      await refreshProfile();
      setShowCreateModal(false);
      setNewKeyName('');
      
      // Show the new key temporarily
      const newKeyId = response.data.apiKey.id;
      setVisibleKeys(prev => ({ ...prev, [newKeyId]: true }));
      setTimeout(() => {
        setVisibleKeys(prev => ({ ...prev, [newKeyId]: false }));
      }, 10000);

    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/auth/api-keys/${keyId}`);
      await loadApiKeys();
      await refreshProfile();
    } catch (error) {
      console.error('Failed to delete API key:', error);
      alert('Failed to delete API key');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyApiKey = (key, keyId) => {
    navigator.clipboard.writeText(key);
    setCopiedKeys(prev => ({ ...prev, [keyId]: true }));
    setTimeout(() => {
      setCopiedKeys(prev => ({ ...prev, [keyId]: false }));
    }, 2000);
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••';
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

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600">
            Manage your API keys for accessing the Screenshot API
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length > 0 ? (
          apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(apiKey.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      apiKey.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete API Key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                      />
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        title={visibleKeys[apiKey.id] ? 'Hide API Key' : 'Show API Key'}
                      >
                        {visibleKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => copyApiKey(apiKey.key, apiKey.id)}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        title="Copy API Key"
                      >
                        {copiedKeys[apiKey.id] ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {copiedKeys[apiKey.id] && (
                      <p className="text-xs text-green-600 mt-1">API key copied to clipboard!</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Last used: {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Activity className="h-4 w-4" />
                      <span>Status: {apiKey.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <Key className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No API keys</h3>
              <p className="mt-1 text-gray-500">
                Get started by creating your first API key
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 mx-auto transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create API Key</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
            <div className="text-sm text-yellow-700 mt-1 space-y-1">
              <p>• Keep your API keys secure and never share them publicly</p>
              <p>• Regenerate keys if you suspect they've been compromised</p>
              <p>• Use different keys for different applications or environments</p>
              <p>• Monitor your key usage regularly in the dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New API Key</h3>
            </div>
            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key Name
                </label>
                <input
                  id="keyName"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production, Development, Mobile App"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose a descriptive name to help identify this key
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                disabled={creating || !newKeyName.trim()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;