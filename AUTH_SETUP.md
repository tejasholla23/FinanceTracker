# Authentication Setup Guide

This document describes the JWT-based authentication system implemented in the Finance Tracker application.

## Overview

- **Tech**: JWT (JSON Web Tokens) + bcryptjs for password hashing
- **Flow**: Register/Login → Token stored in localStorage → Token included in API requests → Middleware validates
- **Token Duration**: 7 days expiration

## Backend Implementation

### Register Endpoint
**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response** (success):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "User registered successfully"
}
```

### Login Endpoint
**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response** (success):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Protected Routes (Transactions API)

All transaction endpoints require an `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

If the token is missing or invalid, the server responds with a 401 Unauthorized status.

The middleware (`authMiddleware.js`) extracts the token and verifies it, making the decoded user data available as `req.user` in controllers.

## Frontend Implementation

### Token Storage
After successful login/register, the token is stored in `localStorage`:
```javascript
localStorage.setItem("token", res.data.token);
localStorage.setItem("name", res.data.user.name);
```

### API Helper Functions
The `buildHeaders()` function automatically includes the token in all transaction requests:
```javascript
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
```

### Protected Routes
The `PrivateRoute` component wraps authenticated pages; unauthorized users are redirected to login:
```jsx
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

### Logout
Clears tokens from storage and redirects to login page:
```javascript
handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  navigate("/");
};
```

## Environment Variables

Create a `.env` file in the `backend` folder with:
```env
MONGO_URI=mongodb://127.0.0.1:27017/financeTracker
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

**Important**: Change the `JWT_SECRET` to a strong random string in production.

## Security Best Practices

1. **Password Hashing**: All passwords are hashed with bcryptjs (salt rounds: 10) before storage.
2. **Token Expiration**: Tokens expire after 7 days; implement refresh token flow for long-term sessions (future enhancement).
3. **HTTPS**: Use HTTPS in production to prevent token interception.
4. **Env Secrets**: Never hardcode secrets in code; always use environment variables.
5. **Input Validation**: Both backend and frontend validate required fields.

## Testing the System

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access protected endpoint with token
```bash
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

## Troubleshooting

- **"Unauthorized" error on API calls**: Check that token is correctly stored in localStorage and the Authorization header is properly formatted.
- **Token expired**: User will need to log in again to get a new token.
- **Password mismatch error**: Ensure password is typed correctly; bcryptjs comparison is case-sensitive.

## Future Enhancements

- Refresh token mechanism for automatic token renewal
- OAuth2 integration (Google, GitHub, etc.)
- Two-factor authentication (2FA)
- Password reset flow
- Email verification during registration
