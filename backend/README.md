# 🦖 Dino Mail Backend - Phase 1

A Node.js/Express backend API for temporary email service with MongoDB and Mailgun integration.

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ LTS
- MongoDB Atlas account (free tier)
- Mailgun account (free tier)
- npm or yarn

### Quick Start

1. **Clone/Navigate to project**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dinomaildb
   MAILGUN_API_KEY=key-xxxxxxxxxxxx
   MAILGUN_DOMAIN=sandboxxxx.mailgun.org
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

---

## ⚙️ Configuration

### MongoDB Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (free tier available)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
5. Add database name: `dinomaildb`

### Mailgun Setup
1. Go to [Mailgun](https://www.mailgun.com)
2. Sign up free account
3. Create domain or use sandbox
4. Get API Key from settings
5. Add webhook URL in Mailgun dashboard:
   - **Delivered**: `https://your-api.com/api/webhooks/mailgun/delivered`
   - **Failed**: `https://your-api.com/api/webhooks/mailgun/failed`

---

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```
Server runs with nodemon (auto-reload on file changes)

### Production Mode
```bash
npm start
```

### Check if server is running
```bash
curl http://localhost:5000/health
```

---

## 📡 API Endpoints

### Generate Random Email
```http
POST /api/emails/generate-random
Content-Type: application/json
X-Session-ID: session_xxxxx

{
  "lifetime": "24hours"
}
```

**Response (201):**
```json
{
  "success": true,
  "email": {
    "address": "abc123def456@dinomail.com",
    "expiresAt": "2026-03-26T15:30:00Z",
    "lifetime": "24hours",
    "createdAt": "2026-03-25T15:30:00Z"
  }
}
```

---

### Generate Custom Email
```http
POST /api/emails/generate-custom
Content-Type: application/json
X-Session-ID: session_xxxxx

{
  "customName": "john123",
  "lifetime": "24hours"
}
```

**Response (201):**
```json
{
  "success": true,
  "email": {
    "address": "john123@dinomail.com",
    "expiresAt": "2026-03-26T15:30:00Z",
    "lifetime": "24hours"
  }
}
```

---

### Get Inbox
```http
GET /api/inbox/john123@dinomail.com
```

**Response (200):**
```json
{
  "success": true,
  "email": {
    "address": "john123@dinomail.com",
    "messageCount": 2,
    "expiresAt": "2026-03-26T15:30:00Z"
  },
  "messages": [
    {
      "sender": "no-reply@facebook.com",
      "senderName": "no-reply",
      "subject": "Verify your account",
      "receivedAt": "2026-03-25T14:00:00Z",
      "read": false
    }
  ]
}
```

---

### Delete Email
```http
POST /api/emails/john123@dinomail.com/delete
X-Session-ID: session_xxxxx
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email address deleted successfully"
}
```

---

### Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-25T15:30:00Z"
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test with Postman
1. Import `postman_collection.json` (if available)
2. Set environment variables
3. Run requests

### Manual Testing

**Generate Email:**
```bash
curl -X POST http://localhost:5000/api/emails/generate-random \
  -H "Content-Type: application/json" \
  -d '{"lifetime":"24hours"}'
```

**Get Inbox:**
```bash
curl http://localhost:5000/api/inbox/test@dinomail.com
```

---

## 📤 Deployment

### Deploy to Heroku
```bash
# Install Heroku CLI
heroku create dino-mail-api
git push heroku main
```

### Deploy to DigitalOcean
```bash
# Create App Platform app
doctl apps create --spec app.yaml
```

### Deploy to AWS
```bash
# Use Elastic Beanstalk or Lambda
eb create dino-mail
```

### Environment Variables for Production
```
MONGODB_URI=mongodb+srv://prod-user:prod-pass@prod-cluster...
MAILGUN_API_KEY=prod-key-xxx
MAILGUN_DOMAIN=dinomail.com
NODE_ENV=production
FRONTEND_URL=https://dinomail.com
SESSION_SECRET=use-strong-random-key
```

---

## 📂 Project Structure

```
backend/
├── config/           # Configuration files
│   ├── database.js
│   ├── mailgun.js
│   └── environment.js
├── models/           # MongoDB schemas
│   ├── User.js
│   ├── Email.js
│   └── Message.js
├── controllers/      # Business logic
│   ├── emailController.js
│   ├── inboxController.js
│   └── webhookController.js
├── routes/           # API routes
│   ├── emails.js
│   ├── inbox.js
│   └── webhooks.js
├── middleware/       # Custom middleware
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── session.js
├── utils/            # Utility functions
│   ├── logger.js
│   ├── validators.js
│   └── emailGenerator.js
├── jobs/             # Scheduled jobs
│   └── cleanup.js
├── server.js         # Main server file
├── package.json
├── .env.example
└── README.md
```

---

## 🔒 Security Considerations

- ✅ Rate limiting enabled (100 req/15min for general, 10/min for email generation)
- ✅ CORS configured for frontend URL only
- ✅ Input validation on all endpoints
- ✅ MongoDB injection protection via Mongoose
- ✅ Error messages don't expose stack traces in production
- ⚠️ TODO: Add authentication/JWT for premium features
- ⚠️ TODO: Add HTTPS enforcement in production
- ⚠️ TODO: Add request signing for webhook verification

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check connection string in `.env`
- Add your IP to MongoDB Atlas whitelist
- Verify database credentials

### Mailgun Webhooks Not Working
- Verify domain is active in Mailgun
- Check webhook URL is publicly accessible
- Ensure Mailgun API key is correct
- Test webhook from Mailgun dashboard

### Rate Limit Errors
- Limit is 100 requests per 15 minutes globally
- Email generation is limited to 10 per minute
- Wait before making new requests

---

## 📚 Next Steps

1. Integrate with frontend (Phase 2)
2. Add user authentication/JWT
3. Implement premium tiers
4. Add email forwarding feature
5. Create admin dashboard
6. Set up monitoring & logging

---

## 📄 License

MIT License - see LICENSE file

---

## 👤 Author

Dino Mail Team

---

**Ready to go live? Follow deployment guide above! 🚀**
