# Screenshot API - Deno Version

A screenshot API service built with Deno, featuring user authentication, API key management, and screenshot generation capabilities.

## 🚀 Features

- **User Authentication** with JWT tokens
- **API Key Management** for secure access
- **Screenshot Generation** using Playwright
- **Deno KV Database** for data storage
- **Rate Limiting** for API protection
- **CORS Support** for web applications
- **Static File Serving** for React frontend

## 🛠️ Tech Stack

- **Runtime**: Deno
- **Database**: Deno KV (built-in key-value store)
- **Authentication**: JWT + bcrypt
- **Validation**: Zod schemas
- **Screenshot Engine**: Playwright
- **Deployment**: Deno Deploy

## 📦 Project Structure

```
ssapi/
├── deno.json              # Deno configuration
├── src/
│   ├── server.ts          # Main Deno server
│   ├── db/kv.ts          # Deno KV database layer
│   ├── utils/
│   │   ├── auth.ts       # JWT and password utilities
│   │   └── validation.ts # Zod schema validation
├── ui/                   # React frontend
└── uploads/              # Screenshot storage
```

## 🔧 Development

### Prerequisites

- [Deno](https://deno.land/) installed
- Node.js (for React frontend build)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/critcoder/ssapi-deno.git
cd ssapi-deno
```

2. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
deno task dev
```

4. Build React frontend (if needed):
```bash
cd ui
npm install
npm run build
```

### Environment Variables

```env
PORT=8000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🚀 Deployment

### Deno Deploy

1. Install deployctl:
```bash
deno install -Arf --global jsr:@deno/deployctl
```

2. Deploy:
```bash
deployctl deploy --project=ssapi --entrypoint=src/server.ts
```

3. Set environment variables in Deno Deploy dashboard

## 📖 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Screenshots

- `POST /api/screenshots` - Create screenshot
- `GET /api/screenshots` - List user screenshots

### Health Check

- `GET /health` - Server health status

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 License

MIT License

## 👨‍💻 Author

**critcoder** (suumitgeek24@gmail.com)

---

Powered by [Deno](https://deno.land/) and [Deno Deploy](https://deno.com/deploy)