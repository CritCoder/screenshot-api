# Screenshot API - Postman Documentation

This directory contains comprehensive Postman collections for the Screenshot API SaaS service.

## 📁 Files

### 1. `Screenshot-API-Collection.json`
Complete Postman collection with all API endpoints organized in logical folders:

- **🔐 Authentication**: User registration, login, profile management
- **🔑 API Key Management**: Create and manage API keys
- **📸 Screenshots**: All screenshot endpoints with various options
- **📄 PDF Generation**: PDF creation with customization options
- **📊 Usage & Analytics**: Request history and usage statistics
- **🏥 Health & Status**: Service health checks

### 2. `Screenshot-API-Environment.json`
Environment configuration with:
- Base URL configuration
- Auto-populated tokens and API keys
- Test user credentials
- Environment-specific variables

### 3. `Screenshot-API-Tests.json`
Automated test suite with:
- Full API workflow tests
- Error handling validation
- Rate limiting tests
- Response validation

## 🚀 Getting Started

### Import Collections

1. **Import Main Collection**:
   - Open Postman
   - Click "Import" → "Upload Files"
   - Select `Screenshot-API-Collection.json`

2. **Import Environment**:
   - Go to "Environments" tab
   - Click "Import" → Select `Screenshot-API-Environment.json`
   - Set as active environment

3. **Import Test Suite** (Optional):
   - Import `Screenshot-API-Tests.json` for automated testing

### Quick Setup

1. **Start the API server**:
   ```bash
   npm run dev
   ```

2. **Set Environment**:
   - Select "Screenshot API - Local" environment
   - Verify `baseUrl` is set to `http://localhost:3000/api`

3. **Register & Get API Key**:
   - Run "Register User" request
   - JWT token and API key will be auto-saved to environment
   - You're ready to take screenshots!

## 📚 Collection Structure

```
Screenshot API SaaS/
├── 🔐 Authentication/
│   ├── Register User
│   ├── Login User
│   └── Get User Profile
├── 🔑 API Key Management/
│   ├── Create API Key
│   └── Delete API Key
├── 📸 Screenshots/
│   ├── Basic Screenshot
│   ├── Full Page Screenshot
│   ├── Element Screenshot
│   ├── Mobile Device Screenshot
│   └── Advanced Screenshot Options
├── 📄 PDF Generation/
│   ├── Basic PDF
│   └── Custom PDF Options
├── 📊 Usage & Analytics/
│   ├── Get Request History
│   └── Get Usage Statistics
└── 🏥 Health & Status/
    └── Health Check
```

## 🔧 Environment Variables

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API base URL | ❌ |
| `jwt_token` | Authentication token | ✅ |
| `api_key` | API key for requests | ✅ |
| `api_key_id` | API key ID for deletion | ❌ |
| `test_email` | Test user email | ❌ |
| `test_password` | Test user password | ❌ |
| `test_name` | Test user name | ❌ |

## 📖 Usage Examples

### 1. Basic Workflow

1. **Health Check**: Verify API is running
2. **Register User**: Create account → Gets JWT + API key
3. **Take Screenshot**: Use API key to capture webpage
4. **Check History**: View request history
5. **Monitor Usage**: Track credits and usage

### 2. Screenshot Options

**Basic Screenshot**:
```json
{
  "url": "https://example.com",
  "format": "png",
  "width": 1920,
  "height": 1080
}
```

**Full Page with Wait**:
```json
{
  "url": "https://example.com",
  "fullPage": true,
  "waitFor": 2000,
  "scrollToBottom": true
}
```

**Mobile Device**:
```json
{
  "url": "https://example.com",
  "device": "iPhone 12",
  "format": "png"
}
```

**Element Capture**:
```json
{
  "url": "https://example.com",
  "selector": "#main-content",
  "format": "png"
}
```

### 3. PDF Generation

**Basic PDF**:
```json
{
  "url": "https://example.com",
  "format": "A4",
  "landscape": false
}
```

**Custom Options**:
```json
{
  "url": "https://example.com",
  "format": "Letter",
  "landscape": true,
  "margin": {
    "top": "2cm",
    "bottom": "2cm",
    "left": "1.5cm",
    "right": "1.5cm"
  },
  "scale": 0.8
}
```

## 🧪 Testing

### Run Full Test Suite

1. Import `Screenshot-API-Tests.json`
2. Select "Screenshot API - Local" environment
3. Right-click collection → "Run collection"
4. Tests will automatically:
   - Check API health
   - Register test user
   - Take screenshots and PDFs
   - Verify responses
   - Test error handling

### Individual Tests

Each request includes test scripts that automatically validate:
- Response status codes
- Response structure
- Data types and values
- Environment variable updates

## 🔍 Request Examples

### Authentication
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

### Screenshot
```http
POST /api/screenshots
X-API-Key: sk_your_api_key_here
Content-Type: application/json

{
  "url": "https://example.com",
  "format": "png",
  "fullPage": true
}
```

### PDF
```http
POST /api/screenshots/pdf
X-API-Key: sk_your_api_key_here
Content-Type: application/json

{
  "url": "https://example.com",
  "format": "A4",
  "landscape": false
}
```

## 🔒 Security Notes

- JWT tokens expire after 24 hours
- API keys are stored as secret variables
- Rate limiting prevents abuse
- All requests are logged and tracked

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**:
   - Check API key is set in environment
   - Verify JWT token hasn't expired

2. **429 Too Many Requests**:
   - Wait for rate limit window to reset
   - Check rate limiting rules

3. **500 Server Error**:
   - Verify API server is running
   - Check server logs for errors

### Debug Tips

- Enable Postman Console for request/response logs
- Check environment variables are set correctly
- Verify server is running on correct port
- Review test scripts for validation logic

## 📞 Support

For API issues:
- Check server logs
- Review API documentation in README.md
- Verify environment configuration
- Test with health check endpoint first

Happy testing! 🚀