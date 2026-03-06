# MongoDB to PostgreSQL Migration Guide

## Migration Complete! ✅

Your Finance Tracker has been successfully migrated from **MongoDB** to **PostgreSQL** using **Sequelize** ORM.

### What Changed

1. **Database Driver**: MongoDB → PostgreSQL
2. **ORM**: Mongoose → Sequelize
3. **Models**: Updated User and Transaction models to use Sequelize
4. **Controllers**: Updated auth and transaction controllers to use Sequelize query methods
5. **Configuration**: New PostgreSQL connection setup in `config/db.js`

### Prerequisites

Before running the application, ensure PostgreSQL is installed and running:

**Windows:**
```bash
# Check if PostgreSQL is running
# On Windows, PostgreSQL typically runs as a service
```

**macOS (with Homebrew):**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo service postgresql start
```

### Initial Setup

1. **Create the PostgreSQL Database:**
   ```bash
   psql -U postgres -c "CREATE DATABASE finance_tracker;"
   ```

2. **Update `.env` file** (if needed):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=finance_tracker
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start the Server:**
   ```bash
   npm run dev
   ```

   The server will automatically:
   - Connect to PostgreSQL
   - Create tables (User and Transaction)
   - Log "PostgreSQL Connected" and "Database synchronized"

### Reset Database

To clear all data and reset the database:

```bash
npm run reset-db
```

This command:
- Drops all tables
- Recreates all tables with fresh schema
- Clears all user and transaction data

### Model Changes

#### User Model
- ✅ UUID primary key (instead of ObjectId)
- ✅ All fields mapped to PostgreSQL
- ✅ Timestamps support

#### Transaction Model
- ✅ UUID primary key
- ✅ Foreign key relationship to User
- ✅ ENUM types for category, type, and recurringFrequency
- ✅ Array support for tags
- ✅ Decimal type for amount (to avoid floating-point issues)

### SQL Generated

The models create these tables:

**Users Table:**
```sql
CREATE TABLE "Users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Transactions Table:**
```sql
CREATE TABLE "Transactions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "Users"(id),
  category ENUM NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  type ENUM NOT NULL,
  description VARCHAR DEFAULT '',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[] DEFAULT '{}',
  "isRecurring" BOOLEAN DEFAULT FALSE,
  "recurringFrequency" ENUM,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints (Unchanged)

All API endpoints remain the same:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/transactions`
- `GET /api/transactions`
- `GET /api/transactions/stats`
- `GET /api/transactions/:id`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Troubleshooting

**Connection Error:**
```
PostgreSQL connection failed: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in `.env`

**Database Doesn't Exist:**
```sql
CREATE DATABASE finance_tracker;
```

**Permission Denied:**
- Update DB_USER and DB_PASSWORD in `.env`
- Ensure the PostgreSQL user has creation privileges

### Next Steps

1. Test the application with new PostgreSQL backend
2. Verify all CRUD operations work correctly
3. Check authentication flows
4. Monitor performance with PostgreSQL queries

---

**Migration Date:** March 6, 2026
**Status:** ✅ Complete and Ready for Testing
