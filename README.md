# Finance Tracker

This is a full-stack finance tracking application built with React (frontend) and Node/Express (backend) using MongoDB for data storage.

## Setup

### Backend

see `backend/README.md` for detailed instructions including database setup.

### Frontend

From project root:
```bash
cd frontend
npm install
npm run dev
```

The React app will run on Vite default port (typically 5173).

## Features

- User authentication (register/login) – placeholder
- Add, edit, delete transactions
- Filter by income/expense
- Transaction detail modal with edit/delete
- Analytics dashboard with totals and trends
- Floating action button to add a transaction
- Responsive UI with animations

## Database

Uses MongoDB via Mongoose; connection string configurable with `MONGO_URI` environment variable.

## Future Enhancements

- Real authentication with JWT
- Recurring transactions
- Export reports (CSV/PDF)
- Mobile-friendly responsive tweaks
- Integration with third-party financial APIs

Enjoy building your finance tracker!