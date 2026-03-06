# Finance Tracker Backend

This backend uses **Express.js** with **MongoDB** via Mongoose.

## Getting Started

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database setup**
   - Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017`.
   - If you don't have MongoDB installed, download it from https://www.mongodb.com/atlas or install locally with your package manager.
   - Alternatively use MongoDB Atlas: create a cluster and update `config/db.js` with the connection string.

3. **Run the server**
   ```bash
   npm start
   ```

   The server listens on port 5000 by default.

4. **Environment variables**
   - Copy `.env.example` to `.env` and adjust values as needed.
   - The connection string defined by `MONGO_URI` will override the default local URI.

## API Endpoints

- `POST /api/auth/register` - register a new user; returns a JWT and user info
- `POST /api/auth/login` - login existing user; returns a JWT and user info

All `/api/transactions` endpoints are **protected** by JWT middleware. Include an `Authorization: Bearer <token>` header with requests.
- `GET /api/transactions` - list transactions for the authenticated user (supports query filter)
- `POST /api/transactions` - create new transaction
- `GET /api/transactions/:id` - get single transaction
- `PUT /api/transactions/:id` - update transaction
- `DELETE /api/transactions/:id` - delete transaction
- `GET /api/transactions/stats` - summary statistics

The middleware extracts the user id from the token and makes it available as `req.user` in controllers.
