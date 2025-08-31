# Screenshot API SaaS

A powerful screenshot and PDF generation API built with Playwright, Express.js, and Prisma.

## Features

- 🖼️ **Screenshot Capture**: Full page, element-specific, or viewport screenshots
- 📄 **PDF Generation**: Convert web pages to PDF with customizable options
- 🔐 **User Authentication**: JWT-based auth with API key management
- 📊 **Usage Tracking**: Monitor API usage and credit consumption
- 🚦 **Rate Limiting**: Built-in rate limiting for API protection
- 🎨 **Multiple Formats**: PNG, JPEG, WebP support
- 📱 **Device Simulation**: Capture screenshots from different device viewports
- 🌐 **Multi-Browser**: Support for Chromium, Firefox, and WebKit

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   npm run db:push
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Screenshots

#### Take Screenshot
```http
POST /api/screenshots
X-API-Key: <your_api_key>
Content-Type: application/json

{
  "url": "https://example.com",
  "format": "png",
  "width": 1920,
  "height": 1080,
  "fullPage": true,
  "waitFor": 2000,
  "browser": "chromium"
}
```

**Options:**
- `url` (required): Target URL
- `format`: `png`, `jpeg`, `webp` (default: `png`)
- `quality`: 1-100 for JPEG (default: 80)
- `width`: Viewport width (default: 1920)
- `height`: Viewport height (default: 1080)
- `fullPage`: Capture full page (default: false)
- `waitFor`: Wait time in ms (default: 0)
- `selector`: CSS selector for element capture
- `device`: Device preset (`iPhone 12`, `iPad Pro`, etc.)
- `browser`: `chromium`, `firefox`, `webkit` (default: `chromium`)
- `scrollToBottom`: Auto-scroll before capture (default: false)
- `hideElements`: Array of CSS selectors to hide
- `timeout`: Request timeout in ms (default: 30000)

#### Generate PDF
```http
POST /api/screenshots/pdf
X-API-Key: <your_api_key>
Content-Type: application/json

{
  "url": "https://example.com",
  "format": "A4",
  "landscape": false,
  "printBackground": true,
  "margin": {
    "top": "1cm",
    "bottom": "1cm",
    "left": "1cm",
    "right": "1cm"
  }
}
```

#### Get Request History
```http
GET /api/screenshots/history?page=1&limit=50&type=screenshot&status=completed
X-API-Key: <your_api_key>
```

#### Get Usage Statistics
```http
GET /api/screenshots/usage?month=2024-01
X-API-Key: <your_api_key>
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL="file:./dev.db"
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const takeScreenshot = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/screenshots', {
      url: 'https://example.com',
      fullPage: true,
      format: 'png'
    }, {
      headers: {
        'X-API-Key': 'your_api_key_here'
      }
    });

    console.log('Screenshot taken:', response.data.screenshot.filePath);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### cURL
```bash
curl -X POST http://localhost:3000/api/screenshots \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "fullPage": true,
    "format": "png"
  }'
```

### Python
```python
import requests

def take_screenshot():
    headers = {
        'X-API-Key': 'your_api_key_here',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'url': 'https://example.com',
        'fullPage': True,
        'format': 'png'
    }
    
    response = requests.post(
        'http://localhost:3000/api/screenshots',
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        print('Screenshot taken:', response.json()['screenshot']['filePath'])
    else:
        print('Error:', response.json())
```

## Advanced Features

### Element-Specific Screenshots
```json
{
  "url": "https://example.com",
  "selector": ".main-content",
  "format": "png"
}
```

### Device Simulation
```json
{
  "url": "https://example.com",
  "device": "iPhone 12",
  "format": "png"
}
```

### Auto-Scroll Screenshots
```json
{
  "url": "https://example.com",
  "scrollToBottom": true,
  "fullPage": true
}
```

### Hide Elements
```json
{
  "url": "https://example.com",
  "hideElements": [".ads", ".popup", "#cookie-banner"]
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid API key/token)
- `402`: Payment Required (insufficient credits)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limits

- Authentication endpoints: 10 requests per 15 minutes per IP
- API endpoints: 100 requests per 15 minutes per IP  
- Screenshot endpoints: 10 requests per minute per IP

## Credits System

- Free plan: 100 credits per month
- Each screenshot/PDF costs 1 credit
- Credits reset monthly

## Development

```bash
# Start in development mode
npm run dev

# Generate Prisma client
npm run db:generate

# Apply database changes
npm run db:push

# Create and apply migrations
npm run db:migrate

# Run tests
npm test
```

## License

MIT License