# 🦖 Dino Mail - Phase 2: Frontend Integration Guide

## Overview

Phase 2 connects your frontend to the backend API, replacing localStorage with real API calls.

### What Changed

✅ **Replaced localStorage** → All data now comes from backend  
✅ **Added countdown timers** → Email expiration displayed in real-time  
✅ **Real message display** → Shows actual sender, subject, received time  
✅ **Polling updates** → Auto-refreshes inbox every 3 seconds  
✅ **Better UX** → Toast notifications, loading states, modal for message viewing  
✅ **Online/offline support** → Handles connection loss gracefully  
✅ **Session management** → Anonymous users get persistent sessions  

---

## 🚀 Quick Start

### 1. **Start Your Backend**

```bash
cd backend
npm install
npm run dev
```

Backend should be running on: `http://localhost:5000`

### 2. **Frontend is Already Ready**

The frontend files are already updated:
- `api.js` - API service layer (new)
- `script.js` - Complete rewrite with API integration
- `style.css` - Enhanced UI with new components
- `index.html` - Updated structure

### 3. **Test the Integration**

Open `index.html` in your browser (or use Live Server):
```bash
# If using VS Code Live Server:
# Right-click index.html → Open with Live Server
```

---

## 🔧 Configuration

### API URL

By default, frontend looks for API at `http://localhost:5000/api`

**To change API URL:**
1. Edit the `API_BASE_URL` in `api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

Or set environment variable:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### CORS Configuration (Backend)

Make sure backend allows your frontend URL in `.env`:
```
FRONTEND_URL=http://localhost:3000
```

---

## 📝 New Features Explained

### 1. **Countdown Timer**
Displays remaining time before email expires. Updates every second.
- Shows hours/minutes for > 1 minute
- Shows seconds in red when < 1 minute
- Shows "Email expired" when time's up

### 2. **Real-time Inbox (Polling)**
Checks for new messages every 3 seconds automatically.
- No manual refresh needed
- Polls stop when email expires
- Resumes when new email created

### 3. **Message Preview**
Click any email to see full content in modal.
- Shows sender, subject, received time
- Displays full message body (plain text or HTML)
- Click X to close modal

### 4. **Toast Notifications**
Shows quick feedback for all actions.
- Green = Success
- Red = Error
- Orange = Loading
- Blue = Info

### 5. **Session Management**
Anonymous users get auto-assigned sessions.
- Stored in localStorage
- Sent to backend in every request header
- Allows multiple browser tabs for same user

---

## 🧪 Testing Workflow

### Test 1: Generate Random Email
1. Click "Generate Random"
2. Should see email address with blue background
3. Countdown timer appears below
4. Inbox refreshes automatically

### Test 2: Create Custom Email
1. Enter username (e.g., "myemail123")
2. Click "Create My Mail"
3. Email should appear with custom name

### Test 3: Send Test Email (Use Mailgun)
To actually receive emails, configure Mailgun:
1. Send email to your Dino Mail address
2. Should appear in inbox within seconds
3. Shows sender, subject, received time

### Test 4: View Message
1. Click any email in inbox
2. Modal opens showing full content
3. Can read message body

### Test 5: Delete Email
1. Click "🗑️ Delete" button
2. Confirm deletion
3. Email and inbox clear

### Test 6: Multiple Tabs
1. Open frontend in 2 browser tabs
2. Generate email in Tab 1
3. Create another email in Tab 2
4. Each tab has different session ID
5. Each can manage own emails independently

---

## 🐛 Troubleshooting

### "Connection lost" Error
**Problem**: Backend not running  
**Solution**: 
```bash
cd backend
npm run dev
```

### CORS Error in Console
**Problem**: Backend CORS not configured for frontend URL  
**Solution**: Update backend `.env`:
```
FRONTEND_URL=http://localhost:3000
```

### Polling Not Working
**Problem**: Inbox not auto-refreshing  
**Solution**:
1. Check browser console for errors
2. Verify backend is receiving requests
3. Restart backend if needed

### Session Not Persisting
**Problem**: Email disappears on page refresh  
**Solution**: Check if localStorage is enabled in browser

### Cannot Copy Email
**Problem**: Clipboard API requires HTTPS in production  
**Solution**: Works fine on localhost, test on HTTPS in production

---

## 📊 API Endpoints Being Used

| Endpoint | Method | Used For |
|----------|--------|----------|
| `/emails/generate-random` | POST | Create random email |
| `/emails/generate-custom` | POST | Create custom email |
| `/inbox/:email` | GET | Load messages |
| `/inbox/message/:id` | GET | Full message content |
| `/emails/:email/delete` | POST | Delete email |
| `/health` | GET | Check backend status |

---

## 🎨 UI Enhancements

### New Components
- **Email countdown timer** - Real-time expiration display
- **Message modal** - Full email content view
- **Toast notifications** - Action feedback
- **Loading states** - Visual feedback during API calls
- **Unread badges** - Indicates unread messages
- **Connection status** - Shows when offline

### Keyboard Shortcuts
- `Enter` in custom name field → Create email

---

## 🔒 Security Notes

- ✅ HTML escaping prevents XSS attacks
- ✅ Input validation on all fields
- ✅ Session IDs are random and unique
- ✅ No sensitive data in localStorage except session ID
- ✅ HTTPS recommended for production

---

## 💾 Data Flow

```
User Action
    ↓
Frontend (script.js)
    ↓
API Service (api.js)
    ↓
Backend API
    ↓
MongoDB Database
    ↓
Response back to Frontend
    ↓
UI Update
```

---

## 🚀 Next Steps

1. ✅ Frontend Integration (Phase 2) - DONE!
2. 📋 Next: Phase 3 - Premium Features
   - User authentication
   - Payment integration (Stripe/PayPal)
   - Premium tiers with different limits
   - Email forwarding feature
   - Download as PDF

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check backend logs (terminal running `npm run dev`)
3. Verify both frontend and backend are running
4. Verify API URL is correct
5. Check `.env` configuration

---

## ✨ Enjoy Dino Mail Phase 2!

Your temporary email service is now fully integrated with a real backend! 🎉

**Test everything and report any issues before moving to Phase 3.**
