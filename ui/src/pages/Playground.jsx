import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  Copy, 
  Download, 
  Settings, 
  Image as ImageIcon, 
  FileText,
  Loader,
  Eye,
  Code,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const Playground = () => {
  const { user, API_BASE } = useAuth();
  const [activeTab, setActiveTab] = useState('screenshot');
  const [formData, setFormData] = useState({
    url: 'https://example.com',
    format: 'png',
    width: 1920,
    height: 1080,
    fullPage: false,
    waitFor: 0,
    selector: '',
    device: '',
    browser: 'chromium',
    scrollToBottom: false,
    hideElements: '',
    timeout: 30000,
    quality: 80,
    // PDF options
    pdfFormat: 'A4',
    landscape: false,
    printBackground: true,
    scale: 1,
    marginTop: '1cm',
    marginBottom: '1cm',
    marginLeft: '1cm',
    marginRight: '1cm'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState('curl-post');

  const apiKey = user?.apiKeys?.[0]?.key;

  useEffect(() => {
    generateCode();
  }, [formData, activeTab, activeCodeTab]);

  useEffect(() => {
    // Reset to POST tab when switching to PDF since GET is not supported
    if (activeTab === 'pdf' && activeCodeTab.includes('-get')) {
      setActiveCodeTab('curl-post');
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateCode = () => {
    const endpoint = activeTab === 'screenshot' ? '/screenshots' : '/screenshots/pdf';
    const payload = activeTab === 'screenshot' ? getScreenshotPayload() : getPdfPayload();
    
    const codes = {
      'curl-post': `curl -X POST ${API_BASE}${endpoint} \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`,

      'curl-get': activeTab === 'screenshot' ? `curl -X GET "${API_BASE}${endpoint}?${new URLSearchParams({
        ...Object.entries(payload).reduce((acc, [key, value]) => {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
          return acc;
        }, {}),
        api_key: 'YOUR_API_KEY'
      }).toString()}"` : 'GET method not supported for PDF generation',
      
      'javascript-post': `const response = await fetch('${API_BASE}${endpoint}', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)})
});

const result = await response.json();
console.log(result);`,

      'javascript-get': activeTab === 'screenshot' ? `const params = new URLSearchParams({
  ${Object.entries(payload).map(([key, value]) => {
    const val = Array.isArray(value) ? value.join(',') : value.toString();
    return `${key}: '${val}'`;
  }).join(',\n  ')},
  api_key: 'YOUR_API_KEY'
});

const response = await fetch('${API_BASE}${endpoint}?' + params, {
  method: 'GET'
});

const result = await response.json();
console.log(result);` : 'GET method not supported for PDF generation',

      'python-post': `import requests

headers = {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
}

payload = ${JSON.stringify(payload, null, 2)}

response = requests.post('${API_BASE}${endpoint}', 
                        json=payload, 
                        headers=headers)
result = response.json()
print(result)`,

      'python-get': activeTab === 'screenshot' ? `import requests

params = {
${Object.entries(payload).map(([key, value]) => {
    const val = Array.isArray(value) ? value.join(',') : value.toString();
    return `    '${key}': '${val}'`;
  }).join(',\n')},
    'api_key': 'YOUR_API_KEY'
}

response = requests.get('${API_BASE}${endpoint}', params=params)
result = response.json()
print(result)` : 'GET method not supported for PDF generation'
    };

    setGeneratedCode(codes[activeCodeTab]);
  };

  const getScreenshotPayload = () => {
    const payload = {
      url: formData.url,
      format: formData.format,
      width: parseInt(formData.width),
      height: parseInt(formData.height),
      fullPage: formData.fullPage,
      waitFor: parseInt(formData.waitFor),
      browser: formData.browser,
      scrollToBottom: formData.scrollToBottom,
      timeout: parseInt(formData.timeout)
    };

    if (formData.selector) payload.selector = formData.selector;
    if (formData.device) payload.device = formData.device;
    if (formData.hideElements) {
      payload.hideElements = formData.hideElements.split(',').map(s => s.trim());
    }
    if (formData.format === 'jpeg') {
      payload.quality = parseInt(formData.quality);
    }

    return payload;
  };

  const getPdfPayload = () => {
    return {
      url: formData.url,
      format: formData.pdfFormat,
      landscape: formData.landscape,
      printBackground: formData.printBackground,
      scale: parseFloat(formData.scale),
      margin: {
        top: formData.marginTop,
        bottom: formData.marginBottom,
        left: formData.marginLeft,
        right: formData.marginRight
      },
      waitFor: parseInt(formData.waitFor),
      timeout: parseInt(formData.timeout)
    };
  };

  const executeRequest = async () => {
    if (!apiKey) {
      setError('No API key found. Please check your account settings.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const endpoint = activeTab === 'screenshot' ? '/screenshots' : '/screenshots/pdf';
      const payload = activeTab === 'screenshot' ? getScreenshotPayload() : getPdfPayload();

      const response = await axios.post(`${API_BASE}${endpoint}`, payload, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const resetForm = () => {
    setFormData({
      url: 'https://example.com',
      format: 'png',
      width: 1920,
      height: 1080,
      fullPage: false,
      waitFor: 0,
      selector: '',
      device: '',
      browser: 'chromium',
      scrollToBottom: false,
      hideElements: '',
      timeout: 30000,
      quality: 80,
      pdfFormat: 'A4',
      landscape: false,
      printBackground: true,
      scale: 1,
      marginTop: '1cm',
      marginBottom: '1cm',
      marginLeft: '1cm',
      marginRight: '1cm'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API Playground</h1>
        <p className="text-gray-600">
          Test the Screenshot API with live results and generated code examples
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {/* Tab Selection */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('screenshot')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'screenshot'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ImageIcon className="inline h-4 w-4 mr-2" />
                  Screenshot
                </button>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pdf'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="inline h-4 w-4 mr-2" />
                  PDF
                </button>
              </nav>
            </div>

            <div className="p-6 space-y-4">
              {/* Common Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com"
                />
              </div>

              {activeTab === 'screenshot' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Format
                      </label>
                      <select
                        name="format"
                        value={formData.format}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Browser
                      </label>
                      <select
                        name="browser"
                        value={formData.browser}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="chromium">Chromium</option>
                        <option value="firefox">Firefox</option>
                        <option value="webkit">WebKit</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width
                      </label>
                      <input
                        type="number"
                        name="width"
                        value={formData.width}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        min="100"
                        max="3840"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        min="100"
                        max="2160"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="fullPage"
                        checked={formData.fullPage}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Capture full page</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="scrollToBottom"
                        checked={formData.scrollToBottom}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Auto-scroll to bottom</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Format
                      </label>
                      <select
                        name="pdfFormat"
                        value={formData.pdfFormat}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="A5">A5</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                        <option value="Tabloid">Tabloid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scale
                      </label>
                      <input
                        type="number"
                        name="scale"
                        value={formData.scale}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        min="0.1"
                        max="2"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="landscape"
                        checked={formData.landscape}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Landscape orientation</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="printBackground"
                        checked={formData.printBackground}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Print background</span>
                    </label>
                  </div>
                </>
              )}

              {/* Advanced Options */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Advanced Options
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wait Time (ms)
                    </label>
                    <input
                      type="number"
                      name="waitFor"
                      value={formData.waitFor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                      max="30000"
                    />
                  </div>

                  {activeTab === 'screenshot' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CSS Selector (optional)
                        </label>
                        <input
                          type="text"
                          name="selector"
                          value={formData.selector}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="#main-content, .article"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Device Preset
                        </label>
                        <select
                          name="device"
                          value={formData.device}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">None</option>
                          <option value="iPhone 12">iPhone 12</option>
                          <option value="iPad Pro">iPad Pro</option>
                          <option value="Pixel 5">Pixel 5</option>
                          <option value="Desktop HD">Desktop HD</option>
                          <option value="Desktop 4K">Desktop 4K</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hide Elements (comma-separated)
                        </label>
                        <input
                          type="text"
                          name="hideElements"
                          value={formData.hideElements}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder=".ads, #cookie-banner, .popup"
                        />
                      </div>

                      {formData.format === 'jpeg' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quality (1-100)
                          </label>
                          <input
                            type="number"
                            name="quality"
                            value={formData.quality}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            min="1"
                            max="100"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'pdf' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Margin Top
                        </label>
                        <input
                          type="text"
                          name="marginTop"
                          value={formData.marginTop}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="1cm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Margin Bottom
                        </label>
                        <input
                          type="text"
                          name="marginBottom"
                          value={formData.marginBottom}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="1cm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Margin Left
                        </label>
                        <input
                          type="text"
                          name="marginLeft"
                          value={formData.marginLeft}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="1cm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Margin Right
                        </label>
                        <input
                          type="text"
                          name="marginRight"
                          value={formData.marginRight}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="1cm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={executeRequest}
                  disabled={loading || !apiKey}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Processing...' : 'Execute'}</span>
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">Generated Code</h3>
                <button
                  onClick={copyCode}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="Copy code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2 px-6" aria-label="Code Tabs">
                {[
                  { key: 'curl-post', label: 'cURL POST' },
                  { key: 'curl-get', label: 'cURL GET' },
                  { key: 'javascript-post', label: 'JS POST' },
                  { key: 'javascript-get', label: 'JS GET' },
                  { key: 'python-post', label: 'Python POST' },
                  { key: 'python-get', label: 'Python GET' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCodeTab(tab.key)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs tracking-wide transition-colors ${
                      activeTab === 'pdf' && tab.key.includes('-get')
                        ? 'border-transparent text-gray-400 cursor-not-allowed opacity-50'
                        : activeCodeTab === tab.key
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    disabled={activeTab === 'pdf' && tab.key.includes('-get')}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                <code>{generatedCode}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Results</h3>
            </div>
            <div className="p-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary-600" />
                  <span className="ml-3 text-gray-600">Processing request...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  <div className="font-medium">Error</div>
                  <div className="text-sm mt-1">{error}</div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6">
                  {/* Success Response */}
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                    <div className="font-medium">Request successful!</div>
                    <div className="text-sm mt-1">
                      Processing time: {result.processingTime}ms • 
                      Credits remaining: {result.creditsRemaining}
                    </div>
                  </div>

                  {/* File Preview */}
                  {activeTab === 'screenshot' && result.screenshot && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Preview</h4>
                        <div className="flex space-x-2">
                          <a
                            href={`http://localhost:8000${result.screenshot.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 p-2 rounded-md hover:bg-primary-50 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={`http://localhost:8000${result.screenshot.filePath}`}
                          alt="Screenshot result"
                          className="w-full max-h-96 object-contain bg-gray-50"
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Size: {(result.screenshot.size / 1024).toFixed(1)} KB • 
                        Format: {result.screenshot.format.toUpperCase()} • 
                        Dimensions: {result.screenshot.dimensions.width}×{result.screenshot.dimensions.height}
                      </div>
                    </div>
                  )}

                  {activeTab === 'pdf' && result.pdf && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">PDF Generated</h4>
                        <div className="flex space-x-2">
                          <a
                            href={`http://localhost:8000${result.pdf.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      </div>
                      <div className="bg-gray-100 border border-gray-200 rounded-md p-8 text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">PDF file generated successfully</p>
                        <p className="text-sm text-gray-500">
                          Size: {(result.pdf.size / 1024).toFixed(1)} KB • Format: {result.pdf.options.format}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* JSON Response */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Response JSON</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto max-h-64">
                      <code>{JSON.stringify(result, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              )}

              {!result && !loading && !error && (
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure your request and click Execute to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;