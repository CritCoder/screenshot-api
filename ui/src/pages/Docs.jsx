import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Code, 
  Key, 
  Camera, 
  FileText, 
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Key },
    { id: 'screenshot-api', label: 'Screenshot API', icon: Camera },
    { id: 'pdf-api', label: 'PDF Generation', icon: FileText },
    { id: 'parameters', label: 'Parameters', icon: Code },
    { id: 'responses', label: 'Responses', icon: CheckCircle },
    { id: 'errors', label: 'Error Codes', icon: AlertTriangle },
    { id: 'sdk-examples', label: 'SDK Examples', icon: Book }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSidebarOpen(false); // Close sidebar on mobile after clicking
    }
  };

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let current = 'getting-started';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          current = section.getAttribute('data-section');
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CodeBlock = ({ children, language = 'bash', copyable = true }) => (
    <div className="relative">
      <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 dark:text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{children}</code>
      </pre>
      {copyable && (
        <button
          onClick={() => copyToClipboard(children)}
          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-300 rounded"
          title="Copy code"
        >
          <Copy className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const EndpointCard = ({ method, endpoint, description, children }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          method === 'POST' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {method}
        </span>
        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {endpoint}
        </code>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      {children}
    </div>
  );


  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-16 bottom-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <nav className="space-y-1">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex-1 w-full max-w-none">
      <MobileSidebar />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 fixed left-0 top-16 bottom-0 z-20">
          <div className="h-full overflow-y-auto p-6">
            <div className="sticky top-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-l-2 border-primary-500'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="text-sm font-medium">Table of Contents</span>
            </button>
          </div>

          <div className="max-w-4xl mx-auto lg:max-w-none lg:mx-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete guide to using the ScreenAPI for capturing screenshots and generating PDFs
          </p>
        </div>

        {/* Getting Started */}
        <section id="getting-started" data-section="getting-started" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Key className="h-6 w-6" />
            Getting Started
          </h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">Authentication</h3>
                <p className="text-blue-800 dark:text-blue-300 mb-4">
                  All API requests require authentication using your API key. You can include it in the request header or as a URL parameter.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-mono text-blue-800 dark:text-blue-300">Header: <code>X-API-Key: your_api_key_here</code></p>
                  <p className="text-sm font-mono text-blue-800 dark:text-blue-300">URL: <code>?api_key=your_api_key_here</code></p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Base URL</h3>
              <CodeBlock copyable={true}>http://localhost:3000/api</CodeBlock>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Rate Limits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">100 requests per 15 minutes</p>
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section id="screenshot-api" data-section="screenshot-api" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Screenshot API
          </h2>

          <EndpointCard 
            method="POST" 
            endpoint="/screenshots" 
            description="Capture a screenshot of any webpage with advanced options"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Request Body</h4>
            <CodeBlock language="json">
{`{
  "url": "https://example.com",
  "format": "png",
  "width": 1920,
  "height": 1080,
  "fullPage": false,
  "waitFor": 0,
  "selector": null,
  "device": null,
  "browser": "chromium",
  "scrollToBottom": false,
  "hideElements": [],
  "timeout": 30000,
  "quality": 80
}`}
            </CodeBlock>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 mt-6">cURL Example</h4>
            <CodeBlock>
{`curl -X POST http://localhost:3000/api/screenshots \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "format": "png",
    "width": 1920,
    "height": 1080,
    "fullPage": true
  }'`}
            </CodeBlock>
          </EndpointCard>

          <EndpointCard 
            method="GET" 
            endpoint="/screenshots" 
            description="Capture a screenshot using URL parameters (simpler for basic use cases)"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">cURL Example</h4>
            <CodeBlock>
{`curl -X GET "http://localhost:3000/api/screenshots?url=https://example.com&format=png&width=1920&height=1080&fullPage=true&api_key=your_api_key_here"`}
            </CodeBlock>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 mt-6">JavaScript Example</h4>
            <CodeBlock language="javascript">
{`const params = new URLSearchParams({
  url: 'https://example.com',
  format: 'png',
  width: '1920',
  height: '1080',
  fullPage: 'true',
  api_key: 'your_api_key_here'
});

const response = await fetch('http://localhost:3000/api/screenshots?' + params);
const result = await response.json();`}
            </CodeBlock>
          </EndpointCard>
        </section>

        {/* PDF Generation */}
        <section id="pdf-api" data-section="pdf-api" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            PDF Generation API
          </h2>

          <EndpointCard 
            method="POST" 
            endpoint="/screenshots/pdf" 
            description="Generate a PDF from any webpage with customizable formatting"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Request Body</h4>
            <CodeBlock language="json">
{`{
  "url": "https://example.com",
  "format": "A4",
  "landscape": false,
  "printBackground": true,
  "scale": 1,
  "margin": {
    "top": "1cm",
    "bottom": "1cm",
    "left": "1cm",
    "right": "1cm"
  },
  "waitFor": 0,
  "timeout": 30000
}`}
            </CodeBlock>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 mt-6">cURL Example</h4>
            <CodeBlock>
{`curl -X POST http://localhost:3000/api/screenshots/pdf \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "format": "A4",
    "landscape": false,
    "printBackground": true
  }'`}
            </CodeBlock>
          </EndpointCard>
        </section>

        {/* Parameters */}
        <section id="parameters" data-section="parameters" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Code className="h-6 w-6" />
            Parameters Reference
          </h2>

          <div className="space-y-8">
            {/* Screenshot Parameters */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Screenshot Parameters</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Parameter</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Default</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">url</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">string</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">required</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">The webpage URL to capture</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">format</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">string</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">png</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Image format (png, jpeg, webp)</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">width</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">number</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">1920</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Viewport width (100-3840)</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">height</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">number</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">1080</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Viewport height (100-2160)</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">fullPage</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">boolean</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">false</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Capture entire page height</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">waitFor</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">number</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">0</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Wait time in milliseconds before capture</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">selector</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">string</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">null</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">CSS selector to capture specific element</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">device</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">string</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">null</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Device preset (iPhone 12, iPad Pro, etc.)</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">browser</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">string</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">chromium</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Browser engine (chromium, firefox, webkit)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PDF Parameters */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">PDF Parameters</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Parameter</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Default</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">url</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">string</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">required</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">The webpage URL to convert to PDF</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">format</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">string</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">A4</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Paper format (A4, A3, A5, Letter, Legal, Tabloid)</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">landscape</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">boolean</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">false</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Use landscape orientation</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">printBackground</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">boolean</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">true</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Include background graphics</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">scale</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">number</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">1</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Scale factor (0.1-2.0)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Response Format */}
        <section id="responses" data-section="responses" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Response Format</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Successful Response</h3>
              <CodeBlock language="json">
{`{
  "success": true,
  "screenshot": {
    "filePath": "/uploads/screenshots/screenshot_1234567890.png",
    "filename": "screenshot_1234567890.png",
    "size": 125834,
    "format": "png",
    "dimensions": {
      "width": 1920,
      "height": 1080
    }
  },
  "processingTime": 1523,
  "creditsRemaining": 99
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Error Response</h3>
              <CodeBlock language="json">
{`{
  "error": "Screenshot generation failed",
  "message": "Navigation timeout exceeded",
  "processingTime": 30000
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section id="errors" data-section="errors" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Error Codes
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Solution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-4 py-3 text-sm font-mono text-red-600 dark:text-red-400">401</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">API key required or invalid</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Check your API key is correct and active</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-3 text-sm font-mono text-red-600 dark:text-red-400">402</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Insufficient credits</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Wait for monthly credit reset or upgrade plan</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-4 py-3 text-sm font-mono text-red-600 dark:text-red-400">400</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Invalid parameters</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Check parameter values and types</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-3 text-sm font-mono text-red-600 dark:text-red-400">429</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Rate limit exceeded</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Wait before making more requests</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-4 py-3 text-sm font-mono text-red-600 dark:text-red-400">500</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Server error</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Try again or contact support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SDK Examples */}
        <section id="sdk-examples" data-section="sdk-examples" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">SDK Examples</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js</h3>
              <CodeBlock language="javascript">
{`const axios = require('axios');

const screenshot = async (url) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/screenshots',
      {
        url: url,
        format: 'png',
        fullPage: true
      },
      {
        headers: {
          'X-API-Key': 'your_api_key_here',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
};

// Usage
screenshot('https://example.com')
  .then(result => console.log(result))
  .catch(err => console.error(err));`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Python</h3>
              <CodeBlock language="python">
{`import requests
import json

def take_screenshot(url, api_key):
    endpoint = 'http://localhost:3000/api/screenshots'
    
    headers = {
        'X-API-Key': api_key,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'url': url,
        'format': 'png',
        'fullPage': True
    }
    
    try:
        response = requests.post(
            endpoint, 
            json=payload, 
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        raise

# Usage
result = take_screenshot(
    'https://example.com', 
    'your_api_key_here'
)
print(json.dumps(result, indent=2))`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Need help? Check out the <a href="/playground" className="text-primary-600 hover:text-primary-700">interactive playground</a> to test the API.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              API Version 1.0 • Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;