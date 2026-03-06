# Quick Start Guide

Get the Finance Tracker running in 5 minutes!

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- A code editor

## 1. Backend Setup (Terminal 1)

```bash
cd backend

# Copy env file
copy .env.example .env

# Edit .env if needed (defaults should work for local MongoDB)
# MONGO_URI=mongodb://127.0.0.1:27017/financeTracker
# JWT_SECRET=your_secret_key (can use default)

# Install dependencies
npm install

# Start server
npm start
```

**Expected output:**
```
Server running on port 5000
Available routes:
  GET  /api/health
  POST /api/auth/register
  POST /api/auth/login
  ...
```

## 2. Frontend Setup (Terminal 2)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Expected output:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

## 3. Access the App

Open browser to **http://localhost:5173**

## First Steps

### Create an Account
1. Click "Register" link (or visit `/register`)
2. Fill in name, email, password
3. Click "Register"
4. You'll be automatically logged in and redirected to Dashboard

### Add a Transaction
1. Click the **floating "+" button** (bottom-right)
2. Choose transaction type (Income/Expense)
3. Select a category
4. Enter amount and optional description
5. Click "Add Transaction"

### View Transactions
1. Go to "Transactions" in navbar
2. Use filter buttons to view All, Income, or Expense
3. Click a transaction to see details and edit/delete options
4. Click "Edit" to update, "Delete" to remove

### Check Dashboard
- View income, expenses, and balance
- See expense breakdown by category
- Check recent transactions
- Track savings goals

## Troubleshooting

### Backend won't start
- **Error: ENOENT .env** → Run `copy .env.example .env`
- **MongoDB connection error** → Ensure MongoDB is running
  - Local: `mongod` or check MongoDB Compass
  - Atlas: Update MONGO_URI in .env with your connection string

### Frontend won't start
- **Port 5173 already in use** → Kill process or set PORT env var
- **Cannot find module** → Run `npm install` in frontend folder

### Login not working
- **"Invalid credentials"** → Check email/password spelling
- **No response from backend** → Ensure backend is running on port 5000
- **Token not stored** → Check browser DevTools → Application → localStorage

### API returns 401 Unauthorized
- **Expired token** → Login again to refresh token
- **Missing token** → Clear localStorage and login again
- **Invalid token format** → Restart browser

## Development Tips

### Check if backend is running
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"Server is running"}
```

### Test login API directly
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### View MongoDB data
Use MongoDB Compass or Atlas UI to inspect collections:
- `users` collection → registered accounts
- `transactions` collection → all transactions

## Next Steps

After getting the app running:
1. Read [AUTH_SETUP.md](AUTH_SETUP.md) for authentication details
2. Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for full feature list
3. See [backend/README.md](backend/README.md) for API documentation
4. See [frontend/README.md](frontend/README.md) for frontend details

## Common Commands

```bash
# Backend
cd backend
npm start          # Start server
npm run dev        # Start with nodemon (auto-reload)

# Frontend
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## File Structure Quick Reference

```
finance-tracker/
├── backend/           # Node/Express API
│   └── server.js     # Main server file
├── frontend/          # React/Vite app
│   └── src/
│       ├── pages/    # Page components
│       ├── api/      # API helpers
│       └── App.jsx   # Main app component
├── AUTH_SETUP.md     # Detailed auth guide
└── IMPLEMENTATION_SUMMARY.md
```

---

**Having issues?** Check the troubleshooting section above or review the detailed docs in AUTH_SETUP.md and IMPLEMENTATION_SUMMARY.md.

Happy tracking! 💰
